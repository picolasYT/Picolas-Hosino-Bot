let cooldowns = {}
let jail = {}

let handler = async (m, { conn }) => {
  let users = global.db.data.users
  let senderId = m.sender
  let senderName = conn.getName(senderId)
  let senderCoin = users[senderId].coin || 0

  const cooldown = 5 * 60 * 1000 // 5 minutos
  const jailCooldown = 60 * 60 * 1000 // 1 hora

  if (jail[senderId] && Date.now() < jail[senderId]) {
    const restante = segundosAHMS(Math.ceil((jail[senderId] - Date.now()) / 1000))
    m.reply(`🚔 Estás en la cárcel por *actividades criminales fallidas*.\n🧊 Tiempo restante: *${restante}* para salir.`)
    return
  }

  if (cooldowns[senderId] && Date.now() - cooldowns[senderId] < cooldown) {
    let tiempo2 = segundosAHMS(Math.ceil((cooldowns[senderId] + cooldown - Date.now()) / 1000))
    m.reply(`🕓 Ya has cometido un crimen recientemente.\n⏱️ Espera *${tiempo2}* para volver a intentarlo.`)
    return
  }

  cooldowns[senderId] = Date.now()

  const atrapado = Math.random() < 0.1
  if (atrapado) {
    jail[senderId] = Date.now() + jailCooldown
    const mensaje = pickRandom(frasesPolicia)
    return m.reply(`🚓 ${mensaje}\n🔒 Has sido enviado a la cárcel por 1 hora.`)
  }

  // Elegir víctima
  let victimId = Object.keys(users).filter(u => u !== senderId)[Math.floor(Math.random() * (Object.keys(users).length - 1))]
  let victimCoin = users[victimId].coin || 0

  const cantidad = Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000 // ¥1,000 - ¥10,000
  const tipo = Math.floor(Math.random() * 3) // 0: éxito, 1: fracaso, 2: mixto

  if (tipo === 0) {
    let real = Math.min(cantidad, victimCoin)
    users[senderId].coin += real
    users[victimId].coin -= real
    conn.sendMessage(m.chat, {
      text: `✿ ${pickRandom(frasesExito)} *¥${real.toLocaleString()} ${moneda}*\n> ¡Buen trabajo, ${senderName}! Ahora tienes *¥${users[senderId].coin.toLocaleString()}*.`,
      contextInfo: {
        mentionedJid: [victimId],
      }
    }, { quoted: m })
  } else if (tipo === 1) {
    let real = Math.min(cantidad, senderCoin)
    users[senderId].coin -= real
    m.reply(`🥀 ${pickRandom(frasesFracaso)} y perdiste *¥${real.toLocaleString()} ${moneda}*...\n> Te quedan *¥${users[senderId].coin.toLocaleString()}*.`)
  } else {
    let real = Math.min(cantidad, victimCoin)
    users[senderId].coin += real
    users[victimId].coin -= real
    conn.sendMessage(m.chat, {
      text: `✿ ${pickRandom(frasesMixto)} *¥${real.toLocaleString()} ${moneda}*\n> No fue mucho, pero algo es algo.\n> Ahora tienes *¥${users[senderId].coin.toLocaleString()}*.`,
      contextInfo: {
        mentionedJid: [victimId],
      }
    }, { quoted: m })
  }

  global.db.write()
}

handler.tags = ['economy']
handler.help = ['crimen']
handler.command = ['crimen', 'crime']
handler.register = true
handler.group = true

export default handler

function segundosAHMS(segundos) {
  let minutos = Math.floor(segundos / 60)
  let segundosRestantes = segundos % 60
  return `${minutos} minutos y ${segundosRestantes} segundos`
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

const frasesExito = [
  'Hackeaste un cajero automático y obtuviste',
  'Robaste una joyería y ganaste',
  'Estafaste con NFTs falsos y cobraste',
  'Hackeaste OnlyFans y robaste',
  'Vendiste datos filtrados y conseguiste',
  'Engañaste a un magnate millonario y obtuviste',
  'Hiciste phishing y lograste',
  'Robaste un convoy blindado y sacaste',
  'Clonaste una tarjeta de crédito y ganaste',
  'Robaste criptomonedas desde un café internet y conseguiste'
]

const frasesFracaso = [
  'Te atraparon robando donas en un 24h',
  'Tropezaste durante una huida y te arrestaron',
  'Tu cómplice te traicionó y se llevó todo',
  'Fuiste grabado en vivo por TikTok y te descubrieron',
  'La cámara facial te reconoció al instante',
  'La víctima resultó ser policía encubierto',
  'Intentaste escapar en bicicleta y te caíste',
  'Te congelaron la cuenta por estafa',
  'Olvidaste apagar el GPS durante el robo',
  'El crimen fue tan torpe que te hiciste viral',
  'Intentaste hackear usando un tostador',
  'Te quedaste dormido en medio del atraco',
  'El cajero automático te escupió tinta azul en la cara',
  'Usaste tu cuenta personal para vender productos robados',
  'Te caíste por una alcantarilla mientras huías',
  'Llamaste a emergencias por error durante el robo',
  'Tu máscara se rompió y te reconocieron',
  'Intentaste pagar soborno con tarjeta de crédito',
  'Un loro te delató durante el robo',
  'Fuiste a celebrar y olvidaste esconder el botín'
]

const frasesMixto = [
  'Robaste una cartera pero solo tenía',
  'Hackeaste una cuenta de Steam y lograste',
  'Atracaste un puesto de jugos y sacaste',
  'Interceptaste una transferencia pero era mínima: ganaste',
  'Vendiste una taza con forma de Pikachu por',
  'Robaste una mochila olvidada que solo tenía',
  'Cometiste fraude leve y obtuviste',
  'Te colaste en un evento y vendiste boletos falsos, ganaste'
]

const frasesPolicia = [
  '🚨 La policía te atrapó justo antes de escapar',
  '👮 Una patrulla te vio en plena acción',
  '🧠 Olvidaste cubrir tus huellas y te rastrearon',
  '🕵️ Un detective anónimo te identificó por tus crímenes pasados',
  '📷 Una cámara del semáforo te grabó robando',
  '🐕‍🦺 Un perro policía olfateó tus billetes y fuiste arrestado',
  '🧠 Usaste el WiFi público del parque y fuiste localizado',
  '👓 Un testigo te reconoció y llamó al 911'
]
