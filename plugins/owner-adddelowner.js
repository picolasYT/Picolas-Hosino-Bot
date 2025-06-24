const protectedOwners = [
  '8294868853@s.whatsapp.net',
  '18096758983@s.whatsapp.net',
  '526671548329@s.whatsapp.net'
];

const newsletterJid = '120363335626706839@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡『 Ruby-Hoshino-Channel 』࿐⟡';

const handler = async (m, { conn, text, command }) => {
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

  const who = m.mentionedJid?.[0]
    || m.quoted?.sender
    || (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);

  if (!who) {
    return conn.reply(m.chat,
      `🌸 Menciona o responde al mensaje del usuario que deseas *${command === 'addowner' ? 'añadir' : 'quitar'}* como owner.`,
      m, { mentions: [m.sender], contextInfo });
  }

  const jid = who.endsWith('@s.whatsapp.net') ? who : who.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  const number = jid.split('@')[0];
  const name = (await conn.getName(jid).catch(() => null)) || 'Owner';

  if (command === 'addowner') {
    const already = global.owner.find(([id]) => id === number);
    if (already) {
      return conn.reply(m.chat, `🌼 *Ese número ya está en la lista de owners.*`, m, { contextInfo });
    }

    // Añade owner normal
    global.owner.push([number, name, true]);

    // Añade LID si está disponible
    const id = m.sender.split(':')?.[0];
    const lid = m.key?.participant || m.key?.remoteJid || null;
    if (lid && lid.includes('@lid')) {
      const lidNum = lid.split('@')[0];
      const existsLid = global.owner.find(([id]) => id === lidNum);
      if (!existsLid) global.owner.push([lidNum, name.toLowerCase(), true]);
    }

    // Reordenar: primero los s.whatsapp.net, luego los lid
    global.owner.sort((a, b) => {
      const isLid = (x) => x[0].length > 15; // LIDs suelen tener 15+ dígitos
      if (isLid(a) && !isLid(b)) return 1;
      if (!isLid(a) && isLid(b)) return -1;
      return 0;
    });

    return conn.reply(
      m.chat,
      `✅ *${name}* ha sido agregado como Owner correctamente.`,
      m,
      { mentions: [jid], contextInfo }
    );
  }

  if (command === 'delowner') {
    if (protectedOwners.includes(jid)) {
      return conn.reply(m.chat, `🚫 *No puedes quitar a este Owner, está protegido.*`, m, { contextInfo });
    }

    const index = global.owner.findIndex(([id]) => id === number);
    if (index !== -1) {
      global.owner.splice(index, 1);
      return conn.reply(
        m.chat,
        `🗑️ *${name}* ha sido eliminado de la lista de Owners.`,
        m,
        { mentions: [jid], contextInfo }
      );
    } else {
      return conn.reply(m.chat, `📛 *Ese número no está en la lista de Owners.*`, m, { contextInfo });
    }
  }
};

handler.command = ['addowner', 'delowner'];
handler.rowner = true;

export default handler;
