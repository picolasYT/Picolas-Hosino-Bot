import { promises as fs } from 'fs'

const charactersFilePath = './src/database/characters.json'
const haremFilePath = './src/database/harem.json'

// Utilidades para cargar y guardar personajes
async function loadCharacters() {
    const data = await fs.readFile(charactersFilePath, 'utf-8')
    {
    await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2), 'utf-8')
}
async function loadHarem() {
    try {
        const data = await fs.readFile(haremFilePath, 'utf-8')
        return JSON.parse(data)
    } catch { return [] }
}
async function saveHarem(harem) {
    await fs.writeFile(haremFilePath, JSON.stringify(harem, null, 2), 'utf-8')
}

// Control de solicitudes activas
const activeTrades = {}

// Handler principal
let handler = async (m, { conn, args, participants }) => {
    // Validación de sintaxis
    if (!args[0] || !args[1] || !m.mentionedJid?.[0]) {
        return conn.reply(m.chat, `《✧》Debes especificar dos personajes para intercambiarlos.\n\n> ✐ Ejemplo: *#intercambiar Personaje1 / Personaje2*\n> Donde "Personaje1" es el personaje que quieres intercambiar y "Personaje2" es el personaje que quieres recibir`, m)
    }

    // Parseo de argumentos
    const [rawA, , rawB] = args.join(' ').split(/[/|\\\-]/).map(a => a.trim())
    const userA = m.sender
    const userB = m.mentionedJid[0]

    if (!rawA || !rawB) {
        return conn.reply(m.chat, `《✧》Debes especificar dos personajes para intercambiarlos.\n\n> ✐ Ejemplo: *#intercambiar Personaje1 / Personaje2*\n> Donde "Personaje1" es el personaje que quieres intercambiar y "Personaje2" es el personaje que quieres recibir`, m)
    }

    // Cargar datos
    const characters = await loadCharacters()

    // Buscar personajes
    const charA = characters.find(c => c.name.toLowerCase() === rawA.toLowerCase() && c.user === userA)
    if (!charA) return conn.reply(m.chat, `❀ No posees a *${rawA}* en tu colección.`, m)
    const charB = characters.find(c => c.name.toLowerCase() === rawB.toLowerCase())
    if (!charB) return conn.reply(m.chat, `❀ No existe ningún personaje llamado *${rawB}*.`, m)
    if (!charB.user) return conn.reply(m.chat, `❀ *${rawB}* no pertenece a nadie.`, m)
    if (charB.user !== userB) return conn.reply(m.chat, `❀ *${rawB}* no pertenece al usuario que mencionaste.`, m)
    if (charA.user !== userA) return conn.reply(m.chat, `❀ *${rawA}* no te pertenece.`, m)
    if (userA === userB) return conn.reply(m.chat, `❀ No puedes intercambiar personajes contigo mismo.`, m)

    // Validar solicitudes activas
    if (activeTrades[userA] || activeTrades[userB]) {
        return conn.reply(m.chat, `❀ Ya hay una solicitud de intercambio activa para uno de los usuarios.`, m)
    }

    // Mensaje de solicitud de intercambio
    const tradeMsg = `‌‌‍‌‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‍‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‌‍‌‌‌‌‌‍‌‌‌‌‌‌‍‌‌‌‌‍')[0]} te ha enviado una solicitud de intercambio.

✦ [@${userB.split('@')[0]}] *${charB.name}* (${charB.value})
✦ [@${userA.split('@')[0]}] *${charA.name}* (${charA.value})

✐ Para aceptar el intercambio responde a este mensaje con "Aceptar", la solicitud expira en 60 segundos.`

    const respMsg = await conn.reply(m.chat, tradeMsg, m, {
        mentions: [userA, userB]
    })

    // Marcar la solicitud como activa
    activeTrades[userA] = { userA, userB, charA, charB, msgId: respMsg.key.id }
    activeTrades[userB] = activeTrades[userA]

    // Esperar respuesta
    let accepted = false

    conn.ev.once('messages.upsert', async ({ messages }) => {
        const reply = messages[0]
        if (
            reply.key.fromMe === false &&
            reply.key.remoteJid === m.chat &&
            reply.message?.conversation?.toLowerCase() === 'aceptar' &&
            reply.messageContextInfo?.stanzaId === respMsg.key.id &&
            reply.key.participant === userB
        ) {
            accepted = true

            // Intercambiar dueños
            charA.user = userB
            charB.user = userA
            await saveCharacters(characters)

            // Limpiar solicitudes
            delete activeTrades[userA]
            delete activeTrades[userB]

            // Notificar éxito
            const doneMsg = `「✐」Intercambio aceptado!\n\n✦ @${userB.split('@')[0]} » *${charA.name}*\n✦ @${userA.split('@')[0]} » *${charB.name}*`
            await conn.reply(m.chat, doneMsg, m, { mentions: [userA, userB] })
        }
    })

    // Expirar solicitud a los 60 segundos
    setTimeout(() => {
        if (!accepted) {
            delete activeTrades[userA]
            delete activeTrades[userB]
            conn.reply(m.chat, `⏳ La solicitud de intercambio ha expirado.`, m)
        }
    }, 60_000)
}

handler.help = ['intercambiar @usuario Personaje1 / Personaje2']
handler.tags = ['anime']
handler.command = ['intercambiar']
handler.group = true

export default handler