let cooldowns = {}

let handler = async (m, { conn, text, command, usedPrefix }) => {
  let users = global.db.data.users
  let senderId = m.sender
  let senderName = conn.getName(senderId)

  let tiempo = 5 * 60
  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempo * 1000) {
    let tiempo2 = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempo * 1000 - Date.now()) / 1000))
    m.reply(`💦 Debes esperar *${tiempo2}* para volver a usar *#slut*.`)
    return
  }

  cooldowns[m.sender] = Date.now()
  let senderCoin = users[senderId].coin || 0
  let randomUserId = Object.keys(users)[Math.floor(Math.random() * Object.keys(users).length)]
  while (randomUserId === senderId) {
    randomUserId = Object.keys(users)[Math.floor(Math.random() * Object.keys(users).length)]
  }
  let randomUserCoin = users[randomUserId].coin || 0

  const acciones = [
    // Ganancias
    { texto: `✿ Te vistieron de maid en público y te dieron *¥{monto}* por dejar que todos te usen como juguete.`, ganar: true, min: 2000, max: 5349 },
    { texto: `✿ Participaste en una orgía oculta y alguien te pagó *¥{monto}* por tus \"servicios\" VIP.`, ganar: true, min: 1200, max: 4000 },
    { texto: `✿ Le hiciste un show a @usuario y te lanzó *¥{monto}* encima como recompensa.`, ganar: true, min: 800, max: 2300 },
    { texto: `✿ Estuviste en una película para adultos sin saberlo, pero te pagaron *¥{monto}*.`, ganar: true, min: 1500, max: 3100 },
    { texto: `✿ Te dejaron propina tras hacer un baile en una despedida de soltero: *¥{monto}*.`, ganar: true, min: 150, max: 600 },

    // Pérdidas
    { texto: `✿ Te arrestaron por indecencia pública. Pagaste *¥{monto}* de multa.`, ganar: false, min: 800, max: 2000 },
    { texto: `✿ Tu cliente se fue sin pagar. Perdiste *¥{monto}*.`, ganar: false, min: 1000, max: 2500 },
    { texto: `✿ Te fracturaste haciendo una pose extraña. Gastaste *¥{monto}* en la clínica.`, ganar: false, min: 300, max: 1200 },
    { texto: `✿ Nadie quiso tus servicios hoy. Perdiste *¥{monto}* en maquillaje y trajes.`, ganar: false, min: 50, max: 400 },
    { texto: `✿ Te emborrachaste y pagaste la cuenta de todos. Perdiste *¥{monto}*.`, ganar: false, min: 300, max: 1000 },
    { texto: `✿ Le rompiste algo importante a tu cliente. Tuviste que devolver *¥{monto}*.`, ganar: false, min: 1500, max: 3200 },
    { texto: `✿ Te drogaron y amaneciste sin cartera. Te robaron *¥{monto}*.`, ganar: false, min: 2000, max: 5000 },
  ]

  let accion = acciones[Math.floor(Math.random() * acciones.length)]
  let monto = Math.floor(Math.random() * (accion.max - accion.min + 1)) + accion.min

  if (accion.ganar) {
    users[senderId].coin += monto
    users[randomUserId].coin -= Math.min(randomUserCoin, monto)
    conn.sendMessage(m.chat, {
      text: accion.texto.replace('{monto}', `${monto} ${moneda}`).replace('@usuario', `@${randomUserId.split('@')[0]}`),
      contextInfo: { mentionedJid: [randomUserId] }
    }, { quoted: m })
  } else {
    users[senderId].coin = Math.max(0, senderCoin - monto)
    conn.reply(m.chat, accion.texto.replace('{monto}', `${monto} ${moneda}`).replace('@usuario', `@${randomUserId.split('@')[0]}`), m)
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
  let horas = Math.floor(segundos / 3600)
  let minutos = Math.floor((segundos % 3600) / 60)
  let segundosRestantes = segundos % 60
  return `${minutos} minutos y ${segundosRestantes} segundos`
}
