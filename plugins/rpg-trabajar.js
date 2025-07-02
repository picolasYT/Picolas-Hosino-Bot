let cooldowns = {}

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  let tiempo = 5 * 60
  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempo * 1000) {
    const tiempo2 = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempo * 1000 - Date.now()) / 1000))
    conn.reply(m.chat, `🤠 Debes esperar *${tiempo2}* para usar *#chamba* de nuevo.`, m)
    return
  }

  cooldowns[m.sender] = Date.now()

  const ganar = Math.random() < 0.5
  const monto = Math.floor(Math.random() * (10000 - 500 + 1)) + 500 // entre ¥500 y ¥10,000

  let mensaje = ''
  if (ganar) {
    user.coin += monto
    const trabajo = pickRandom(trabajosBuenos)
    mensaje = `✿ ${trabajo} *¥${monto.toLocaleString()} ${moneda}🌹*`
  } else {
    user.coin = Math.max(0, user.coin - monto)
    const trabajo = pickRandom(trabajosMalos)
    mensaje = `🥀 ${trabajo} *¥${monto.toLocaleString()} ${moneda}...*`
  }

  await conn.reply(m.chat, mensaje, m)
}

handler.help = ['chamba', 'trabajar', 'work', 'w']
handler.tags = ['economy']
handler.command = ['chamba', 'trabajar', 'w', 'work', 'chambear']
handler.group = true
handler.register = true

export default handler

function segundosAHMS(segundos) {
  let minutos = Math.floor((segundos % 3600) / 60)
  let segundosRestantes = segundos % 60
  return `${minutos} minutos y ${segundosRestantes} segundos`
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

const trabajosBuenos = [
  "Vendiste empanadas en la calle y ganaste",
  "Cuidaste gatitos en una mansión y te dieron",
  "Editaste videos de anime y te pagaron",
  "Fuiste animador en una fiesta y te dieron",
  "Programaste un bot funcional y ganaste",
  "Ganaste un concurso de karaoke y recibiste",
  "Fuiste traductor en un evento otaku y te dieron",
  "Limpiaste la casa de una idol y te dejaron",
  "Fuiste actor de doblaje y cobraste",
  "Arreglaste una computadora y ganaste",
]

const trabajosMalos = [
  "El jefe se quedó con tu paga, perdiste",
  "Se te cayó la mercancía, perdiste",
  "Una paloma te robó el dinero, perdiste",
  "Te estafaron mientras vendías cosas",
  "Te confundieron con un criminal y te multaron",
  "Arruinaste un cosplay y te lo descontaron",
  "Invertiste en una estafa piramidal y perdiste",
  "Tu jefe te descontó por llegar tarde",
  "Pagaste la cuenta de todos sin querer",
  "Confundiste yenes con darkos y perdiste",
]
