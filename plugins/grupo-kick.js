
let handler = async (m, { conn, participants, usedPrefix, command }) => {

let kickte = `🚩 *Etiqueta o responde al mensaje de la persona que quieres eliminar`

if (!m.mentionedJid[0] && !m.quoted) return m.reply(kickte, m.chat, { mentions: conn.parseMention(kickte)}) 
let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender
let owr = m.chat.split`-`[0]
await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
m.reply(`✅ 𝐮𝐬𝐮𝐚𝐫𝐢𝐨 𝐞𝐥𝐢𝐦𝐢𝐧𝐚𝐝𝐨 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐨) 

}

handler.help = ['kick @user']
handler.tags = ['group']
handler.command = ['kick', 'expulsar'] 
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler