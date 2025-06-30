import fetch from 'node-fetch'
import cheerio from 'cheerio'

let handler = async (m, { conn, args, usedPrefix, command, text }) => {
  if (!text) return m.reply(`📦 Usa: *${usedPrefix + command} [url del pack]*\n\nEjemplo:\n${usedPrefix + command} https://www.sigstick.com/pack/ckaf7SCUYSt5fS0lZPvD`)

  if (!text.includes('sigstick.com/pack/')) return m.reply('❌ Esa URL no es válida. Asegúrate de que sea un link de *sigstick.com*')

  let res = await fetch(text)
  if (!res.ok) return m.reply('⚠️ Error al acceder a la página.')

  let html = await res.text()
  let $ = cheerio.load(html)
  let imgList = []

  $('img').each((i, el) => {
    let src = $(el).attr('src')
    if (src && src.includes('/_next/image?url=')) {
      let match = src.match(/url=([^&]+)/)
      if (match && match[1]) imgList.push(decodeURIComponent(match[1]))
    }
  })

  if (imgList.length === 0) return m.reply('❌ No se encontraron stickers en el pack.')

  m.reply(`🌟 Enviando *${imgList.length} stickers* del pack...\n💫 Fuente: sigstick.com`)

  for (let url of imgList) {
    try {
      let res = await fetch(url)
      let buffer = await res.buffer()
      await conn.sendFile(m.chat, buffer, 'sticker.webp', '', m, { asSticker: true })
      await new Promise(r => setTimeout(r, 1000)) // delay entre stickers
    } catch (e) {
      console.log('❌ Error con sticker:', e)
    }
  }

  m.reply(`✅ Pack enviado completo.`)
}

handler.help = ['packsticker <url>']
handler.tags = ['sticker']
handler.command = ['packsticker', 'stickersig']

export default handler
