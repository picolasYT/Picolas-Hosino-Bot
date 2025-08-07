// plugins/setbot.js

/**
* @type {import('@whiskeysockets/baileys')}
*/
const {
    proto
} = (await import('@whiskeysockets/baileys')).default

let handler = async (m, { conn, text, usedPrefix, command, isAdmin }) => {
    if (!m.isGroup) {
        return m.reply('Este comando solo se puede usar en grupos.');
    }
    if (!isAdmin) {
        return m.reply('Solo los administradores del grupo pueden usar este comando.');
    }

    let chat = global.db.data.chats[m.chat];
    if (!chat) {
        global.db.data.chats[m.chat] = {};
        chat = global.db.data.chats[m.chat];
    }

    let who = m.mentionedJid && m.mentionedJid[0];
    if (!who) {
        return m.reply(`《✧》 Debes mencionar a un bot del grupo para establecerlo como primario.\n\n> Ejemplo:\n> *${usedPrefix + command} @tagdelbot*`);
    }

    // Verificamos que el JID mencionado es un participante del grupo
    const participants = m.isGroup ? (await conn.groupMetadata(m.chat)).participants : [];
    const botParticipant = participants.find(p => p.id === who);

    if (!botParticipant) {
        return m.reply('El bot que mencionaste no se encuentra en este grupo.');
    }

    // Guardamos la configuración
    chat.per = [who]; // Establece al bot mencionado como el ÚNICO permitido
    chat.antiLag = true; // Activa el modo 'antiLag' que ahora funciona como 'bot primario'

    let botName = conn.getName(who);

    await conn.reply(m.chat, `✐ Se ha establecido a @${who.split('@')[0]} como bot primario de este grupo.\n\nA partir de ahora, todos los comandos del grupo serán ejecutados por @${who.split('@')[0]}.`, m, {
        mentions: [who]
    });
}

handler.help = ['setbot @bot'];
handler.tags = ['group'];
handler.command = /^(setbot|botprimario)$/i;

handler.group = true;
handler.admin = true;

export default handler;