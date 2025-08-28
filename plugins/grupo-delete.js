var handler = async (m, { conn, participants, usedPrefix, command }) => {
    if (!m.mentionedJid[0] && !m.quoted) {
        return conn.reply(m.chat, `⚠️ 𝘿𝙚𝙗𝙚𝙨 𝙢𝙚𝙣𝙘𝙞𝙤𝙣𝙖𝙧 𝙤 𝙧𝙚𝙨𝙥𝙤𝙣𝙙𝙚𝙧 𝙖𝙡 𝙢𝙚𝙣𝙨𝙖𝙟𝙚 𝙙𝙚𝙡 𝙪𝙨𝙪𝙖𝙧𝙞𝙤 𝙦𝙪𝙚 𝙦𝙪𝙞𝙚𝙧𝙖𝙨 𝙚𝙭𝙥𝙪𝙡𝙨𝙖𝙧.`, m);
    }

    let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender;

    const groupInfo = await conn.groupMetadata(m.chat);
    const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net';
    const ownerBot = global.owner[0][0] + '@s.whatsapp.net';

    if (user === conn.user.jid) {
        return conn.reply(m.chat, `🤖 𝐍𝐨 𝐩𝐮𝐞𝐝𝐨 𝐞𝐥𝐢𝐦𝐢𝐧𝐚𝐫 𝐚𝐥 𝐛𝐨𝐭 𝐝𝐞𝐥 𝐆𝐫𝐮𝐩𝐨.`, m);
    }

    if (user === ownerGroup) {
        return conn.reply(m.chat, `👑 𝐍𝐨 𝐩𝐮𝐞𝐝𝐨 𝐞𝐥𝐢𝐦𝐢𝐧𝐚𝐫 𝐚𝐥 𝐩𝐫𝐨𝐩𝐢𝐞𝐭𝐚𝐫𝐢𝐨 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐨.`, m);
    }

    if (user === ownerBot) {
        return conn.reply(m.chat, `🔒 𝐍𝐨 𝐩𝐮𝐞𝐝𝐨 𝐞𝐥𝐢𝐦𝐢𝐧𝐚𝐫 𝐚 𝐮𝐧𝐨 𝐝𝐞 𝐦𝐢𝐬 𝐜𝐫𝐞𝐚𝐝𝐨𝐫𝐞𝐬.`, m);
    }

    await conn.groupParticipantsUpdate(m.chat, [user], 'remove');

    if (m.quoted) {
        try {
            await conn.sendMessage(m.chat, { 
                delete: { 
                    remoteJid: m.chat, 
                    fromMe: false, 
                    id: m.quoted.key.id, 
                    participant: m.quoted.key.participant 
                } 
            });
        } catch (e) {
            console.error("❌ Error al eliminar mensaje:", e);
        }
    }
};

handler.help = ['kick'];
handler.tags = ['grupo'];
handler.command = ['kick','echar','hechar','sacar','ban'];
handler.admin = true;
handler.group = true;
handler.register = true;
handler.botAdmin = true;

export default handler;
