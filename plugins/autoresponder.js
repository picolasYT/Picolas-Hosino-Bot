import { promises as fs } from 'fs'

const charactersFilePath = './src/database/characters.json'
let intercambiosActivos = {}

async function loadCharacters() {
  const data = await fs.readFile(charactersFilePath, 'utf-8')
  return JSON.parse(data)
}

async function saveCharacters(characters) {
  await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2), 'utf-8')
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0] || !args[0].includes('/')) {
    return m.reply(`《✧》Debes especificar dos personajes para intercambiarlos.\n\n> ✐ Ejemplo: *${usedPrefix + command} Android 16 / Tsumiki Fushiguro*`)
  }

  const [rawA, rawB] = args.join(' ').split('/').map(v => v.trim())
  const characters = await loadCharacters()

  const charA = characters.find(c => c.name.toLowerCase() === rawA.toLowerCase())
  const charB = characters.find(c => c.name.toLowerCase() === rawB.toLowerCase())

  if (!charA) return m.reply(`❀ No posees a *${rawA}* en tu colección.`)
  if (!charB) return m.reply(`❀ No existe ningún personaje llamado *${rawB}*.`)
  if (!charB.user) return m.reply(`❀ *${rawB}* no pertenece a nadie.`)
  if (charA.user !== m.sender) return m.reply(`❀ *${charA.name}* no te pertenece.`)
  if (charB.user === m.sender) return m.reply(`❀ Ambos personajes ya son tuyos.`)

  const receptor = charB.user
  const solicitante = m.sender

  if (intercambiosActivos[solicitante] || intercambiosActivos[receptor]) {
    return m.reply(`❀ Ya hay una solicitud de intercambio activa para uno de los usuarios.`)
  }

  intercambiosActivos[solicitante] = true
  intercambiosActivos[receptor] = true

  const mensaje = `「✐」@${solicitante.split('@')[0]}, @${receptor.split('@')[0]} te ha enviado una solicitud de intercambio.

✦ [@${receptor.split('@')[0]}] *${charB.name}* (${charB.value})
✦ [@${solicitante.split('@')[0]}] *${charA.name}* (${charA.value})

✐ Para aceptar el intercambio responde a este mensaje con *Aceptar*, la solicitud expira en *60 segundos*.`

  const confirm = await conn.sendMessage(m.chat, { text: mensaje, mentions: [solicitante, receptor] }, { quoted: m })

  const collector = m.chat + confirm.key.id

  conn.ev.once(`messages.upsert`, async ({ messages }) => {
    const respuesta = messages[0]
    if (!respuesta || respuesta.key.remoteJid !== m.chat) return
    if (respuesta.key.fromMe) return
    if (respuesta.message?.conversation?.toLowerCase() !== 'aceptar') return
    if (respuesta.key.participant !== receptor && respuesta.key.remoteJid !== receptor) return

    // Intercambio aprobado
    charA.user = receptor
    charB.user = solicitante
    await saveCharacters(characters)

    delete intercambiosActivos[solicitante]
    delete intercambiosActivos[receptor]

    await conn.reply(m.chat, `「✐」Intercambio aceptado!\n\n✦ @${receptor.split('@')[0]} » *${charA.name}*\n✦ @${solicitante.split('@')[0]} » *${charB.name}*`, m, {
      mentions: [receptor, solicitante]
    })
  })

  setTimeout(() => {
    delete intercambiosActivos[solicitante]
    delete intercambiosActivos[receptor]
  }, 60_000)
}

handler.command = ['intercambiar', 'trade']
handler.tags = ['anime']
handler.help = ['intercambiar <TuPersonaje> / <PersonajeDeseado>']
handler.group = true
handler.register = true

export default handler
