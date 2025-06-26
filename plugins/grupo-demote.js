let handler = async (m, { conn, participants, isAdmin, groupMetadata, mentionedJid }) => {
  // Obtener el número del propietario del grupo
  const groupOwner = groupMetadata.owner || groupMetadata.participants.find(p => p.admin === 'superadmin')?.id;

  // Si no se menciona a nadie
  if (!mentionedJid[0]) {
    return m.reply('⚠️ Debes mencionar a un usuario para quitarle el admin.\n\nEjemplo: *.demote @usuario*');
  }

  const user = mentionedJid[0];

  // No se puede degradar al propietario
  if (user === groupOwner) {
    return m.reply('❌ No puedes quitarle el admin al propietario del grupo.');
  }

  const target = participants.find(p => p.id === user);

  // Validar si es admin
  if (!target?.admin) {
    return m.reply('⚠️ El usuario que mencionaste no es admin.');
  }

  // Ejecutar la degradación
  await conn.groupParticipantsUpdate(m.chat, [user], 'demote');
  await m.react('✅');
  await m.reply(`🔽 El usuario @${user.split('@')[0]} ya no es admin.`, null, { mentions: [user] });
};

handler.help = ['demote @usuario'];
handler.tags = ['grupo'];
handler.command = ['demote'];
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler;
