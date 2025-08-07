// Creado por Gemini - Versión de Diagnóstico

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let chat = global.db.data.chats[m.chat];
    if (!chat) chat = global.db.data.chats[m.chat] = {};

    if (command === 'botprimario' || command === 'setbot') {
        if (!m.mentionedJid[0]) {
            throw `《✧》 Debes mencionar a un bot del grupo para establecerlo como primario.\n\n> ❀ Ejemplo:\n> *${usedPrefix + command} @tagdelbot*`;
        }

        let botJid = m.mentionedJid[0];
        
        // Guardamos el JID
        chat.primaryBot = botJid;
        
        // Mensaje de diagnóstico en la consola del bot
        console.log(`[DIAGNÓSTICO] Bot primario establecido en el chat ${m.chat}: ${botJid}`);

        await conn.reply(m.chat, `✐ Se ha establecido a *@${botJid.split('@')[0]}* como bot primario de este grupo.\n\nA partir de ahora, solo este bot ejecutará los comandos.`, m, {
            mentions: [botJid]
        });

    } else if (command === 'delbot') {
        if (!chat.primaryBot) {
            throw `《✧》 No hay ningún bot primario establecido en este grupo.`;
        }
        
        // Mensaje de diagnóstico en la consola del bot
        console.log(`[DIAGNÓSTICO] Se eliminó el bot primario del chat ${m.chat}.`);

        delete chat.primaryBot;

        await conn.reply(m.chat, `✓ Se ha eliminado la configuración de bot primario. Ahora todos los bots responderán.`, m);
    }
};

handler.help = ['botprimario @bot', 'delbot'];
handler.tags = ['group'];
handler.command = ['botprimario', 'setbot', 'delbot'];
handler.group = true;
handler.admin = true;

export default handler;