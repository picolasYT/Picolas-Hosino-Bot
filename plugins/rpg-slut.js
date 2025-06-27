let cooldowns = {}

let handler = async (m, { conn, text, command }) => {
  const users = global.db.data.users
  const senderId = m.sender
  const senderName = conn.getName(senderId)

  const cooldown = 5 * 60 * 1000
  if (cooldowns[senderId] && Date.now() - cooldowns[senderId] < cooldown) {
    const wait = Math.ceil((cooldowns[senderId] + cooldown - Date.now()) / 1000)
    return m.reply(`⏳ Debes esperar *${segundosAHMS(wait)}* para usar *#slut* de nuevo.`)
  }

  cooldowns[senderId] = Date.now()

  let senderCoin = users[senderId].coin || 0
  let randomUserId = Object.keys(users)[Math.floor(Math.random() * Object.keys(users).length)]
  while (randomUserId === senderId) {
    randomUserId = Object.keys(users)[Math.floor(Math.random() * Object.keys(users).length)]
  }
  const randomUserCoin = users[randomUserId].coin || 0
  const randomName = conn.getName(randomUserId)

  // Ganancias grandes
  const bigGain = Math.floor(Math.random() * 3001) + 2000 // 2000 - 5000
  const mediumGain = Math.floor(Math.random() * 1001) + 500 // 500 - 1500
  const bigLoss = Math.floor(Math.random() * 2501) + 1500 // 1500 - 4000
  const mediumLoss = Math.floor(Math.random() * 801) + 400 // 400 - 1200

  const gananciaTextos = [
    `💋 *@${randomUserId.split('@')[0]}* se enamoró de ti y te ofreció una noche en su mansión. Recibiste *+${bigGain} ${moneda}*.`,
    `💃 Fuiste a un club de lujo y diste un espectáculo que puso a todos locos. Te lanzaron *+${bigGain} ${moneda}* en billetes.`,
    `💎 Un empresario solitario pagó *+${bigGain} ${moneda}* por una noche contigo. ¡Te hiciste rica(o)!`,
    `🍷 Le diste unos besos a *@${randomUserId.split('@')[0]}* y te pagó *+${mediumGain} ${moneda}* solo por tu sonrisa.`,
    `💌 Alguien vio tu perfil en una app y te transfirió *+${mediumGain} ${moneda}* por solo hablarle.`,
    `🥂 Montaste un show en un bar y te pagaron *+${mediumGain} ${moneda}*.`,
    `🛐 Hiciste un ritual erótico para un culto secreto. Recibiste *+${bigGain} ${moneda}* como ofrenda.`,
    `🌟 Apareciste en un video viral como la "slut del año". YouTube te pagó *+${bigGain} ${moneda}*!`,
    `💖 Fuiste parte de un trío épico con *@${randomUserId.split('@')[0]}* y alguien más. Ganaste *+${mediumGain} ${moneda}*.`,
    `🛏️ Terminaste siendo contratado(a) como escort por un político. Ganancia total: *+${bigGain} ${moneda}*.`
  ]

  const perdidaTextos = [
    `🤕 Fuiste con *@${randomUserId.split('@')[0]}* pero no sabía lo que hacía... Te lesionaste. *-${mediumLoss} ${moneda}* en hospital.`,
    `🚓 Te atrapó la policía por prostitución ilegal. Pagaste fianza de *-${bigLoss} ${moneda}*.`,
    `💔 *@${randomUserId.split('@')[0]}* te bloqueó y te denunció. Te quitaron *-${mediumLoss} ${moneda}*.`,
    `🦠 Te contagiaste de algo. Gastaste *-${mediumLoss} ${moneda}* en tratamiento.`,
    `💢 Estabas borracho(a) y perdiste todo lo ganado. Se te fueron *-${bigLoss} ${moneda}*.`,
    `📉 Un cliente dijo que eras pésimo(a) y pidió reembolso. Te quitaron *-${mediumLoss} ${moneda}*.`,
    `🧽 Estabas tan desesperado(a) que ofreciste el servicio por *comida*. Perdiste *-${mediumLoss} ${moneda}*.`,
    `🐷 Un cliente te hizo disfrazarte de cerdito, pero te grabó y extorsionó. Pagaste *-${bigLoss} ${moneda}*.`,
    `😢 Fuiste con alguien que no tenía dinero y tú terminaste pagando el motel. *-${mediumLoss} ${moneda}*.`,
    `📸 Te chantajearon con fotos tuyas en acción. Tuviste que pagar *-${bigLoss} ${moneda}*.`,
    `👻 Resultó ser un espíritu. Te quitó tu energía vital y *-${mediumLoss} ${moneda}*.`,
    `🎃 Participaste en una orgía de Halloween que terminó en caos. Perdiste *-${bigLoss} ${moneda}*.`,
    `📉 Crisis económica: tu cliente se quedó sin fondos. Te dejó *sin nada*. *-${mediumLoss} ${moneda}*.`,
    `🧛 Te mordió un vampiro durante el acto y ahora necesitas medicinas. *-${mediumLoss} ${moneda}*.`,
    `🧟‍♂️ Era un zombie. Fuiste su cena. Gastaste *-${mediumLoss} ${moneda}* en reconstruirte.`
  ]

  const esGanancia = Math.random() < 0.4 // 40% de ganar, 60% perder
  const resultado = esGanancia
    ? gananciaTextos[Math.floor(Math.random() * gananciaTextos.length)]
    : perdidaTextos[Math.floor(Math.random() * perdidaTextos.length)]

  const cantidad = resultado.includes('+')
    ? parseInt(resultado.match(/\+(\d+)/)?.[1] || 0)
    : parseInt(resultado.match(/-(\d+)/)?.[1] || 0)

  if (esGanancia) {
    users[senderId].coin += cantidad
    users[randomUserId].coin -= cantidad
    await conn.sendMessage(m.chat, {
      text: `💋 *PROSTITUCIÓN EXITOSA*\n\n${resultado}\n\n✨ *${senderName} ahora tiene más dinero!*`,
      contextInfo: { mentionedJid: [randomUserId] }
    }, { quoted: m })
  } else {
    users[senderId].coin -= cantidad
    await conn.sendMessage(m.chat, {
      text: `💀 *FRACASO TOTAL*\n\n${resultado}\n\n😭 *${senderName} ha perdido ${cantidad} ${moneda}...*`,
      contextInfo: { mentionedJid: [randomUserId] }
    }, { quoted: m })
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
  let min = Math.floor(segundos / 60)
  let sec = segundos % 60
  return `${min} minuto(s) y ${sec} segundo(s)`
}
