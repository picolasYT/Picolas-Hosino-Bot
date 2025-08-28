var handler = async (m, { conn, participants, usedPrefix, command }) => {
    if (!m.mentionedJid[0] && !m.quoted) {
        return conn.reply(m.chat, ` Debes mencionar a un usuario para poder expulsarlo del grupo.`, m);
    }

    let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender;

    const groupInfo = await conn.groupMetadata(m.chat);
    const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net';
    const ownerBot = global.owner[0][0] + '@s.whatsapp.net';
    //const nn = conn.getName(m.sender);

    if (user === conn.user.jid) {
        return conn.reply(m.chat, ` No puedo eliminar el bot del grupo.`, m);
    }

    if (user === ownerGroup) {
        return conn.reply(m.chat, ` No puedo eliminar al propietario del grupo.`, m);
    }

    if (user === ownerBot) {
        return conn.reply(m.chat, ` No puedo eliminar al propietario del bot.`, m);
    }

    await conn.groupParticipantsUpdate(m.chat, [user], 'remove');

    let messages = await conn.loadMessages(m.chat, 1000);
    let userMessages = messages.filter(msg => msg.key.participant === user);

    for (let msg of userMessages) {
        await new Promise(resolve => setTimeout(resolve, 1500)); // delay 1.5s entre cada borrado
        try {
            await conn.sendMessage(m.chat, { delete: msg.key });
        } catch (e) {}
    }

    //conn.reply(`${suitag}@s.whatsapp.net`, ` Un Admin Acabo De Eliminar Un Usuario En El Grupo:\n> ${groupMetadata.subject}.`, m, rcanal, );
};

handler.help = ['kick'];
handler.tags = ['grupo'];
handler.command = ['kick','echar','hechar','sacar','ban'];
handler.admin = true;
handler.group = true;
handler.register = true
handler.botAdmin = true;

export default handler;
