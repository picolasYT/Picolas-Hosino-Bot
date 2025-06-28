let cooldowns = {}

let handler = async (m, { conn, text, command, usedPrefix }) => {
  let users = global.db.data.users[m.sender]
  const tiempoEspera = 10 // en segundos

  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempoEspera * 1000) {
    let tiempoRestante = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempoEspera * 1000 - Date.now()) / 1000))
    return conn.reply(m.chat, `《✧》Ya hiciste una apuesta recientemente.\n⏱ Espera *${tiempoRestante}* antes de intentarlo de nuevo.`, m)
  }
  cooldowns[m.sender] = Date.now()

  if (!text) {
    return conn.reply(m.chat, `《✧》Debes especificar *black* o *red*\n> Ejemplo » *${usedPrefix + command} 25000 red*`, m)
  }

  let args = text.trim().split(" ")
  if (args.length !== 2) {
    return conn.reply(m.chat, `《✧》Debes apostar una cantidad válida.\n> Ejemplo » *${usedPrefix + command} 25000 red*`, m)
  }

  let coin = parseInt(args[0])
  let color = args[1].toLowerCase()

  if (isNaN(coin) || coin <= 0) {
    return conn.reply(m.chat, `《✧》Debes apostar una cantidad válida.\n> Ejemplo » *${usedPrefix + command} 25000 red*`, m)
  }

  if (!(color === 'black' || color === 'red')) {
    return conn.reply(m.chat, `《✧》Debes especificar *black* o *red*\n> Ejemplo » *${usedPrefix + command} 25000 red*`, m)
  }

  if (coin > users.coin) {
    return conn.reply(m.chat, `《✧》No tienes suficientes *${moneda}* para apostar esa cantidad.`, m)
  }

  await conn.reply(m.chat, `🎲 Has apostado *¥${coin.toLocaleString()} ${moneda}* al color *${color}*.\n⏳ Espera 10 segundos para conocer el resultado...`, m)

  setTimeout(() => {
    let resultado = Math.random() < 0.5 ? 'black' : 'red'
    let hasGanado = resultado === color
    let ganancia = Math.floor(Math.random() * (20000 - 5000 + 1)) + 5000

    if (hasGanado) {
      users.coin += ganancia
      conn.reply(m.chat, `「✿」La ruleta salió en *${resultado}* y has ganado *¥${ganancia.toLocaleString()} ${moneda} 💴*!`, m)
    } else {
      users.coin -= coin
      conn.reply(m.chat, `「✿」La ruleta salió en *${resultado}* y perdiste *¥${coin.toLocaleString()} ${moneda}* 😿`, m)
    }

  }, 10000)
}

handler.tags = ['economy']
handler.help = ['ruleta *<cantidad> <color>*']
handler.command = ['ruleta', 'roulette', 'rt']
handler.register = true
handler.group = true

export default handler

function segundosAHMS(segundos) {
  let minutos = Math.floor(segundos / 60)
  let segundosRestantes = segundos % 60
  return `${minutos}m ${segundosRestantes}s`
}
