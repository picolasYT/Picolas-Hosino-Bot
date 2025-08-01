const handler = async (m, { conn, args, groupMetadata, participants, usedPrefix, command, isBotAdmin }) => {
  const emoji = '🍒';
  const emoji2 = '⚠️';

  if (!args[0]) return conn.reply(m.chat, `${emoji} Debes ingresar un *prefijo de país*.\nEjemplo: *${usedPrefix + command} 212*`, m);
  if (isNaN(args[0])) return conn.reply(m.chat, `${emoji2} El prefijo debe ser numérico.\nEjemplo: *${usedPrefix + command} 51*`, m);

  const prefix = args[0].replace(/[+]/g, '');

  const filteredUsers = participants
    .map(p => p.id)
    .filter(id => id && id.includes(prefix) && !id.includes(conn.user.jid));

  if (!filteredUsers.length) return conn.reply(m.chat, `${emoji2} No se encontraron números con el prefijo +${prefix} en este grupo.`, m);

  const userList = filteredUsers.map(u => '⭔ @' + u.split('@')[0]).join('\n');
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  if (command === 'listnum' || command === 'listanum') {
    return conn.reply(m.chat, `${emoji} *Números encontrados con el prefijo +${prefix}:*\n\n${userList}`, m, { mentions: filteredUsers });
  }

  if (command === 'kicknum') {
    const botSettings = global.db.data.settings[conn.user.jid] || {};
    if (!botSettings.restrict) return conn.reply(m.chat, `${emoji2} El comando está deshabilitado por el propietario del bot.`, m);
    if (!isBotAdmin) return conn.reply(m.chat, `${emoji2} El bot no tiene permisos de administrador.`, m);

    await conn.reply(m.chat, `🍂 Eliminando usuarios con prefijo +${prefix}...`, m);
    
    const groupOwner = groupMetadata.owner || '';
    for (const user of filteredUsers) {
      if ([groupOwner, conn.user.jid, global.owner + '@s.whatsapp.net'].includes(user)) continue;
      try {
        await delay(2000);
        const res = await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
        if (res[0]?.status === '404') {
          const errText = `@${user.split('@')[0]} ya no está en el grupo.`;
          conn.reply(m.chat, errText, m, { mentions: [user] });
        }
        await delay(5000);
      } catch (err) {
        console.error(err);
        conn.reply(m.chat, `❌ Error al eliminar a @${user.split('@')[0]}.`, m, { mentions: [user] });
      }
    }
  }
};

handler.command = ['kicknum', 'listnum', 'listanum'];
handler.group = true;
handler.botAdmin = true;
handler.admin = true;
handler.fail = null;

export default handler;
