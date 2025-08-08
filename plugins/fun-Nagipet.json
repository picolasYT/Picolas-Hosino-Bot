let handler = async (m, { conn }) => {
    let chat = global.db.data.chats[m.chat];

    if (!chat || !chat.botPrimario) {
        return m.reply('《✧》 No hay ningún bot primario establecido en este grupo. No hay nada que restablecer.');
    }

    // Guardamos el nombre del bot que estaba como primario para mencionarlo (opcional)
    let oldBotName = conn.getName(chat.botPrimario);

    // La acción clave: Limpiamos la configuración
    chat.botPrimario = null;

    // Enviamos un mensaje de confirmación para que el admin sepa que funcionó
    await m.reply(`✐ ¡Listo! Se ha restablecido la configuración.\n> A partir de ahora, todos los bots responderán nuevamente en este grupo.`);
}

handler.help = ['resetbot'];
handler.tags = ['grupo'];
// Comandos y alias para el reseteo
handler.command = ['resetbot', 'resetprimario', 'botreset']; 

handler.group = true;
handler.admin = true; // Solo los admins pueden usar este comando

export default handler;