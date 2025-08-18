// Importa el constructor de protocolos de Baileys
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
    // 1. VERIFICACIÓN: Comprueba si el número tiene WhatsApp.
    const [result] = await conn.onWhatsApp(userJid);
    if (!result || !result.exists) {
      return m.reply(`❌ El número *${number}* no es válido o no tiene una cuenta de WhatsApp.`);
    }

    // 2. VERIFICACIÓN: Comprueba si el usuario ya está en el grupo.
    const userExists = participants.some(p => p.id === userJid);
    if (userExists) {
      return m.reply('✅ El usuario que intentas invitar ya se encuentra en el grupo.');
    }

    // Obtiene los metadatos del grupo para usar el nombre y el código de invitación.
    const groupMetadata = await conn.groupMetadata(m.chat);
    const groupName = groupMetadata.subject;
    const inviteCode = await conn.groupInviteCode(m.chat);
    const inviteUrl = 'https://chat.whatsapp.com/' + inviteCode;

    // Prepara el mensaje de texto con el enlace de invitación.
    const messageText = `👋 ¡Hola! Te han invitado a unirte al grupo de WhatsApp "${groupName}".\n\nHaz clic en el siguiente enlace para unirte:\n\n${inviteUrl}`;

    // 🔧 **CORRECCIÓN PRINCIPAL:**
    // Se envía el enlace como un mensaje de texto simple.
    // WhatsApp generará automáticamente una vista previa interactiva.
    await conn.sendMessage(userJid, { text: messageText });

    // Confirma al admin que la invitación fue enviada.
    m.reply(`✅ ¡Listo! Se envió el enlace de invitación a @${number}.`, null, { mentions: [userJid] });

  } catch (e) {
    // 3. MANEJO DE ERRORES DETALLADO:
    console.error("Error al enviar invitación:", e);
    m.reply(`❌ Ocurrió un error al enviar la invitación.\n\n*Detalle del error:*\n${e.message || e}`);
  }
};

handler.help = ['invitar <número>', 'add <número>'];
handler.tags = ['group'];
handler.command = ['add', 'agregar', 'añadir', 'invite', 'invitar'];

handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;