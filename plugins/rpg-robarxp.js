const handler = async (m, { conn, usedPrefix, command }) => {
  const cooldown = 2 * 60 * 60 * 1000; // 2 horas
  const now = new Date();
  const user = global.db.data.users[m.sender];

  if (user.lastrob && now - user.lastrob < cooldown) {
    const time = msToTime(user.lastrob + cooldown - now);
    return conn.reply(m.chat, `❌ 𝙴𝚂𝙿𝙴𝚁𝙰 𝙿𝙾𝚁 𝙵𝙰𝚅𝙾𝚁\n⏳ Ya robaste XP recientemente\n🕒 Vuelve en: *${time}*`, m);
  }

  let target;
  if (m.isGroup) {
    target = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null;
  } else {
    target = m.chat;
  }

  if (!target) {
    return conn.reply(m.chat, `💬 *Debes mencionar a alguien para intentar robarle XP.*`, m);
  }

  if (!(target in global.db.data.users)) {
    return conn.reply(m.chat, `⚠️ *El usuario no está en la base de datos.*`, m);
  }

  const targetUser = global.db.data.users[target];
  const maxXP = 8000;
  const robXP = Math.floor(Math.random() * (maxXP - 3000 + 1)) + 3000; // entre 3000 y 8000 XP

  if (targetUser.exp < robXP) {
    return conn.reply(m.chat, `⚠️ @${target.split("@")[0]} no tiene suficiente XP para que valga la pena robarle.\n🔸 Necesita al menos *${robXP} XP*`, m, { mentions: [target] });
  }

  user.exp += robXP;
  targetUser.exp -= robXP;
  user.lastrob = now * 1;

  let frases = [
    `「✧」Has ejecutado un *robo de XP* perfectamente planeado.\n🔮 Recolectaste *+${robXP.toLocaleString()} XP* de @${target.split("@")[0]}`,
    `⚔️ 𝚂𝚞𝚛𝚐𝚎𝚜 𝚍𝚎 𝚕𝚊𝚜 𝚜𝚘𝚖𝚋𝚛𝚊𝚜 𝚢 𝚜𝚊𝚚𝚞𝚎𝚊𝚜 *${robXP.toLocaleString()} XP* a @${target.split("@")[0]}`,
    `😈 Robaste el conocimiento de @${target.split("@")[0]} como un ladrón de almas: *+${robXP.toLocaleString()} XP*`,
    `🧠 Robaste secretos ancestrales y le quitaste *+${robXP.toLocaleString()} XP* a @${target.split("@")[0]}`
  ];

  await conn.reply(m.chat, pickRandom(frases), m, { mentions: [target] });
};

handler.help = ['robxp'];
handler.tags = ['rpg'];
handler.command = ['robxp', 'robarxp'];
handler.group = true;
handler.register = true;

export default handler;

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function msToTime(duration) {
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  return `${hours} Hora(s) ${minutes} Minuto(s)`;
}
