import fetch from 'node-fetch'
import cheerio from 'cheerio'

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  if (!text) return m.reply(`🎀 Usa: *${usedPrefix + command} [nombre del personaje]*\n\nEjemplo:\n*${usedPrefix + command} Ruby Hoshino*`)

  let nombre = text.trim().toLowerCase().replace(/ /g, '+')
  let searchUrl = `https://www.sigstick.com/search?q=${nombre}`

  m.reply(`🔎 Buscando pack de stickers para *${text}*...`)

  // Buscar el primer resultado
  let res = await fetch(searchUrl)
  let html = await res.text()
  let $ = cheerio.load(html)
  let firstResult = $('a[href*="/pack/"]').attr('href')

  if (!firstResult) return m.reply(`❌ No encontré ningún pack de *${text}* en sigstick.com.`)

  let packUrl = `https://www.sigstick.com${firstResult}`
  let packPage = await fetch(packUrl)
  let packHtml = await packPage.text()
  let $$ = cheerio.load(packHtml)

  let stickers = []
  $$('img[src*="webp"]').each((i, el) => {
    let src = $$(el).attr('src')
    if (src) stickers.push(src.startsWith('http') ? src : 'https://www.sigstick.com' + src)
  })

  if (!stickers.length) return m.reply(`😿 No se encontraron stickers válidos en el pack.`)

  m.reply(`✨ Encontrado: *${packUrl}*\nEnviando ${stickers.length} stickers de *${text}*...`)

  for (let i = 0; i < Math.min(stickers.length, 10); i++) {
    let url = stickers[i]
    try {
      let res = await fetch(url)
      let buffer = await res.buffer()
      await conn.sendFile(m.chat, buffer, 'sticker.webp', '', m, { asSticker: true })
    } catch (e) {
      console.error(`❌ Error con el sticker ${i + 1}`, e)
    }
    await new Promise(r => setTimeout(r, 1000))
  }

  m.reply(`✅ Pack de *${text}* enviado completo.`)
}

handler.help = ['packsticker <personaje>']
handler.tags = ['sticker']
handler.command = ['packsticker', 'stickersig', 'stickers']

export default handler
