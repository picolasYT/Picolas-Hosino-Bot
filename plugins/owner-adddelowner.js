const protectedOwners = [
  '8294868853@s.whatsapp.net',
  '18096758983@s.whatsapp.net',
  '526671548329@s.whatsapp.net'
];

const newsletterJid  = '120363335626706839@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡『 Ruby-Hoshino-Channel 』࿐⟡';

const handler = async (m, { conn, text, args, usedPrefix, command }) => {
  const name = conn.getName(m.sender);
  const contextInfo = {
    mentionedJid: [m.sender],
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
      newsletterJid,
      newsletterName,
      serverMessageId: -1
    }
  };

  const emojiAdd = '✨';
  const emojiDel = '❌';
  const noTarget = `${emojiAdd} Por favor menciona o responde al usuario que quieres ${command === 'addowner' ? 'añadir' : 'quitar'} como owner.`;

  // Determinar JID del target
  let who = m.mentionedJid?.[0]
    || m.quoted?.sender
    || (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);

  if (!who) return conn.reply(m.chat, noTarget, m, { mentions: [m.sender], contextInfo });

  // Quitar sufijo @s.whatsapp.net de los arrays internos
  const shortJid = who.replace(/@s\.whatsapp\.net$/, '');

  if (command === 'addowner') {
    // Verifica duplicados
    if (global.owner.find(o => o[0] === shortJid)) {
      return conn.reply(m.chat, `🌸 ${shortJid} ya es owner, ${name}-chan~`, m, { contextInfo });
    }
    // Obtener nombre del contacto
    let contactName = await conn.getName(who).catch(() => '');
    if (!contactName) contactName = shortJid;

    // Construir entry
    const entry = [ shortJid, contactName, true ];
    // Insertar justo después de los 3 protegidos
    global.owner.splice(protectedOwners.length, 0, entry);

    await conn.reply(
      m.chat,
      `${emojiAdd} Se ha añadido a *${contactName}* como Owner.\n\n` +
      `📋 Ahora la lista de owners queda así:\n` +
      `\`\`\`${JSON.stringify(global.owner, null, 2)}\`\`\``,
      m,
      { mentions: [who], contextInfo }
    );
  }

  if (command === 'delowner') {
    // Protección: no borrar a los protegidos
    if (protectedOwners.includes(who)) {
      return conn.reply(
        m.chat,
        `🚫 No está permitido quitarle owner a esa persona, está protegida.`,
        m,
        { contextInfo }
      );
    }

    const idx = global.owner.findIndex(o => o[0] === shortJid);
    if (idx !== -1) {
      const removed = global.owner[idx][1];
      global.owner.splice(idx, 1);
      await conn.reply(
        m.chat,
        `${emojiDel} Se ha eliminado a *${removed}* de la lista de Owners.`,
        m,
        { mentions: [who], contextInfo }
      );
    } else {
      await conn.reply(
        m.chat,
        `${emojiDel} Ese número no está en la lista de Owners.`,
        m,
        { contextInfo }
      );
    }
  }
};

handler.command = ['addowner', 'delowner'];
handler.rowner = true;
handler.help = ['addowner <@user>', 'delowner <@user>'];
handler.tags = ['owner'];

export default handler;
