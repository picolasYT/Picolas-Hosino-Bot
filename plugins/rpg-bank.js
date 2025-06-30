import db from '../lib/database.js'

let handler = async (m, { conn, usedPrefix }) => {
    let who = m.mentionedJid[0] 
            ? m.mentionedJid[0] 
            : m.quoted 
            ? m.quoted.sender 
            : m.sender

    if (who === conn.user.jid) return m.react('✖️')
    if (!(who in global.db.data.users)) {
        return m.reply(`${emoji} El usuario no se encuentra en mi base de datos.`)
    }

    let user = global.db.data.users[who]
    let name = await conn.getName(who)

    let dinero = (user.coin || 0).toLocaleString()
    let banco = (user.bank || 0).toLocaleString()
    let total = ((user.coin || 0) + (user.bank || 0)).toLocaleString()

    let texto = `
┏━━━━━━━━━━━━━━━━━━⬣
┃ 𓆩⟡𖥔 𝐁𝐀𝐋𝐀𝐍𝐂𝐄 𝐄𝐂𝐎𝐍𝐎́𝐌𝐈𝐂𝐎 𖥔⟡𓆪
┃     
┃ 🧑‍💼 Usuario: *${name}*
┃ 💸 Dinero: *¥${dinero} Yenes*
┃ 🏦 Banco: *¥${banco} Yenes*
┃ 💰 Total: *¥${total} Yenes*
┃     
┃ 🪙 Protege tu dinero, deposítalo
┃ usando *${usedPrefix}deposit*
┗━━━━━━━━━━━━━━━━━━⬣`.trim()

    await conn.reply(m.chat, texto, m)
}

handler.help = ['bal']
handler.tags = ['rpg']
handler.command = ['bal', 'balance', 'bank'] 
handler.register = true 
handler.group = true 

export default handler
