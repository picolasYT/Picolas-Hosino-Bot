const exchangeRequests = {}  // Para controlar solicitudes activas

let handler = async (m, { conn, args, usedPrefix }) => {
  const [rawA, rawB] = args.join(' ').split('/').map(s => s?.trim())
  if (!rawA || !rawB) {
    return conn.reply(m.chat,
`《✧》Debes especificar dos personajes para intercambiarlos.

> ✐ Ejemplo: *${usedPrefix}intercambiar Personaje1 / Personaje2*
> Donde "Personaje1" es el que tienes y "Personaje2" el que quieres recibir.`, m)
  }

  const characters = await loadCharacters()
  const charA = characters.find(c => 
    c.name.toLowerCase() === rawA.toLowerCase() &&
    c.user === m.sender)
  if (!charA) return conn.reply(m.chat,
    `❀ No posees a *${rawA}* en tu colección.`, m)

  const charB = characters.find(c =>
    c.name.toLowerCase() === rawB.toLowerCase())
  if (!charB) return conn.reply(m.chat,
    `❀ No existe ningún personaje llamado *${rawB}*.`, m)
  if (!charB.user) return conn.reply(m.chat,
    `❀ *${rawB}* no pertenece a nadie.`, m)

  if (exchangeRequests[m.sender] || exchangeRequests[charB.user]) {
    return conn.reply(m.chat, `❀ Ya hay una solicitud activa de intercambio para uno de los usuarios.`, m)
  }

  // Crear y enviar solicitud
  exchangeRequests[m.sender] = {
    to: charB.user,
    give: charA,
    receive: charB,
    timestamp: Date.now()
  }

  let msg = 
`‌‌‍‌‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‌‌‍‌‌‌‌‌‍‌‌‌‌‌‍‌‌‌‍‌‌‌‌‌‌‍‌‌‌‌‌‍‌‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‍‌‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‌‍‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‌‍‌‌「✐」@${m.sender.split('@')[0]}, @${charB.user.split('@')[0]} te ha enviado una solicitud de intercambio.

✦ [@${m.sender.split('@')[0]}] *${charA.name}* (${charA.value})
✦ [@${charB.user.split('@')[0]}] *${charB.name}* (${charB.value})

✐ Para aceptar responde a este mensaje con “Aceptar” en 60 segundos.`
  
  conn.sendMessage(m.chat, { text: msg, mentions: [m.sender, charB.user] }, { quoted: m })

  // Esperar respuesta
  setTimeout(() => {
    delete exchangeRequests[m.sender]
  }, 60000)
}

handler.before = async (m, { conn }) => {
  if (m.text === 'Aceptar') {
    const req = Object.values(exchangeRequests).find(r => r.to === m.sender)
    if (!req) return

    // Realizar intercambio
    const characters = await loadCharacters()
    for (let c of characters) {
      if (c.id === req.give.id) c.user = req.to
      if (c.id === req.receive.id) c.user = req.from
    }
    await saveCharacters(characters)

    conn.sendMessage(m.chat, { text:
`「✐」Intercambio aceptado!

✦ @${req.to.split('@')[0]} » *${req.give.name}*
✦ @${req.give.user.split('@')[0]} » *${req.receive.name}*`, mentions: [req.to, req.give.user] }, { quoted: m })

    delete exchangeRequests[req.from]
  }
}

handler.help = ['intercambiar Personaje1 / Personaje2']
handler.tags = ['gacha']
handler.command = ['intercambiar']
handler.group = true
handler.register = true
export default handler
