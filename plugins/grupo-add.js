const { proto } = (await import('@whiskeysockets/baileys')).default;

let handler = async (m, { conn, participants, text, usedPrefix, command }) => {
  if (!m.isGroup) return;


  if (!text) {
    return m.reply(`✳️ Por favor, ingresa el número de la persona a la que quieres invitar.\n\n*Ejemplo:*\n*${usedPrefix + command} 5211234567890*`);
  }

  const number = text.replace(/[^0-9]/g, '');
  if (isNaN(number)) {
    return m.reply('❌ El número ingresado no es válido. Asegúrate de incluir el código de país sin el símbolo "+".');
  }
  
  const userJid = `${number}@s.whatsapp.net`;

  // Verifica si el usuario ya está en el grupo
  const userExists = participants.some(p => p.id === userJid);
  if (userExists) {
    return m.reply('✅ El usuario que intentas invitar ya se encuentra en el grupo.');
  }

  try {
    const groupMetadata = await conn.groupMetadata(m.chat);
    
    const inviteCode = await conn.groupInviteCode(m.chat);
    
    const expiration = Math.floor(Date.now() / 1000) + (3 * 24 * 60 * 60);

    const inviteMessage = proto.Message.fromObject({
      groupInviteMessage: proto.GroupInviteMessage.fromObject({
        inviteCode: inviteCode,
        inviteExpiration: expiration,
        groupJid: m.chat,
        groupName: groupMetadata.subject,
        caption: `👋 ¡Hola! Te han invitado a unirte al grupo "${groupMetadata.subject}".\n\nEsta invitación es de un solo uso y expirará pronto.`,
      })
    });

    await conn.relayMessage(userJid, inviteMessage, { messageId: conn.generateMessageId() });

    m.reply(`✅ ¡Listo! Se envió una invitación de un solo uso a @${number}.`, null, { mentions: [userJid] });

  } catch (e) {
    console.error(e);
    m.reply('❌ Ocurrió un error al enviar la invitación. Es posible que el número no sea válido o que te haya bloqueado.');
  }
};

handler.help = ['invitar <número>', 'add <número>'];
handler.tags = ['group'];
handler.command = ['add', 'agregar', 'añadir', 'invite', 'invitar'];

handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
