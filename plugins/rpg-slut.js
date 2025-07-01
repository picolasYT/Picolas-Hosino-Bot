let cooldowns = {}

let handler = async (m, { conn, text, command, usedPrefix }) => {
  let users = global.db.data.users
  let senderId = m.sender
  let senderName = conn.getName(senderId)

  let tiempo = 5 * 60 // 5 minutos
  if (cooldowns[senderId] && Date.now() - cooldowns[senderId] < tiempo * 1000) {
    let tiempo2 = segundosAHMS(Math.ceil((cooldowns[senderId] + tiempo * 1000 - Date.now()) / 1000))
    return m.reply(`💦 Debes esperar *${tiempo2}* para volver a usar *#slut*.`)
  }

  cooldowns[senderId] = Date.now()

  let senderCoin = users[senderId].coin || 0
  let randomUserId = Object.keys(users)[Math.floor(Math.random() * Object.keys(users).length)]

  // Evitar que sea el mismo usuario
  while (randomUserId === senderId) {
    randomUserId = Object.keys(users)[Math.floor(Math.random() * Object.keys(users).length)]
  }

  let randomUserCoin = users[randomUserId].coin || 0

  const ganancias = [
    `✿ Te vistieron de maid en público y te dieron *¥{monto}* por dejar que todos te usen como juguete.`,
    `✿ Participaste en una orgía oculta y alguien te pagó *¥{monto}* por tus "servicios" VIP.`,
    `✿ Le hiciste un show a @usuario y te lanzó *¥{monto}* encima como recompensa.`,
    `✿ Estuviste en una película para adultos sin saberlo, pero te pagaron *¥{monto}*.`,
    `✿ Te dejaron propina tras hacer un baile en una despedida de soltero: *¥{monto}*.`,
    `✿ Fuiste estrella en una app de videos y ganaste *¥{monto}*.`
  ]

  const perdidas = [
    `✿ Te arrestaron por indecencia pública. Pagaste *¥{monto}* de multa.`,
    `✿ Tu cliente se fue sin pagar. Perdiste *¥{monto}*.`,
    `✿ Te fracturaste haciendo una pose extraña. Gastaste *¥{monto}* en la clínica.`,
    `✿ Nadie quiso tus servicios hoy. Perdiste *¥{monto}* en maquillaje y trajes.`,
    `✿ Te emborrachaste y pagaste la cuenta de todos. Perdiste *¥{monto}*.`,
    `✿ Te drogaron y amaneciste sin cartera. Te robaron *¥{monto}*.`
  ]

  const ganar = Math.random() < 0.5 // 50% probabilidad
  const frases = ganar ? ganancias : perdidas
  const texto = frases[Math.floor(Math.random() * frases.length)]

  const monto = Math.floor(Math.random() * (10000 - 500 + 1)) + 500

  if (ganar) {
    users[senderId].coin += monto
    users[randomUserId].coin -= Math.min(randomUserCoin, monto)
    conn.sendMessage(m.chat, {
      text: texto.replace('{monto}', `${monto.toLocaleString()} ${moneda}`).replace('@usuario', `@${randomUserId.split('@')[0]}`),
      contextInfo: { mentionedJid: [randomUserId] }
    }, { quoted: m })
  } else {
    users[senderId].coin = Math.max(0, senderCoin - monto)
    conn.reply(m.chat, texto.replace('{monto}', `${monto.toLocaleString()} ${moneda}`).replace('@usuario', `@${randomUserId.split('@')[0]}`), m)
  }

  global.db.write()
}

handler.tags = ['rpg']
handler.help = ['slut']
handler.command = ['slut', 'protituirse']
handler.register = true
handler.group = true

export default handler

function segundosAHMS(segundos) {
  let minutos = Math.floor((segundos % 3600) / 60)
  let segundosRestantes = segundos % 60
  return `${minutos} minutos y ${segundosRestantes} segundos`
}
