import ws from 'ws'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix, command, isOwner }) => {
  // Comandos disponibles
  const isDeleteSession = /^(deletesesion|deletebot|deletesession|deletesesaion)$/i.test(command)
  const isPauseBot = /^(stop|pausarai|pausarbot)$/i.test(command)
  const isShowBots = /^(bots|sockets|socket)$/i.test(command)
  const isShowBotsNums = /^(botsnums|botsnum|botnums|botlnums)$/i.test(command)

  // Eliminar sesión de sub-bot
  if (isDeleteSession) {
    const who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    const uniqid = `${who.split('@')[0]}`
    const dirPath = `./${global.jadi || 'jadibot'}/${uniqid}`

    if (!fs.existsSync(dirPath)) {
      await conn.sendMessage(m.chat, {
        text: `🚫 *Sesión no encontrada*\n\n✨ No tienes una sesión activa.\n\n🔰 Puedes crear una con:\n*${usedPrefix}jadibot*\n\n📦 ¿Tienes un ID?\nUsa este comando seguido del ID:\n*${usedPrefix}jadibot* \`\`\`(ID)\`\`\``
      }, { quoted: m })
      return
    }

    if (global.conn.user.jid !== conn.user.jid) {
      await conn.sendMessage(m.chat, {
        text: `💬\n🔗 Accede desde aquí:\nhttps://api.whatsapp.com/send/?phone=${global.conn.user.jid.split`@`[0]}&text=${usedPrefix + command}&type=phone_number&app_absent=0`
      }, { quoted: m })
      return
    }

    await conn.sendMessage(m.chat, {
      text: `🗑️ Tu sesión como *Sub-Bot* ha sido eliminada con éxito.`
    }, { quoted: m })

    try {
      fs.rmSync(dirPath, { recursive: true, force: true })
      await conn.sendMessage(m.chat, {
        text: `🌈 ¡Todo limpio! Tu sesión y sus rastros han sido borrados por completo.`
      }, { quoted: m })
    } catch (e) {
      await m.reply(`⚠️ Ocurrió un error inesperado al eliminar la sesión.`)
      console.error(e)
    }
    return
  }

  // Pausar sub-bot
  if (isPauseBot) {
    if (global.conn.user.jid == conn.user.jid) {
      conn.reply(m.chat, `🚫 No puedes pausar el bot principal.\n🛟 Si deseas ser un *Sub-Bot*, contacta con el número principal.`, m)
    } else {
      await conn.reply(m.chat, `🔕 *${global.botname || 'El bot'} ha sido pausada.*`, m)
      conn.ws.close()
    }
    return
  }

  // Mostrar solo nombres de sub-bots (.bots)
  if (isShowBots) {
    const users = [...new Set([...global.conns.filter(conn => conn.user && conn.ws && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED)])]
    const listaSubBots = users.map((v, i) =>
      `🌟 *SUB-BOT #${i + 1}*\n👤 Nombre: ${v.user.name || 'Sub-Bot'}`
    ).join('\n\n───────────────\n\n')

    const finalMessage = users.length === 0
      ? '💤 No hay Sub-Bots activos por ahora... intenta más tarde.'
      : listaSubBots

    const msg = `
🤖 𝐋𝐈𝐒𝐓𝐀 𝐃𝐄 𝐒𝐔𝐁-𝐁𝐎𝐓𝐒 𝐀𝐂𝐓𝐈𝐕𝐎𝐒 💫

¿𝐐𝐮𝐢𝐞𝐫𝐞𝐬 𝐭𝐞𝐧𝐞𝐫 𝐮𝐧 𝐛𝐨𝐭 𝐞𝐧 𝐭𝐮 𝐠𝐫𝐮𝐩𝐨?
𝖯𝗎𝖾d𝖾𝗌 𝗉𝖾𝖽𝗂𝗋 𝗉𝖾𝗋𝗆𝗂𝗌𝗈 𝖺 uno de ellos para unirlo sin problema!

🌐 𝐒𝐔𝐁-𝐁𝐎𝐓𝐒 𝐂𝐎𝐍𝐄𝐂𝐓𝐀𝐃𝐎𝐒: ${users.length || '0'}

${finalMessage}`.trim()

    await conn.sendMessage(m.chat, {
      text: msg,
      mentions: [] // No mencionar usuarios
    }, { quoted: m })
    return
  }

  // Mostrar nombres + número (solo para admins, privado)
  if (isShowBotsNums) {
    // Si quieres restringir solo a owner, descomenta:
    // if (!isOwner) return m.reply('❌ Solo el owner puede usar este comando.')

    const users = [...new Set([...global.conns.filter(conn => conn.user && conn.ws && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED)])]
    const convertirMsADiasHorasMinutosSegundos = (ms) => {
      let segundos = Math.floor(ms / 1000)
      let minutos = Math.floor(segundos / 60)
      let horas = Math.floor(minutos / 60)
      let días = Math.floor(horas / 24)
      segundos %= 60
      minutos %= 60
      horas %= 24
      return [
        días ? `${días} día(s)` : '',
        horas ? `${horas} hora(s)` : '',
        segundos ? `${segundos} segundo(s)` : '',
      ].filter(Boolean).join(', ')
    }
    const listaSubBots = users.map((v, i) =>
`🌟 *SUB-BOT #${i + 1}*
📱 Número: https://wa.me/${v.user.jid.replace(/[^0-9]/g, '')}?text=${usedPrefix}estado
👤 Nombre: ${v.user.name || 'Sub-Bot'}
🕒 En línea hace: ${v.uptime ? convertirMsADiasHorasMinutosSegundos(Date.now() - v.uptime) : 'Desconocido'}`)
      .join('\n\n───────────────\n\n')

    const finalMessage = listaSubBots.length === 0
      ? '💤 No hay Sub-Bots activos por ahora... intenta más tarde.'
      : listaSubBots

    const msg = `
🤖 𝐋𝐈𝐒𝐓𝐀 𝐃𝐄 𝐒𝐔𝐁-𝐁𝐎𝐓𝐒 𝐀𝐂𝐓𝐈𝐕𝐎𝐒 💫

¿𝐐𝐮𝐢𝐞𝐫𝐞𝐬 𝐭𝐞𝐧𝐞𝐫 𝐮𝐧 𝐛𝐨𝐭 𝐞𝐧 𝐭𝐮 𝐠𝐫𝐮𝐩𝐨?
𝖯𝗎𝖾d𝖾𝗌 𝗉𝖾𝖉𝗂𝗋 𝗉𝖾𝗋𝗆𝗂𝗌𝗈 𝖺 uno de ellos para unirlo sin problema!

🌐 𝐒𝐔𝐁-𝐁𝐎𝐓𝐒 𝐂𝐎𝐍𝐄𝐂𝐓𝐀𝐃𝐎𝐒: ${users.length || '0'}

${finalMessage}`.trim()

    await conn.sendMessage(m.chat, {
      text: msg,
      mentions: [] // No mencionamos
    }, { quoted: m })
    return
  }

  // Si no coincide comando, no hacer nada
  return
}

handler.tags = ['serbot']
handler.help = ['sockets', 'deletesesion', 'pausarai', 'botsnums']
handler.command = [
  'deletesesion', 'deletebot', 'deletesession', 'deletesesaion',
  'stop', 'pausarai', 'pausarbot',
  'bots', 'sockets', 'socket',
  'botsnums', 'botsnum', 'botnums', 'botlnums'
]

export default handler