const handler = async (m, { isOwner, isAdmin, conn, text, participants, args, command, usedPrefix }) => {
  if (usedPrefix == 'a' || usedPrefix == 'A') return;

  const botname = global.botname || 'Ruby';
  
  m.react('✅');

  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn);
    throw false;
  }

  const mensaje = args.join` ` || 'Atención a todos';

  const titulo = `*─ᐅ「 𝗔𝗩𝗜𝗦𝗢 𝗚𝗘𝗡𝗘𝗥𝗔𝗟 」*`;

  let texto = `${titulo}\n\n`;
  texto += `*Mensaje:* \`${mensaje}\`\n\n`;

  texto += `╭─「 *Invocando al grupo* 」\n`;

  for (const member of participants) {
    texto += `│ ${emoji} @${member.id.split('@')[0]}\n`;
  }

  texto += `╰─「 ${botname} 」`;

  conn.sendMessage(m.chat, { text: texto, mentions: participants.map((a) => a.id) });
};

handler.help = ['tagall *<mensaje opcional>*'];
handler.tags = ['group'];
handler.command = ['todos', 'invocar', 'tagall'];
handler.admin = true;
handler.group = true;

export default handler;