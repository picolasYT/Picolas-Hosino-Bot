let handler = async (m, { conn, text, usedPrefix, command }) => {
    let chat = global.db.data.chats[m.chat];
    
    if (m.mentionedJid.length === 0) {
        let reset = text.toLowerCase() === 'reset' || text.toLowerCase() === 'restablecer';
        if (reset) {
            if (!chat.botPrimario) return m.reply('《✧》 No hay ningún bot primario establecido en este grupo.');
            
            console.log(`[Bot Primario] Reseteando configuración para el chat: ${m.chat}`);
            chat.botPrimario = null;
            await m.reply(`✐ Se ha restablecido la configuración. Ahora todos los bots responderán nuevamente en este grupo.`);
            return;
        }
        
        return m.reply(`《✧》 Debes mencionar a un bot del grupo para establecerlo como primario.\n\n> *Ejemplo:* ${usedPrefix + command} @tagdelbot\n\n> ❀ También puedes usar *resetbot* para que todos los bots vuelvan a responder.`);
    }

    let botJid = m.mentionedJid[0];
    chat.botPrimario = botJid;

    // AÑADIMOS ESTA LÍNEA PARA VER QUÉ SE GUARDA
    console.log(`[Bot Primario SET] Chat: ${m.chat} | JID Guardado: ${botJid}`);

    let botName = conn.getName(botJid);
    let response = `✐ Se ha establecido a *@${botJid.split('@')[0]}* como bot primario de este grupo.\n> A partir de ahora, todos los comandos del grupo serán ejecutados por *@${botJid.split('@')[0]}*.`;
    
    await conn.sendMessage(m.chat, { 
        text: response, 
        mentions: [botJid] 
    }, { quoted: m });
}

handler.help = ['setbotprimario @bot', 'setbot @bot'];
handler.tags = ['grupo'];
handler.command = ['setbotprimario', 'botprimario', 'setprimarybot', 'setbot'];
handler.group = true;
handler.admin = true;

export default handler;