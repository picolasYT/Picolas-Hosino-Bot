  const avatar = "https://files.catbox.moe/1k2k6p.jpg";

  const text = `✨ *CONFIGURACIÓN DEL GRUPO*  

◈ Welcome: \`${welcome ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Activa o desactiva el mensaje de bienvenida en el grupo.

◈ Autolevelup: \`${autolevelup ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Activa o descativa la subida automática de nivel en el Bot.

◈ Antibot: \`${antiBot ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Expulsa a otros bots no autorizados.

◈ Antisubbots: \`${antiBot2 ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Expulsa a subbots no autorizados.

◈ Autoaceptar: \`${autoAceptar ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Acepta automáticamente números al grupo.

◈ Autorechazar: \`${autoRechazar ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Rechaza automáticamente números al grupo.

◈ Autoresponder: \`${autoresponder ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Responde automáticamente con IA.

◈ Modoadmin: \`${modoadmin ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Solo responde a admins.

◈ Reaction: \`${reaction ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Activa las reacciones del bot.

◈ NSFW: \`${nsfw ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Activa comandos +18.

◈ Detect: \`${detect ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Detecta cambios en el grupo.

◈ Antilink: \`${antiLink ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Bloquea links de WhatsApp.

◈ Antilink2: \`${antiLink2 ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Bloquea enlaces HTTPS.

◈ Antitoxic: \`${antitoxic ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Elimina mensajes ofensivos.

◈ Antitraba: \`${antiTraba ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Evita mensajes traba (muchos caracteres).

◈ Antifake: \`${antifake ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Bloquea números falsos.

_*✦ Nota: Puedes activar una opción así: Ejemplo: #antilink*_`.trim();

  await conn.sendMessage(m.chat, {
    text,
    contextInfo: {
      externalAdReply: {
        title: packname,
        body: dev,
        thumbnailUrl: avatar,
        mediaType: 1,
        showAdAttribution: true,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m });
};

handler.help = ['configuraciongrupo'];
handler.tags = ['grupo'];
handler.command = ['config', 'opciones', 'nable'];
handler.register = true;
handler.group = true;

export default handler;
