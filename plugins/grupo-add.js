// Importa el constructor de protocolos de Baileys para crear el mensaje de invitación
const { proto } = (await import('@whiskeysockets/baileys')).default;

let handler = async (m, { conn, participants, text, usedPrefix, command }) => {
  // --- Validación Inicial ---
  if (!m.isGroup) return; // Asegurarse de que el comando se usa en un grupo
  
  const botIsAdmin = participants.find(p => p.id === conn.user.jid)?.admin;
  if (!botIsAdmin) {
    return m.reply('❌ Para usar este comando, el bot necesita ser administrador del grupo.');
  }

  const senderIsAdmin = participants.find(p => p.id === m.sender)?.admin;
  if (!senderIsAdmin) {
    return m.reply('❌ Este comando solo puede ser utilizado por los administradores del grupo.');
  }

  if (!text) {
    return m.reply(`✳️ Por favor, ingresa el número de la persona a la que quieres invitar.\n\n*Ejemplo:*\n*${usedPrefix + command} 5211234567890*`);
  }

  // --- Procesamiento del Número ---
  const number = text.replace(/[^0-9]/g, '');
  if (isNaN(number)) {
    return m.reply('❌ El número ingresado no es válido. Asegúrate de incluir el código de país sin el símbolo "+".');
  }
  
  const userJid = `${number}@s.whatsapp.net`;

  // --- Lógica para Enviar la Invitación ---
  try {
    // 1. VERIFICACIÓN: Comprueba si el número tiene WhatsApp antes de continuar.
    const [result] = await conn.onWhatsApp(userJid);
    if (!result || !result.exists) {
      return m.reply(`❌ El número *${number}* no es válido o no tiene una cuenta de WhatsApp.`);
    }

    // 2. VERIFICACIÓN: Comprueba si el usuario ya está en el grupo.
    const userExists = participants.some(p => p.id === userJid);
    if (userExists) {
      return m.reply('✅ El usuario que intentas invitar ya se encuentra en el grupo.');
    }

    // Obtiene los metadatos del grupo para usar el nombre
    const groupMetadata = await conn.groupMetadata(m.chat);
    
    // Genera el código de invitación del grupo
    const inviteCode = await conn.groupInviteCode(m.chat);
    
    // Define la fecha de expiración de la invitación (ej. 3 días)
    const expiration = Math.floor(Date.now() / 1000) + (3 * 24 * 60 * 60);

    // Crea el mensaje de invitación especial
    const inviteMessage = proto.Message.fromObject({
      groupInviteMessage: proto.GroupInviteMessage.fromObject({
        inviteCode: inviteCode,
        inviteExpiration: expiration,
        groupJid: m.chat,
        groupName: groupMetadata.subject,
        caption: `👋 ¡Hola! Te han invitado a unirte al grupo "${groupMetadata.subject}".\n\nEsta invitación es de un solo uso y expirará pronto.`,
      })
    });

    // Envía el mensaje de invitación al usuario
    await conn.relayMessage(userJid, inviteMessage, { messageId: conn.generateMessageId() });

    // Confirma al admin que la invitación fue enviada
    m.reply(`✅ ¡Listo! Se envió una invitación de un solo uso a @${number}.`, null, { mentions: [userJid] });

  } catch (e) {
    // 3. MANEJO DE ERRORES DETALLADO: Muestra el error real.
    console.error("Error al enviar invitación:", e); // Muestra el error completo en la consola para ti
    m.reply(`❌ Ocurrió un error al enviar la invitación.\n\n*Detalle del error:*\n${e.message || e}`);
  }
};

handler.help = ['invitar <número>', 'add <número>'];
handler.tags = ['group'];
handler.command = ['add', 'agregar', 'añadir', 'invite', 'invitar'];

handler.group = true;
handler.admin = true; // Quien usa el comando debe ser admin
handler.botAdmin = true; // El bot debe ser admin

export default handler;
