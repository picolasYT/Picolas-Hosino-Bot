let handler = async (m, { conn }) => {
    let chat = global.db.data.chats[m.chat];

    if (!chat || !chat.botPrimario) {
        // No enviamos mensaje de error para no spamear, ya que todos los bots lo ejecutarían.
        // La confirmación de abajo es suficiente.
        console.log(`[ResetBot] Intento de reseteo en ${m.chat}, pero no había bot primario.`);
        return;
    }

    console.log(`[ResetBot] Reseteando configuración para el chat: ${m.chat}`);
    chat.botPrimario = null;
    
    // Solo un bot (el primero que llegue) enviará el mensaje de confirmación
    await m.reply(`✐ ¡Listo! Se ha restablecido la configuración.\n> A partir de ahora, todos los bots responderán nuevamente en este grupo.`);
}

// ESTA ES LA MAGIA: El bot buscará estas palabras exactas, sin prefijo.
handler.customPrefix = /^(resetbot|resetprimario|botreset)$/i;
handler.command = new RegExp;

handler.group = true;
handler.admin = true;

export default handler;