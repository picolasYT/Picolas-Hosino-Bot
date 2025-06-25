// Normaliza cualquier JID a la forma @s.whatsapp.net
function normalizeJid(jid) {
    if (!jid) return '';
    if (jid.endsWith('@s.whatsapp.net')) return jid;
    if (jid.endsWith('@lid')) {
        let user = jid.split('@')[0];
        return user + '@s.whatsapp.net';
    }
    return jid;
}

var handler = async (m, { conn, participants, usedPrefix, command }) => {
    if ((!m.mentionedJid || !m.mentionedJid[0]) && !m.quoted) {
        return conn.reply(m.chat, `❌ Debes mencionar o citar a un usuario para expulsarlo del grupo.`, m);
    }

    // Detectar usuario a expulsar (mención o citado)
    let user = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null);
    if (!user) return conn.reply(m.chat, `❌ No se pudo detectar el usuario.`, m);

    // Normaliza todos los JIDs necesarios
    user = normalizeJid(user);
    const groupInfo = await conn.groupMetadata(m.chat);
    const ownerGroup = normalizeJid(groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net');
    const ownerBot = normalizeJid(global.owner[0][0] + '@s.whatsapp.net');
    const botJid = normalizeJid(conn.user.lid || conn.user.jid);

    // No expulsar al bot
    if (user === botJid) {
        return conn.reply(m.chat, `🚫 No puedo eliminar al bot del grupo.`, m);
    }

    // No expulsar al dueño del grupo
    if (user === ownerGroup) {
        return conn.reply(m.chat, `🚫 No puedo eliminar al propietario del grupo.`, m);
    }

    // No expulsar al dueño del bot
    if (user === ownerBot) {
        return conn.reply(m.chat, `🚫 No puedo eliminar al propietario del bot.`, m);
    }

    // No expulsar a otro admin si no eres el owner
    const isAdmin = participants.find(u => normalizeJid(u.id) === normalizeJid(user))?.admin;
    const senderIsOwner = participants.find(u => normalizeJid(u.id) === normalizeJid(m.sender))?.admin === 'superadmin';
    if (isAdmin && !senderIsOwner) {
        return conn.reply(m.chat, `🚫 No puedes eliminar a otro administrador si no eres el dueño del grupo.`, m);
    }

    // Ejecutar expulsión
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
    // Puedes agregar aquí un mensaje de éxito si quieres
};

handler.help = ['kick'];
handler.tags = ['grupo'];
handler.command = ['kick','echar','hechar','sacar','ban'];
handler.admin = true;
handler.group = true;
handler.register = true;
handler.botAdmin = true;

export default handler;