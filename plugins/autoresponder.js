import { promises as fs } from 'fs'

// Ruta de la base de datos de personajes
const DB_PATH = './src/database/characters.json'

// Estructura de solicitudes activas
const activeTrades = {}

// Utilidad para leer personajes
async function getCharacters() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (err) {
    throw new Error(`⛔ No se pudo leer la base de datos de personajes.\n${err.message}`)
  }
}

// Utilidad para guardar personajes
async function setCharacters(chars) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(chars, null, 2), 'utf-8')
  } catch (err) {
    throw new Error(`⛔ No se pudo guardar la base de datos de personajes.\n${err.message}`)
  }
}

// Enviar ayuda
function sendHelp(conn, chatId, prefix, m) {
  return conn.reply(chatId,
    `🌸 Debes indicar los personajes para intercambiar.\n\n` +
    `Ejemplo: *${prefix}trade PersonajeA / PersonajeB*\n` +
    `Donde "PersonajeA" es tuyo y "PersonajeB" es el que deseas recibir.`, m)
}

// Handler principal
let handler = async (m, { conn, args, usedPrefix }) => {
  try {
    const prefix = usedPrefix || '.'
    const [rawA, rawB] = (args.join(' ') || '').split('/').map(v => v && v.trim())

    if (!rawA || !rawB) return sendHelp(conn, m.chat, prefix, m)

    const chars = await getCharacters()
    const myChars = chars.filter(c => c.user === m.sender)
    const charA = myChars.find(c => c.name.toLowerCase() === rawA.toLowerCase())
    if (!charA) return conn.reply(m.chat, `❀ No posees a *${rawA}* en tu colección.`, m)

    const charB = chars.find(c => c.name.toLowerCase() === rawB.toLowerCase())
    if (!charB) return conn.reply(m.chat, `❀ No existe ningún personaje llamado *${rawB}*.`, m)
    if (!charB.user) return conn.reply(m.chat, `❀ *${rawB}* no pertenece a nadie.`, m)
    if (charB.user === m.sender) return conn.reply(m.chat, `❀ No puedes intercambiar contigo mismo.`, m)

    // Verifica solicitudes activas
    if (activeTrades[charB.user] || activeTrades[m.sender])
      return conn.reply(m.chat, `❀ Ya hay una solicitud de intercambio activa para uno de los usuarios.`, m)

    // Solicitud y timeout
    const tradeMsg = 
      `🌸 @${m.sender.split('@')[0]} quiere intercambiar:\n` +
      `• *${charA.name}* (${charA.value})\n` +
      `por el personaje de @${charB.user.split('@')[0]}:\n` +
      `• *${charB.name}* (${charB.value})\n\n` +
      `Responde con "aceptar" en 60 segundos para realizar el intercambio.`

    const sent = await conn.sendMessage(m.chat, { text: tradeMsg, mentions: [m.sender, charB.user] }, { quoted: m })
    activeTrades[charB.user] = {
      requester: m.sender,
      offered: charA.name,
      requested: charB.name,
      chat: m.chat,
      timeout: setTimeout(() => {
        delete activeTrades[charB.user]
        conn.sendMessage(m.chat, `❀ La solicitud de intercambio expiró.`, { mentions: [m.sender, charB.user] })
      }, 60000)
    }
  } catch (e) {
    await m.reply(`❀ Ocurrió un error procesando el intercambio:\n${e.message}`)
  }
}

// Handler para aceptar el intercambio
handler.before = async (m, { conn }) => {
  try {
    if ((m.text || '').toLowerCase() !== 'aceptar') return true
    const trade = activeTrades[m.sender]
    if (!trade) return true

    const chars = await getCharacters()
    const offered = chars.find(c => c.name === trade.offered && c.user === trade.requester)
    const requested = chars.find(c => c.name === trade.requested && c.user === m.sender)

    if (!offered || !requested) {
      await conn.reply(trade.chat, `❀ Uno de los personajes ya no está disponible.`, null)
      clearTimeout(trade.timeout)
      delete activeTrades[m.sender]
      return false
    }

    // Intercambio
    offered.user = m.sender
    requested.user = trade.requester
    await setCharacters(chars)

    await conn.sendMessage(trade.chat, {
      text: `✨ ¡Intercambio realizado!\n\n` +
        `@${trade.requester.split('@')[0]} ahora tiene *${trade.requested}*.\n` +
        `@${m.sender.split('@')[0]} ahora tiene *${trade.offered}*.`,
      mentions: [trade.requester, m.sender]
    })

    clearTimeout(trade.timeout)
    delete activeTrades[m.sender]
    return false
  } catch (e) {
    await m.reply(`❀ Error al aceptar el intercambio:\n${e.message}`)
    return false
  }
}

handler.help = ['trade PersonajeA / PersonajeB']
handler.tags = ['gacha', 'anime']
handler.command = ['trade', 'intercambiar2']
handler.group = true
handler.register = true

export default handler