import db from '../lib/database.js'
import fs from 'fs'
import PhoneNumber from 'awesome-phonenumber'
import { createHash } from 'crypto'
import fetch from 'node-fetch'

const canalJid = '120363397177582655@newsletter' // Canal donde se mandan los registros
const newsletterJid = '120363335626706839@newsletter' // Se usa para el contextInfo
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡『 𝐓͢ᴇ𝙖፝ᴍ⃨ 𝘾𝒉꯭𝐚𝑛𝑛𝒆𝑙: 𝑹ᴜ⃜ɓ𝑦-𝑯ᴏ𝒔𝑯𝙞꯭𝑛𝒐 』࿐⟡'
const packname = '✿⃝𓂃 𝑹𝙪͜͡𝑏𝙮 𝙃𝒐𝘀𝙝𝑖𝙣𝙤 ❀'

let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i

let handler = async function (m, { conn, text, usedPrefix, command }) {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  let mentionedJid = [who]
  let pp = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://files.catbox.moe/xr2m6u.jpg')
  let user = global.db.data.users[m.sender]
  let name2 = await conn.getName(m.sender)

  if (user.registered === true) return m.reply(`『✦』Ya estás registrado.\n\n*¿Quiere volver a registrarse?*\n\nUse este comando para eliminar su registro.\n*${usedPrefix}unreg*`)

  if (!Reg.test(text)) return m.reply(`『✦』Formato incorrecto.\n\nUso del comando: *${usedPrefix + command} nombre.edad*\nEjemplo : *${usedPrefix + command} ${name2}.18*`)

  let [_, name, splitter, age] = text.match(Reg)
  if (!name) return m.reply(`『✦』El nombre no puede estar vacío.`)
  if (!age) return m.reply(`『✦』La edad no puede estar vacía.`)
  if (name.length >= 100) return m.reply(`『✦』El nombre es demasiado largo.`)
  age = parseInt(age)
  if (age > 1000) return m.reply(`『✦』Wow el abuelo quiere jugar al bot.`)
  if (age < 5) return m.reply(`『✦』hay un abuelo bebé jsjsj.`)

  user.name = name + '✓'.trim()
  user.age = age
  user.regTime = +new Date
  user.registered = true
  user.coin += 40
  user.exp += 300
  user.joincount += 20

  let regbot = `╭══• ೋ•✧๑♡๑✧•ೋ •══╮
*¡𝚁𝙴𝙶𝙸𝚂𝚃𝚁𝙾 𝙲𝙾𝙼𝙿𝙻𝙴𝚃𝙾 𝙴𝚇𝙸𝚃𝙾𝚂𝙾!*
╰══• ೋ•✧๑♡๑✧•ೋ •══╯
║_-~-__-~-__-~-__-~-__-~-__-~-__-~-__-~-__-~-__-~-__
║
║ ֪ ׂ⛓️ ̶ ׁ ֪ 𝐍𝐨𝐦𝐛𝐫𝐞: ${name}
║ ֪ ׁ🌫️  𝇌 𝐄𝐝𝐚𝐝: ${age} *Años*
║
║ *𝙶𝚛𝚊𝚌𝚒𝚊𝚜 𝚙𝚘𝚛 𝚛𝚎𝚐𝚒𝚜𝚝𝚛𝚊𝚛𝚝𝚎* 
║📝 *𝚄𝚝𝚒𝚕𝚒𝚣𝚊* *.menu* *𝚙𝚊𝚛𝚊* *𝚟𝚎𝚛* *𝚎𝚕* *𝚖𝚎𝚗ú* *𝚍𝚎* *𝚌𝚘𝚖𝚊𝚗𝚍𝚘𝚜.* 
║
║ ✨ 𝗥𝗲𝗰𝗼𝗺𝗽𝗲𝗻𝘀𝗮𝘀:
║• 🪙 Monedas: 40
║• 🧪 Exp: 300
║• 💸 Tokens: 20
╚══✦「꧙꧙꧙꧙꧙꧙꧙꧙꧙꧙꧙꧙」
> 🎈 ¡Gracias por usar Ruby-Hoshino-Bot!
> Sígueme en el canal para novedades.`

  const contextInfo = {
    mentionedJid: [m.sender],
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
      newsletterJid,
      newsletterName,
      serverMessageId: -1
    },
    externalAdReply: {
      title: packname,
      body: typeof global.dev === 'string' ? global.dev : 'Bot oficial',
      thumbnailUrl: typeof global.icons === 'string' ? global.icons : pp,
      sourceUrl: typeof global.redes === 'string' ? global.redes : null,
      mediaType: 1,
      renderLargerThumbnail: false
    }
  }

  await conn.sendMessage(m.chat, {
    text: regbot,
    contextInfo
  }, { quoted: m })

  let about = (await conn.fetchStatus(m.sender).catch(() => ({}))).status || 'null'

  await conn.sendMessage(canalJid, {
    image: { url: pp },
    caption: `📋 *NUEVO REGISTRO*
👤 *Nombre:* ${name}
🎂 *Edad:* ${age}
📞 *Número:* wa.me/${m.sender.split('@')[0]}
📝 *Descripción:* ${about}`,
*no pajearse con las fotos (opcional)*
    contextInfo
  })
}

handler.help = ['reg']
handler.tags = ['rg']
handler.command = ['verify', 'verificar', 'reg', 'register', 'registrar']

export default handler
