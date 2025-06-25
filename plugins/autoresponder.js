import { sticker } from '../lib/sticker.js'
let handler = m => m

// Si usas iconos y redes, define estos valores

// Utilidad para obtener un elemento aleatorio de un array
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

handler.all = async function (m, { conn }) {
  let chat = global.db.data.chats[m.chat]
  // Asegúrate que m.mentionedJid y this.user.jid existen
  if (
    Array.isArray(m.mentionedJid) &&
    this.user?.jid &&
    m.mentionedJid.includes(this.user.jid) &&
    m.isGroup &&
    !chat.isBanned
  ) {
    let noetiqueta = 'https://qu.ax/MKCm.webp'
    let or = ['texto', 'sticker'];
    let media = getRandom(or)
    if (media === 'sticker') {
      return await this.sendFile(
        m.chat,
        noetiqueta,
        'sticker.webp',
        '',
        m,
        true,
        {
          contextInfo: {
            forwardingScore: 200,
            isForwarded: false,
            externalAdReply: {
              showAdAttribution: false,
              title: 'Yo que?',
              mediaType: 2,
              sourceUrl: redes,
              thumbnail: icons
            }
          }
        },
        { quoted: m, ephemeralExpiration: 24 * 60 * 60 * 1000, disappearingMessagesInChat: 24 * 60 * 60 * 1000 }
      )
    }
    if (media === 'texto') {
      return await this.sendMessage(
        m.chat,
        { text: getRandom(['*QUE YO QUE?*', 'Que?', 'Hola?']) },
        { quoted: m, ephemeralExpiration: 24 * 60 * 60 * 1000, disappearingMessagesInChat: 24 * 60 * 60 * 1000 }
      )
    }
  }
  return !0
}

export default handler