const handler = async (m, { conn, args, text, usedPrefix, command }) => {
  let db = global.db.data.users;
  let user;

  // 🎯 Detectar usuario: citado o por argumento
  if (m.quoted) {
    user = m.quoted.sender;
  } else if (args.length >= 1) {
    const number = args[0].replace(/[@\s+]/g, '');
    user = number.includes('@s.whatsapp.net') ? number : `${number}@s.whatsapp.net`;
  } else {
    return conn.reply(m.chat, 
      `🚫 𝙿𝙾𝚁 𝙵𝙰𝚅𝙾𝚁, 𝚃𝙰𝙶𝙴𝙰 𝙾 𝙴𝚂𝙲𝚁𝙸𝙱𝙴 𝙴𝙻 𝙽𝚄́𝙼𝙴𝚁𝙾 𝙳𝙴𝙻 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝚀𝚄𝙴 𝙳𝙴𝚂𝙴𝙰 𝙳𝙴𝚂𝙱𝙰𝙽𝙴𝙰𝚁.\n\n📌 𝙴𝙹𝙴𝙼𝙿𝙻𝙾:\n${usedPrefix + command} @usuario`,
      m
    );
  }

  // 🧠 Validación en base de datos
  if (!db[user]) {
    return conn.reply(m.chat,
      `❌ 𝙴𝙻 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙽𝙾 𝙴𝚂𝚃𝙰́ 𝚁𝙴𝙶𝙸𝚂𝚃𝚁𝙰𝙳𝙾 𝙴𝙽 𝙻𝙰 𝙱𝙳.`,
      m
    );
  }

  // ✅ Cambiar estado a no baneado
  db[user].banned = false;
  db[user].banRazon = '';

  // 📛 Obtener nombres para feedback
  const desbaneadoNombre = await conn.getName(user);
  const moderador = await conn.getName(m.sender);

  // 📤 Mensaje principal
  await conn.reply(m.chat, 
    `✅ 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙳𝙴𝚂𝙱𝙰𝙽𝙴𝙰𝙳𝙾:\n\n👤 𝙽𝙾𝙼𝙱𝚁𝙴: *${desbaneadoNombre}*\n🧩 𝙰𝙲𝙲𝙸𝙾́𝙽: 𝙳𝙴𝚂𝙱𝙰𝙽𝙴𝙰𝙳𝙾 ✅`,
    m,
    { mentionedJid: [user] }
  );

  // 📬 Notificar al número de soporte (si aplica)
  const supportJid = global.suittag || '120363123456789@g.us'; // actualiza si tienes uno definido
  conn.reply(supportJid, 
    `📢 𝙽𝙾𝚃𝙸𝙵𝙸𝙲𝙰𝙲𝙸𝙾́𝙽 𝙳𝙴 𝙳𝙴𝚂𝙱𝙰𝙽𝙴𝙾:\n\n🔓 𝙴𝙻 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 *${desbaneadoNombre}* 𝙵𝚄𝙴 𝙳𝙴𝚂𝙱𝙰𝙽𝙴𝙰𝙳𝙾 𝙿𝙾𝚁 *${moderador}*.`,
    m
  );
};

handler.help = ['unbanuser <@tag | número>'];
handler.tags = ['mods'];
handler.command = ['unbanuser'];
handler.rowner = true; // solo el root owner puede usarlo

export default handler;
