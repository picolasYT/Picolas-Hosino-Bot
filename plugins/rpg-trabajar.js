let cooldowns = {}

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  let tiempo = 5 * 60
  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempo * 1000) {
    const tiempo2 = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempo * 1000 - Date.now()) / 1000))
    conn.reply(m.chat, `${emoji3} Debes esperar *${tiempo2}* para usar *#chamba* de nuevo.`, m)
    return
  }

  cooldowns[m.sender] = Date.now()

  let ganancia = Math.floor(Math.random() * 65000) - 15000 // puede ir de -15,000 a +50,000
  user.coin += ganancia

  const mensaje = ganancia >= 0
    ? `✿ ${pickRandom(trabajosBuenos)} *¥${ganancia.toLocaleString()} ${moneda}🌹*`
    : `🥀 ${pickRandom(trabajosMalos)} *¥${Math.abs(ganancia).toLocaleString()} ${moneda}...*`

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
  "Trabajaste para el gran sistema capitalista y fuiste recompensado con",
  "Vendiste empanadas en la calle y ganaste",
  "Programaste un bot exitoso y te pagaron",
  "Cuidaste gatitos en una mansión de millonarios y te dieron",
  "Ganaste un concurso de karaoke y recibiste",
  "Editaste videos de anime y te pagaron",
  "Trabajaste en un crucero de lujo y ganaste",
  "Vendiste NFTs de Pikachu y ganaste",
  "Fuiste traductor en un evento otaku y te recompensaron con",
  "Limpiaste la casa de una idol japonesa y encontraste",
  "Fuiste actor de doblaje en un hentai muy popular y cobraste",
  "Cazaste fantasmas en la noche y uno te dejó de propina",
  "Ayudaste a un anciano a cruzar y él te dio",
  "Participaste en una obra de teatro escolar y ganaste",
  "Disfrazado de dinosaurio en un cumple infantil, ganaste",
  "Fuiste animador en una fiesta de anime y te pagaron",
  "Vendes galletas con chips y ganas",
  "Salvaste un perrito y su dueña te recompensó con",
  "Arreglaste una computadora vieja y te dieron",
]

const trabajosMalos = [
  "Se te cayó toda la mercancía en la calle y perdiste",
  "Te estafaron mientras vendías cosas y perdiste",
  "El jefe se quedó con tu paga y perdiste",
  "Te tropezaste con una abuela millonaria y tuviste que pagarle",
  "Confundiste el pedido y te descontaron",
  "Una paloma te robó la bolsa con el dinero, perdiste",
  "Un cliente se fue sin pagar y perdiste",
  "Te confundieron con un criminal y te multaron con",
  "Fuiste despedido por llegar tarde y perdiste",
  "Tuviste que pagar los daños del cosplay que arruinaste, perdiste",
  "Te caíste en una fuente y te cobraron por romperla",
  "Perdiste el dinero jugando piedra, papel o tijera",
  "Confundiste dólares con VANI-COINS y saliste perdiendo",
  "Invertiste en una estafa piramidal y perdiste",
  "Le pagaste de más a un cliente por error y perdiste",
]
