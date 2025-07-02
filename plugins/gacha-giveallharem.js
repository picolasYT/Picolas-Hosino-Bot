import { promises as fs } from 'fs';

const charactersFilePath = './src/database/characters.json';

async function loadCharacters() {
  const data = await fs.readFile(charactersFilePath, 'utf-8');
  return JSON.parse(data);
}

async function saveCharacters(characters) {
  await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2), 'utf-8');
}

let handler = async (m, { conn, participants }) => {
  let mentioned = m.mentionedJid?.[0];
  let sender = m.sender;

  if (!mentioned) return m.reply('✿ Debes mencionar a alguien para regalarle todas tus waifus.');

  if (mentioned === sender) return m.reply('✿ No puedes regalarte tus propias waifus.');

  const characters = await loadCharacters();

  const myWaifus = characters.filter(c => c.user === sender);
  if (myWaifus.length === 0) return m.reply('✿ No tienes waifus para regalar.');

  for (let waifu of myWaifus) {
    waifu.user = mentioned;
    waifu.status = "Reclamado";
  }

  await saveCharacters(characters);

  const names = myWaifus.map(w => `• ${w.name}`).join('\n');

  await conn.reply(m.chat, `✿ Le regalaste *${myWaifus.length} waifus* a @${mentioned.split('@')[0]} ✦\n\n${names}`, m, {
    mentions: [mentioned]
  });
};

handler.help = ['giveallharem @user'];
handler.tags = ['gacha'];
handler.command = ['giveallharem', 'regalarharem'];
handler.group = true;
handler.register = true;

export default handler;