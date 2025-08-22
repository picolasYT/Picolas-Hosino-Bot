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

  if (user.registered === true) 
    return m.reply(`『✦』Ya estás registrado.\n\n*¿Quieres volver a registrarte?*\n\nUsa este comando para eliminar tu registro:\n*${usedPrefix}unreg*`)

  if (!Reg.test(text)) 
    return m.reply(`『✦』Formato incorrecto.\n\nUso: *${usedPrefix + command} nombre.edad*\nEjemplo: *${usedPrefix + command} ${name2}.18*`)

  let [_, name, splitter, age] = text.match(Reg)
  if (!name) return m.reply(`『✦』El nombre no puede estar vacío.`)
  if (!age) return m.reply(`『✦』La edad no puede estar vacía.`)
  if (name.length >= 100) return m.reply(`『✦』El nombre es demasiado largo.`)

  age = parseInt(age)
  if (age > 1000) return m.reply(`『✦』Wow, el abuelo quiere jugar con el bot.`)
  if (age < 5) return m.reply(`『✦』Hay un bebé queriendo usar el bot jsjs.`)

  user.name = name + '✓'.trim()
  user.age = age
  user.regTime = + new Date      
  user.registered = true

  let recompensa = {
    money: 40,
    estrellas: 10,
    exp: 300,
    joincount: 20
  }
  user.coin += recompensa.money
  user.exp += recompensa.exp
  user.joincount += recompensa.joincount

  let sn = createHash('md5').update(m.sender).digest('hex').slice(0, 20)

  let regbot = `
꒰͡ ׄ𖹭⃨᤻ ͡꒱ֽ𖹭⃨᤻ ͡꒱ֽ ׄ  𝙍𝙀𝙂𝙄𝙎𝙏𝙍𝙊 𝙀𝙓𝙄𝙏𝙊𝙎𝙊! ꒰͡ ׄ𖹭⃨᤻ ͡꒱ֽ𖹭⃨᤻ ͡꒱ֽ ׄ
         ◟︶࿙𝆊࿚ׁׁׂׂׂׂׂ𝆊࣪࣪࿙࿚ׂ︶◞ 𖣁  ◟︶࿙𝆊࿚ׁׁׂׂׂׂׂ𝆊࣪࣪࿙࿚ׂ︶◞

╭─┄• ⋆˚ᨶ႒ᩚ ᴛᴜs ᴅᴀᴛᴏs ᴅᴇ ᴜsᴜᴀʀɪᴏ ᨶ႒ᩚ˚⋆ •··•┄─╮
│✐ *𝑵𝑶𝑴𝑩𝑹𝑬:* ${nombre} 
│✐  *𝑬𝑫𝑨𝑫:* ${edad} años
╰─┄•·.·꒷︶꒷꒥꒷‧₊˚૮꒰˵•ᵜ•˵꒱ა‧₊˚꒷︶꒷꒥꒷·.·•┄─╯
 
 ·˚ ༘₊· ͟͟͞͞꒰➳ ࣪ ˖ ࣪ rᥱᥴ᥆m⍴ᥱᥒsᥲs ძᥱ ᑲіᥱᥒ᥎ᥱᥒіძᥲ! ᰔ ִ ׄ
> ╾᮫ׅׄ╼ ׄ ─໋〪ׅ┄ׄ╌ ׅ╌ ׄ─ ׅ 〪┄𞄳  ׄ╾ׅ━ׄ  ━໋ׅ╼  ׄ┄〪ׅ  ׄ─ ׅ╌𞄳  ׄ╌┄〪ׅ─ׄ  ׅ╾ׄ╼〪
> ❛  💵ᩧ̷ׅ  ── *Dinero:* +${recompensa.money}
> ❛  🌟ᩧ̷ׅ  ── *Estrellas:* +${recompensa.estrellas}
> ❛  📈ᩧ̷ׅ  ── *EXP:* +${recompensa.exp}
> ❛  🎟️ᩧ̷ׅ  ── *Tokens:* +${recompensa.joincount}
> ╾᮫ׅׄ╼ ׄ ─໋〪ׅ┄ׄ╌ ׅ╌ ׄ─ ׅ 〪┄𞄳  ׄ╾ׅ━ׄ  ━໋ׅ╼  ׄ┄〪ׅ  ׄ─ ׅ╌𞄳  ׄ╌┄〪ׅ─ׄ  ׅ╾ׄ╼〪

> ¡Gracias por unirte! Ahora estás list@ para brillar.
> Usa *${usedPrefix}menu* para descubrir todos mis comandos.

ᅟᓭ݄︢݃ୄᰰ𐨎 𝐢︩۪۪۪۪۪۪۪۪۪۪𝆬͡ꗜ፝֟͜͡ꗜ︪۪۪۪۪۪۪۪۪۪۪۪𝆬͡𝐢   ᅟᨳᩘ🥛ଓ   ᅟ 𝐢︩۪۪۪۪۪۪۪۪۪۪𝆬͡ꗜ፝֟͜͡ꗜ︪۪۪۪۪۪۪۪۪۪۪۪𝆬͡𝐢ୄᰰ𐨎ᓯ︢
`.trim()

  await m.react('📩')

  await conn.sendMessage(m.chat, {
    text: regbot,
    contextInfo: {
      externalAdReply: {
        title: '✧ 𝐔𝐬𝐮𝐚𝐫𝐢𝐨 𝐕𝐞𝐫𝐢𝐟𝐢𝐜𝐚𝐝𝐨 ✧',
        body: 'Registro completado',
        thumbnailUrl: pp,
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })
}; 

handler.help = ['reg']
handler.tags = ['rg']
handler.command = ['verify', 'verificar', 'reg', 'register', 'registrar'] 

export default handler
