// ⛩️ Comando creado por Crosby Batin para el Bot de WhatsApp

import fetch from 'node-fetch'
import { Sticker } from 'wa-sticker-formatter'

let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply(`✨ Ejemplo de uso:\n.${command} conejo blanco`)

  try {
    const searchRes = await fetch(`https://zenzxz.dpdns.org/search/stickerlysearch?query=${encodeURIComponent(text)}`)
    const searchJson = await searchRes.json()

    if (!searchJson.status || !Array.isArray(searchJson.data) || searchJson.data.length === 0)
      return m.reply('❌ No encontré paquetes de stickers con ese nombre.')

    const pick = searchJson.data[Math.floor(Math.random() * searchJson.data.length)]

    const detailUrl = `https://zenzxz.dpdns.org/tools/stickerlydetail?url=${encodeURIComponent(pick.url)}`
    const detailRes = await fetch(detailUrl)
    const detailJson = await detailRes.json()

    if (!detailJson.status || !detailJson.data || !Array.isArray(detailJson.data.stickers) || detailJson.data.stickers.length === 0)
      return m.reply('⚠️ No pude obtener los stickers del paquete.')

    const packName = detailJson.data.name || 'Sin nombre'
    const authorName = detailJson.data.author?.name || 'Desconocido'
    const total = detailJson.data.stickers.length

    await m.reply(`🧃 *Stickerly* encontrado\n\n🏷️ *Paquete:* ${packName}\n🎨 *Autor:* ${authorName}\n🧩 *Stickers:* ${total}\n📦 *Link:* ${pick.url}\n\nEnviando 5 stickers aleatorios...`)

    let maxSend = 5
    for (let i = 0; i < Math.min(total, maxSend); i++) {
      const img = detailJson.data.stickers[i]
      const sticker = new Sticker(img.imageUrl, {
        pack: 'Stickerly ✨',
        author: authorName,
        type: 'full',
        categories: ['🔥'],
        id: 'zenzxd'
      })
      const buffer = await sticker.toBuffer()
      await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
    }

  } catch (e) {
    console.error('[ERROR STICKERLY]', e)
    m.reply('😿 Error al procesar tu solicitud. Intenta de nuevo más tarde.')
  }
}

handler.help = ['stikerly <consulta>']
handler.tags = ['sticker']
handler.command = /^stikerly$/i

export default handler
