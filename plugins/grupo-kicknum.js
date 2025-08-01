const handler = async (m, { conn, args, groupMetadata, participants, usedPrefix, command, isBotAdmin }) => {
  const emoji = '📛';
  const emoji2 = '🚫';

  if (!args[0]) {
    return conn.reply(m.chat, `${emoji} Debes ingresar el prefijo de un país.\nEjemplo: *${usedPrefix + command} 212*`, m);
  }

  if (isNaN(args[0])) {
    return conn.reply(m.chat, `${emoji} El prefijo debe ser numérico.`, m);
  }

  const prefix = args[0].replace(/\D+/g, ''); // Elimina todo lo que no sea número
  const allParticipants = participants.map(p => p.id);

  // Filtra participantes que empiezan con el prefijo
  const filtered = allParticipants.filter(jid => jid.startsWith(prefix) && jid.endsWith('@s.whatsapp.net') && jid !== conn.user.jid);

  if (!filtered.length) {
    return conn.reply(m.chat, `${emoji2} No se encontraron números con el prefijo *+${prefix}* en este grupo.`, m);
  }

  const mentionList = filtered.map(id => '@' + id.split('@')[0]);

  if (command === 'listanum' || command === 'listnum') {
    return conn.reply(
      m.chat,
      `📋 *Números con el prefijo +${prefix} detectados:*\n\n${mentionList.join('\n')}`,
      m,
      { mentions: filtered }
    );
  }

  if (command === 'kicknum') {
    const settings = global.db.data.settings[conn.user.jid] || {};
    if (!settings.restrict) {
      return conn.reply(m.chat, `${emoji} Este comando está deshabilitado por el propietario del bot.`, m);
    }

    if (!isBotAdmin) {
      return conn.reply(m.chat, `${emoji2} El bot no tiene permisos de administrador.`, m);
    }

    await conn.reply(m.chat, `☁️ Eliminando miembros con prefijo *+${prefix}*...`, m);

    const ownerGroup = groupMetadata.owner || '';

    for (const user of filtered) {
      if (
        user !== conn.user.jid &&
        user !== ownerGroup &&
        !global.owner.includes(user.split('@')[0])
      ) {
        try {
          await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
          await new Promise(res => setTimeout(res, 5000)); // Espera 5s entre expulsiones
        } catch (e) {
          conn.reply(m.chat, `❌ No se pudo eliminar a @${user.split('@')[0]}`, m, {
            mentions: [user]
          });
        }
      }
    }

    return conn.reply(m.chat, `✅ Finalizado. Usuarios con prefijo *+${prefix}* fueron procesados.`, m);
  }
};

handler.command = ['kicknum', 'listnum', 'listanum'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
