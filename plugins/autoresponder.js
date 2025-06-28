import { promises as fs } from 'fs'

const charactersFilePath = './src/database/characters.json'
const haremFilePath = './src/database/harem.json'

async function loadCharacters() {
    const data = await fs.readFile(charactersFilePath, 'utf-8')
    return JSON.parse(data)
}

async function saveCharacters(characters) {
    await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2), 'utf-8')
}

let handler = async (m, { conn, args, participants, usedPrefix, command }) => {
    const text = args.join(" ")
    const match = text.split("/")

    if (match.length !== 2) {
        return m.reply(`《✧》Debes especificar dos personajes para intercambiarlos.

> ✐ Ejemplo: *${usedPrefix + command} Personaje1 / Personaje2*
> Donde "Personaje1" es el personaje que quieres intercambiar y "Personaje2" es el personaje que quieres recibir`)
    }

    const [name1, name2] = match.map(s => s.trim())
    const senderId = m.sender

    const characters = await loadCharacters()

    const character1 = characters.find(c => c.name.toLowerCase() === name1.toLowerCase() && c.user === senderId)
    const character2 = characters.find(c => c.name.toLowerCase() === name2.toLowerCase())

    if (!character1) return m.reply(`✘ No tienes un personaje llamado *${name1}* en tu harem.`)
    if (!character2) return m.reply(`✘ No se encontró ningún personaje llamado *${name2}* o no pertenece a nadie.`)
    if (!character2.user) return m.reply(`✘ *${name2}* no está reclamado por ningún usuario, no puedes hacer intercambio.`)
    if (character2.user === senderId) return m.reply(`✘ Ya posees el personaje *${name2}*, no puedes intercambiarlo contigo mismo.`)

    const targetId = character2.user
    const requestId = senderId + ':' + character1.id + ':' + character2.id

    const exchangeRequest = `
‌​​​​‌​​‍‌‌​‌‌‌​‌‍‌​​​‌​‌‌‍‌‌​‌‌‌​‌‍‌‌​​​‌​‌‍‌‌​‌‌‌​‌‍‌​​​‌​‌‌‍‌​​​‌‌​‌‍‌​​‌‌‌‌​‍‌​​‌‌​‌‌‍‌​​‌‌​‌​‍‌‌​‌‌‌​‌‍‌‌​‌​​‌‌‍‌‌​‌‌‌​‌‍‌​​‌​‌‌​‍‌‌​‌‌‌​‌‍‌‌​​​‌​‌‍‌‌​‌‌‌​‌‍‌​​‌‌‌​​‍‌‌​​‌‌​‌‍‌‌​​‌‌‌‌‍‌​​‌‌​​‌‍‌‌​​‌‌‌‌‍‌​​‌‌​‌‌‍‌​​‌‌‌​​‍‌‌​​‌​‌​‍‌‌​‌‌‌​‌‍‌​​​​​‌​「✐」@${senderId.split('@')[0]}, @${targetId.split('@')[0]} te ha enviado una solicitud de intercambio.

✦ [@${targetId.split('@')[0]}] *${character2.name}* (${character2.value})
✦ [@${senderId.split('@')[0]}] *${character1.name}* (${character1.value})

✐ Para aceptar el intercambio responde a este mensaje con "Aceptar", la solicitud expira en 60 segundos.`.trim()

    const message = await conn.sendMessage(m.chat, { text: exchangeRequest, mentions: [senderId, targetId] }, { quoted: m })

    const accept = await new Promise(resolve => {
        conn.ev.once(`message-reply-${message.key.id}`, async msg => {
            if (msg.key.participant === targetId && msg.message?.conversation?.toLowerCase() === 'aceptar') {
                resolve(true)
            } else {
                resolve(false)
            }
        })

        setTimeout(() => resolve(false), 60000)
    })

    if (!accept) return conn.reply(m.chat, '⏳ Solicitud de intercambio expirada o no fue aceptada.', m)

    const updatedCharacters = characters.map(c => {
        if (c.id === character1.id) return { ...c, user: targetId }
        if (c.id === character2.id) return { ...c, user: senderId }
        return c
    })

    await saveCharacters(updatedCharacters)

    return conn.reply(m.chat, `「✐」Intercambio aceptado!

✦ @${targetId.split('@')[0]} » *${character1.name}*
✦ @${senderId.split('@')[0]} » *${character2.name}*`, m, { mentions: [senderId, targetId] })
}

handler.command = ['intercambiar', 'trade']
handler.tags = ['anime']
handler.group = true
handler.register = true

export default handler
