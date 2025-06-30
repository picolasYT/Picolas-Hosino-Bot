import db from '../lib/database.js'

let handler = async (m, { conn, args }) => {
  let page = args[0] ? parseInt(args[0]) : 1;
  if (isNaN(page) || page < 1) page = 1;

  const pageSize = 10;
  const users = Object.entries(global.db.data.users)
    .filter(([_, u]) => u.exp > 0)
    .map(([jid, u]) => ({ ...u, jid }))
    .sort((a, b) => b.exp - a.exp || b.level - a.level);

  const totalPages = Math.ceil(users.length / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const showUsers = users.slice(start, end);

  let text = `◢✿ Top de usuarios con más experiencia ✿◤\n\n`;

  for (let i = 0; i < showUsers.length; i++) {
    let user = showUsers[i];
    let name = await conn.getName(user.jid) || 'Desconocido';
    let position = start + i + 1;
    text += `✰ ${position} » *${name}*\n`;
    text += `  ❖ XP » *${user.exp.toLocaleString()}*  ❖ LVL » *${user.level || 0}*\n`;
  }

  text += `\n> • Página *${page}* de *${totalPages}*`;
  if (page < totalPages) {
    text += `\n> Para ver la siguiente página » *#leaderboard ${page + 1}*`;
  }

  await conn.reply(m.chat, text.trim(), m);
};

handler.help = ['leaderboard [número]'];
handler.tags = ['rpg'];
handler.command = ['leaderboard', 'topxp', 'xplevel'];
handler.register = true;
handler.group = true;

export default handler;
