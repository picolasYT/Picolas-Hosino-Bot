let cooldowns = {}

let handler = async (m, { conn, text, command, usedPrefix }) => {
  let users = global.db.data.users
  let senderId = m.sender
  let senderName = conn.getName(senderId)

  let tiempo = 5 * 60 // 5 minutos
  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempo * 1000) {
    let tiempo2 = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempo * 1000 - Date.now()) / 1000))
    m.reply(`${emoji3} Ya has cometido un crimen recientemente.\n⏱️ Espera *${tiempo2}* para volver a intentarlo.`)
    return
  }

  cooldowns[m.sender] = Date.now()

  let senderCoin = users[senderId].coin || 0
  let randomUserId = Object.keys(users)[Math.floor(Math.random() * Object.keys(users).length)]
  while (randomUserId === senderId) {
    randomUserId = Object.keys(users)[Math.floor(Math.random() * Object.keys(users).length)]
  }

  let randomUserCoin = users[randomUserId].coin || 0

  let successCrimes = [
    'Hiciste evasión de impuestos y ganaste',
    'Hackeaste un cajero automático y robaste',
    'Falsificaste billetes con éxito y obtuviste',
    'Robaste una joyería durante la noche y conseguiste',
    'Vendiste órganos en el mercado negro por',
    'Estafaste a un político corrupto y ganaste',
    'Robaste criptomonedas desde una laptop olvidada y ganaste',
    'Atracaste un banco disfrazado de payaso y lograste obtener',
    'Estafaste con NFTs falsos y te dieron',
    'Hackeaste la cuenta de OnlyFans de alguien y lograste robar',
    'Vendiste humo con coaching de éxito y cobraste',
    'Cometiste phishing por correo y ganaste'
  ]

  let failCrimes = [
    'Te atraparon robando una tienda de donas',
    'Tropezaste durante una huida y fuiste arrestado',
    'Te delató tu cómplice y perdiste toda tu ganancia',
    'Intentaste hackear un banco y se te bloqueó la IP',
    'Fuiste descubierto por cámaras mientras robabas',
    'Usaste tu propia cuenta para estafar y te congelaron',
    'Una anciana te golpeó con su bastón durante un atraco',
    'Confesaste sin querer durante una entrevista de trabajo',
    'La policía te rastreó por usar el WiFi gratis del parque',
    'Intentaste vender drogas a un policía encubierto',
    'Tu máscara se cayó durante un atraco en vivo'
  ]

  let mixedCrimes = [
    'Robaste una cartera, pero solo tenía',
    'Hackeaste una cuenta de Steam, pero solo sacaste',
    'Cometiste un crimen menor y escapaste con',
    'Le vendiste una taza a un coleccionista por',
    'Rompiste una ventana y encontraste solo',
    'Robaste un camión, pero estaba vacío. Te llevaste',
  ]

  let option = Math.floor(Math.random() * 3)
  let amount = Math.floor(Math.random() * (20000 - 3000 + 1)) + 3000 // entre 3000 y 20000

  switch (option) {
    case 0: { 
      users[senderId].coin += amount
      users[randomUserId].coin -= amount
      conn.sendMessage(m.chat, {
        text: `✿ ${pickRandom(successCrimes)} *¥${amount.toLocaleString()} ${moneda}*\n> Crimen cometido con éxito, ¡felicidades ${senderName}!`,
        contextInfo: {
          mentionedJid: [randomUserId],
        }
      }, { quoted: m })
      break
    }
    case 1: {
      let loss = Math.min(amount, senderCoin)
      users[senderId].coin -= loss
      conn.reply(m.chat, `🥀 ${pickRandom(failCrimes)} y perdiste *¥${loss.toLocaleString()} ${moneda}*...`, m)
      break
    }
    case 2: {
      let partial = Math.min(amount, randomUserCoin)
      users[senderId].coin += partial
      users[randomUserId].coin -= partial
      conn.sendMessage(m.chat, {
        text: `✿ ${pickRandom(mixedCrimes)} *¥${partial.toLocaleString()} ${moneda}*\n> No fue mucho, pero algo es algo.`,
        contextInfo: {
          mentionedJid: [randomUserId],
        }
      }, { quoted: m })
      break
    }
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
  let minutos = Math.floor((segundos % 3600) / 60)
  let segundosRestantes = segundos % 60
  return `${minutos} minutos y ${segundosRestantes} segundos`
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}
