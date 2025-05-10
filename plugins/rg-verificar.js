import db from '../lib/database.js'
import fs from 'fs'
import PhoneNumber from 'awesome-phonenumber'
import { createHash } from 'crypto'  
import fetch from 'node-fetch'

let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i

let handler = async function (m, { conn, text, usedPrefix, command }) {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  let mentionedJid = [who]
  let pp = await conn.profilePictureUrl(who, 'image').catch((_) => 'https://files.catbox.moe/xr2m6u.jpg')
  let user = global.db.data.users[m.sender]
  let name2 = conn.getName(m.sender)
  if (user.registered === true) return m.reply(`『✦』Ya estás registrado.\n\n*¿Quiere volver a registrarse?*\n\nUse este comando para eliminar su registro.\n*${usedPrefix}unreg*`)
  if (!Reg.test(text)) return m.reply(`『✦』Formato incorrecto.\n\nUso del comamdo: *${usedPrefix + command} nombre.edad*\nEjemplo : *${usedPrefix + command} ${name2}.18*`)
  let [_, name, splitter, age] = text.match(Reg)
  if (!name) return m.reply(`『✦』El nombre no puede estar vacío.`)
  if (!age) return m.reply(`『✦』La edad no puede estar vacía.`)
  if (name.length >= 100) return m.reply(`『✦』El nombre es demasiado largo.`)
  age = parseInt(age)
  if (age > 1000) return m.reply(`『✦』Wow el abuelo quiere jugar al bot.`)
  if (age < 5) return m.reply(`『✦』hay un abuelo bebé jsjsj.`)
  user.name = name + '✓'.trim()
  user.age = age
  user.regTime = + new Date      
  user.registered = true
  global.db.data.users[m.sender].coin += 40
  global.db.data.users[m.sender].exp += 300
  global.db.data.users[m.sender].joincount += 20
  let sn = createHash('md5').update(m.sender).digest('hex').slice(0, 20)
  let regbot = `╭══• ೋ•✧๑♡๑✧•ೋ •══╮
*¡𝚁𝙴𝙶𝙸𝚂𝚃𝚁𝙾 𝙲𝙾𝙼𝙿𝙻𝙴𝚃𝙾 𝙴𝚇𝙸𝚃𝙾𝚂𝙾!*
╰══• ೋ•✧๑♡๑✧•ೋ •══╯
║_-~-__-~-__-~-__-~-__-~-__-~-__-~-__-~-__-~-__-~-__
║
║ ֪ ׂ⛓️ ̶ ׁ ֪ 𝐍𝐨𝐦𝐛𝐫𝐞: ${name}
║ ֪ ׁ🌫️  𝇌 𝐄𝐝𝐚𝐝: ${age} *Años*
║
║ *𝙶𝚛𝚊𝚌𝚒𝚜 𝚙𝚘𝚛 𝚛𝚎𝚐𝚒𝚜𝚝𝚛𝚊𝚛𝚝𝚎* 
║📝 *𝚄𝚝𝚒𝚕𝚒𝚣𝚊* *.menu* *𝚙𝚊𝚛𝚊* *𝚟𝚎𝚛* *𝚎𝚕* *𝚖𝚎𝚗ú* *𝚍𝚎* *𝚌𝚘𝚖𝚊𝚗𝚍𝚘𝚜.*
║
║
║ ✨ 𝗥𝗲𝗰𝗼𝗺𝗽𝗲𝗻𝘀𝗮𝘀:
║• *${moneda}* » 40
║•  *Experiencia* » 300 🪙
║• *Tokens* » 20 💸
╚══✦「꧙꧙꧙꧙꧙꧙꧙꧙꧙꧙꧙꧙」
> 🎈 ¡Muchísimas gracias por usar a Ruby-Hoshino-Bot!
> Recuerda seguirme en mi canal para que no te pierdas nada de las novedades del bot. ¡Diviértete!`

  conn.sendMessage(m.chat, {
    text: regbot,
    contextInfo: {
      externalAdReply: {
        title: '⊱『✅𝆺𝅥 𝗥𝗘𝗚𝗜𝗦𝗧𝗥𝗔𝗗𝗢(𝗔) 𝆹𝅥✅』⊰',
        body: wm, 
        thumbnailUrl: 'https://qu.ax/FGSG.jpg', 
        mediaType: 1,
        showAdAttribution: true,
        renderLargerThumbnail: true,
      },
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363335626706839@newsletter',
        newsletterName: '⛦『 ✎𝐓͢ᴇ𝙖፝ᴍ⃨ 𝘾𝒉꯭𝐚𝑛𝑛𝒆𝑙 𝑹ᴜ⃛ɓ𝑦-𝑯ᴏ⃔𝒔𝑯𝙞꯭𝑛⃡𝒐✎ 』⛦',
        serverMessageId: '-1',
      }
    }
  }, { quoted: fkontak })
};
handler.help = ['reg']
handler.tags = ['rg']
handler.command = ['verify', 'verificar', 'reg', 'register', 'registrar'] 

export default handler
