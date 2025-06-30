import { promises as fs } from 'fs'

const charactersFilePath = './src/database/characters.json'
const haremFilePath = './src/database/harem.json'
const activeTrades = {} // { chatId: { users: [a, b], timeoutId, ... } }

async function loadCharacters() {
    const data = await fs.readFile(charactersFilePath, 'utf-8')
    return JSON.parse(data)
}

async function saveCharacters(characters) {
    await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2), 'utf-8')
}

async function loadHarem() {
    try {
        const data = await fs.readFile(haremFilePath, 'utf-8')
        return JSON.parse(data)
    } catch (err) {
        return []
    }
}

async function saveHarem(harem) {
    await fs.writeFile(haremFilePath, JSON.stringify(harem, null, 2), 'utf-8')
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // Validación de uso
    if (!args.join(' ').includes('/')) {
        await conn.reply(m.chat, `《✧》Debes especificar dos personajes para intercambiarlos.\n\n> ✐ Ejemplo: *${usedPrefix}${command} Personaje1 / Personaje2*\n> Donde "Personaje1" es el personaje que quieres intercambiar y "Personaje2" es el personaje que quieres recibir`, m)
        return
    }
    const [rawA, rawB] = args.join(' ').split('/').map(s => s.trim())
    const mentioned = m.mentionedJid && m.mentionedJid[0]

    if (!rawA || !rawB || !mentioned) {
        await conn.reply(m.chat, `《✧》Debes especificar dos personajes para intercambiarlos.\n\n> ✐ Ejemplo: *${usedPrefix}${command} Personaje1 / Personaje2*\n> Donde "Personaje1" es el personaje que quieres intercambiar y "Personaje2" es el personaje que quieres recibir`, m)
        return
    }

    // Validar solicitudes activas
    if (activeTrades[m.chat]) {
        const { users } = activeTrades[m.chat]
        if (users.includes(m.sender) || users.includes(mentioned)) {
            await conn.reply(m.chat, '❀ Ya hay una solicitud de intercambio activa para uno de los usuarios.', m)
            return
        }
    }

    // Cargar datos
    let characters = await loadCharacters()
    let charA = characters.find(c => c.name.toLowerCase() === rawA.toLowerCase())
    if (!charA) return conn.reply(m.chat, `❀ No posees a *${rawA}* en tu colección.`, m)
    if (charA.user !== m.sender) return conn.reply(m.chat, `❀ *${rawA}* no está reclamado por ti.`, m)

    let charB = characters.find(c => c.name.toLowerCase() === rawB.toLowerCase())
    if (!charB) return conn.reply(m.chat, `❀ No existe ningún personaje llamado *${rawB}*.`, m)
    if (!charB.user) return conn.reply(m.chat, `❀ *${rawB}* no pertenece a nadie.`, m)
    if (charB.user !== mentioned) return conn.reply(m.chat, `❀ *${rawB}* no está reclamado por el usuario mencionado.`, m)
    if (charA.id === charB.id) return conn.reply(m.chat, `❀ No puedes intercambiar el mismo personaje.`, m)

    // Envío de solicitud
    const userA = m.sender
    const userB = mentioned
    const tradeMsg = `‌‌‍‌‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‍‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‌‍‌‌‌‌‌‍‌‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‍‌‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‌‍‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‌‍‌‌「✐」@${userA.split('@')[0]}, @${userB.split('@')[0]} te ha enviado una solicitud de intercambio.

✦ [@${userB.split('@')[0]}] *${charB.name}* (${charB.value})
✦ [@${userA.split('@')[0]}] *${charA.name}* (${charA.value})

✐ Para aceptar el intercambio responde a este mensaje con "Aceptar", la solicitud expira en 60 segundos.`

    const sent = await conn.reply(m.chat, tradeMsg, m, { mentions: [userA, userB] })

    // Guardar solicitud activa
    activeTrades[m.chat] = {
        users: [userA, userB],
        charA: charA.name,
        charB: charB.name,
        messageId: sent.key.id,
        timeoutId: setTimeout(() => {
            delete activeTrades[m.chat]
            conn.reply(m.chat, '❀ La solicitud de intercambio ha expirado.', m)
        }, 60000)
    }

    // Esperar respuesta
    handler.before = async function (msg, { conn }) {
        // Solo aceptar en mismo chat/respuesta a la solicitud
        if (!activeTrades[m.chat]) return
        if (msg.quoted && msg.quoted.id === sent.key.id && /aceptar/i.test(msg.text)) {
            if (msg.sender !== userB) return
            const { charA: nameA, charB: nameB } = activeTrades[m.chat]
            // Recarga para asegurar que no cambiaron de dueño
            characters = await loadCharacters()
            let chA = characters.find(c => c.name.toLowerCase() === nameA.toLowerCase())
            let chB = characters.find(c => c.name.toLowerCase() === nameB.toLowerCase())
            if (!chA || chA.user !== userA || !chB || chB.user !== userB) {
                conn.reply(m.chat, '❀ El estado de algún personaje ha cambiado. Intercambio cancelado.', m)
                delete activeTrades[m.chat]
                return
            }
            // Intercambiar
            chA.user = userB
            chB.user = userA
            await saveCharacters(characters)
            // Opcional: actualizar harem.json si lo usas como en tus comandos
            let harem = await loadHarem()
            // Actualiza/añade entradas
            for (const ch of [chA, chB]) {
                let entry = harem.find(e => e.characterId === ch.id)
                if (entry) entry.userId = ch.user
                else harem.push({ userId: ch.user, characterId: ch.id, lastClaimTime: Date.now() })
            }
            await saveHarem(harem)
            // Mensaje de éxito
            conn.reply(m.chat, `「✐」Intercambio aceptado!\n\n✦ @${userB.split('@')[0]} » *${chA.name}*\n✦ @${userA.split('@')[0]} » *${chB.name}*`, m, { mentions: [userA, userB] })
            clearTimeout(activeTrades[m.chat].timeoutId)
            delete activeTrades[m.chat]
        }
    }
}

handler.help = ['intercambiar <Personaje1> / <Personaje2> @usuario']
handler.tags = ['anime']
handler.command = ['intercambiar', 'trade', 'swap']
handler.group = true

export default handler