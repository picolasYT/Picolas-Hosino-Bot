let handler = async (m, { conn, participants, isAdmin, groupMetadata, mentionedJid }) => {
  
  const groupOwner = groupMetadata.owner || groupMetadata.participants.find(p => p.admin === 'superadmin')?.id;

  
  if (!mentionedJid[0]) {
    return m.reply('⚠️ Debes mencionar a un usuario para quitarle el admin.\n\nEjemplo: *.demote @usuario*');
  }

  const user = mentionedJid[0];

  
  if (user === groupOwner) {
    return m.reply('❌ No puedes quitarle el admin al propietario del grupo.');
  }

  const target = participants.find(p => p.id === user);

  
  if (!target?.admin) {
    return m.reply('⚠️ El usuario que mencionaste no es admin.');
  }

 
  await conn.groupParticipantsUpdate(m.chat, [user], 'demote');
  await m.react('✅');
};

handler.help = ['demote @usuario'];
handler.tags = ['grupo'];
handler.command = ['demote'];
handler.group = true;
handler.admin = true
handler.botAdmin = true

export default handler;
