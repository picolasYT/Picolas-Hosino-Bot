import { promises as fs } from 'fs'

const charactersFilePath = './src/database/characters.json'
const cooldowns = {}

async function loadCharacters() {
  try {
    const data = await fs.readFile(charactersFilePath, 'utf-8')
    return JSON.parse(data)
  } catch {
    throw new Error('❀ No se pudo cargar el archivo characters.json.')
  }
}

async function saveCharacters(characters) {
  try {
    await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2), 'utf-8')
  } catch {
    throw new Error('❀ No se pudo guardar el archivo characters.json.')
  }
}

const solicitudes = {} // Guarda las solicitudes activas: { receptorId: { emisorId, personajeEmisor, personajeReceptor, timeoutId } }

let handler = async (m, { conn, usedPrefix }) => {
  const senderId = m.sender
  const chatId = m.chat

  if (args.length === 0 || !args.join(' ').includes('/')) {
    return conn.reply(chatId, 
`《✧》Debes especificar dos personajes para intercambiarlos.

> ✐ Ejemplo: *${usedPrefix}intercambiar Personaje1 / Personaje2*
> Donde "Personaje1" es el personaje que quieres intercambiar y "Personaje2" es el personaje que quieres recibir`, m)
  }

  let [p1Raw, p2Raw] = args.join(' ').split('/').map(s => s.trim())
  if (!p1Raw || !p2Raw) {
    return conn.reply(chatId,
`《✧》Debes especificar dos personajes para intercambiarlos.

> ✐ Ejemplo: *${usedPrefix}intercambiar Personaje1 / Personaje2*
> Donde "Personaje1" es el personaje que quieres intercambiar y "Personaje2" es el personaje que quieres recibir`, m)
  }

  // Carga personajes
  const characters = await loadCharacters()

  // Personajes del emisor (quien pide)
  const senderChars = characters.filter(c => c.user === senderId)
  const senderChar = senderChars.find(c => c.name.toLowerCase() === p1Raw.toLowerCase())

  if (!senderChar) {
    return conn.reply(chatId, `❀ No tienes al personaje *${p1Raw}* en tu colección.`, m)
  }

  // Buscamos al otro usuario que tiene el personaje que quieres recibir (p2Raw)
  const targetChar = characters.find(c => c.name.toLowerCase() === p2Raw.toLowerCase())
  if (!targetChar) {
    return conn.reply(chatId, `❀ No existe ningún personaje llamado *${p2Raw}* en la base de datos.`, m)
  }

  if (targetChar.user === senderId) {
    return conn.reply(chatId, `❀ Ya tienes ese personaje *${p2Raw}* en tu colección. No puedes intercambiarlo contigo mismo.`, m)
  }

  // Usuario receptor (dueño del personaje p2Raw)
  const receptorId = targetChar.user
  if (!receptorId) {
    return conn.reply(chatId, `❀ El personaje *${p2Raw}* está libre y no puede ser intercambiado.`, m)
  }

  // Validar que no haya solicitud activa del receptor o del emisor
  if (solicitudes[receptorId]) {
    return conn.reply(chatId, `❀ @${receptorId.split('@')[0]} ya tiene una solicitud pendiente. Espera a que responda.`, m, { mentions: [receptorId] })
  }
  if (solicitudes[senderId]) {
    return conn.reply(chatId, `❀ Ya tienes una solicitud activa. Espera a que sea respondida o expire.`, m)
  }

  // Enviar solicitud al receptor
  let mensaje = `
‌‌‍‌‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‍‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‌‍‌‌‌‌‌‍‌‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‍‌‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‌‍‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‌‍‌‌「✐」@${senderId.split('@')[0]}, @${receptorId.split('@')[0]} te ha enviado una solicitud de intercambio.

✦ [@${senderId.split('@')[0]}] *${senderChar.name}* (${senderChar.value})
✦ [@${receptorId.split('@')[0]}] *${targetChar.name}* (${targetChar.value})

✐ Para aceptar el intercambio responde a este mensaje con "Aceptar", la solicitud expira en 60 segundos.
`

  const sentMsg = await conn.sendMessage(chatId, { text: mensaje, mentions: [senderId, receptorId] }, { quoted: m })

  // Guardar solicitud con timeout para expirar
  solicitudes[receptorId] = {
    emisorId: senderId,
    personajeEmisor: senderChar.name,
    personajeReceptor: targetChar.name,
    chatId,
    messageId: sentMsg.key.id,
    timeoutId: setTimeout(() => {
      delete solicitudes[receptorId]
      conn.sendMessage(chatId, `❀ La solicitud de intercambio entre @${senderId.split('@')[0]} y @${receptorId.split('@')[0]} ha expirado.`, { mentions: [senderId, receptorId] })
    }, 60000)
  }
}

handler.before = async (m, { conn }) => {
  // Aquí se capturan los "Aceptar" para la solicitud
  const senderId = m.sender
  const text = (m.text || '').toLowerCase()
  if (text !== 'aceptar') return true

  // Buscar si el usuario es receptor de alguna solicitud
  if (!solicitudes[senderId]) return true

  const { emisorId, personajeEmisor, personajeReceptor, chatId, messageId, timeoutId } = solicitudes[senderId]

  clearTimeout(timeoutId)
  delete solicitudes[senderId]

  // Cargar personajes
  const characters = await loadCharacters()

  // Validar que ambos personajes sigan con sus dueños originales
  const emisorChar = characters.find(c => c.name === personajeEmisor && c.user === emisorId)
  const receptorChar = characters.find(c => c.name === personajeReceptor && c.user === senderId)

  if (!emisorChar) {
    await conn.reply(chatId, `❀ @${emisorId.split('@')[0]} ya no tiene el personaje *${personajeEmisor}* y no se puede realizar el intercambio.`, null, { mentions: [emisorId] })
    return false
  }

  if (!receptorChar) {
    await conn.reply(chatId, `❀ @${senderId.split('@')[0]} ya no tiene el personaje *${personajeReceptor}* y no se puede realizar el intercambio.`, null, { mentions: [senderId] })
    return false
  }

  // Realizar intercambio
  characters.forEach(c => {
    if (c.name === personajeEmisor && c.user === emisorId) c.user = senderId
    else if (c.name === personajeReceptor && c.user === senderId) c.user = emisorId
  })

  await saveCharacters(characters)

  // Mensaje de confirmación
  const confirmMsg = `
「✐」Intercambio aceptado!

✦ @${emisorId.split('@')[0]} » *${personajeReceptor}*
✦ @${senderId.split('@')[0]} » *${personajeEmisor}*
`
  await conn.sendMessage(chatId, confirmMsg, { mentions: [emisorId, senderId] })

  return false
}

handler.help = ['intercambiar Personaje1 / Personaje2']
handler.tags = ['gacha', 'anime']
handler.command = ['intercambiar']
handler.group = true
handler.register = true

export default handler