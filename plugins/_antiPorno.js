let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Obtiene los datos del chat actual desde la base de datos.
    let chat = global.db.data.chats[m.chat];
    if (!chat) chat = global.db.data.chats[m.chat] = {};

    if (command === 'botprimario' || command === 'setbot') {
        if (!m.mentionedJid[0]) {
            throw `《✧》 Debes mencionar a un bot del grupo para establecerlo como primario.\n\n> ❀ Ejemplo:\n> *${usedPrefix + command} @tagdelbot*`;
        }

        let botJid = m.mentionedJid[0];
        let botName = conn.getName(botJid);

        // Guardamos el JID del bot elegido en la configuración del chat.
        chat.primaryBot = botJid;

        await conn.reply(m.chat, `✐ Se ha establecido a *@${botJid.split('@')[0]}* como bot primario de este grupo.\n\nA partir de ahora, todos los comandos del grupo serán ejecutados por *@${botJid.split('@')[0]}*.`, m, {
            mentions: [botJid]
        });
    } else if (command === 'delbot') {
        if (!chat.primaryBot) {
            throw `《✧》 No hay ningún bot primario establecido en este grupo.`;
        }
        
        let oldBotJid = chat.primaryBot;
        
        // Eliminamos la configuración del bot primario.
        delete chat.primaryBot;

        await conn.reply(m.chat, `✓ Se ha eliminado la configuración de bot primario. Ahora todos los bots responderán en este grupo.`, m, {
            mentions: [oldBotJid]
        });
    }
};

handler.help = ['botprimario @bot', 'delbot'];
handler.tags = ['group'];
handler.command = ['botprimario', 'setbot', 'delbot'];
handler.group = true;
handler.admin = true; // Solo los admins pueden usar este comando.

export default handler;