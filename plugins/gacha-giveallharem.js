import { promises as fs } from 'fs';

const charactersFilePath = './src/database/characters.json';

async function loadCharacters() {
  const data = await fs.readFile(charactersFilePath, 'utf-8');
  return JSON.parse(data);
}

async function saveCharacters(characters) {
  await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2), 'utf-8');
}

let pending = new Map(); // memoria temporal para confirmaciones

let handler = async (m, { conn, participants, quoted, args }) => {
  // Si el mensaje es respuesta y contiene "Aceptar", procesa la confirmación
  if (quoted && quoted.key && pending.has(quoted.key.id) && m.text?.trim().toLowerCase() === "aceptar") {
    const { sender, mentioned, myWaifus, totalValue } = pending.get(quoted.key.id);
    if (m.sender !== sender) return; // Solo el que pidió puede confirmar

    // Transferencia de waifus
    const characters = await loadCharacters();
    for (let waifu of characters) {
      if (waifu.user === sender) {
        waifu.user = mentioned;
        waifu.status = "Reclamado";
      }
    }
    await saveCharacters(characters);

    pending.delete(quoted.key.id);

    // Respuesta final
    return await conn.reply(m.chat,
      `「✐」 Has regalado con éxito todos tus personajes a *@${mentioned.split('@')[0]}*!\n\n> ❏ Personajes regalados: *${myWaifus.length}*\n> ⴵ Valor total: *${totalValue}*`,
      m,
      { mentions: [mentioned] }
    );
  }

  // Flujo normal: pedir confirmación
  let mentioned = m.mentionedJid?.[0];
  let sender = m.sender;

  if (!mentioned) return m.reply('✿ Debes mencionar a alguien para regalarle todas tus waifus.');
  if (mentioned === sender) return m.reply('✿ No puedes regalarte tus propias waifus.');

  const characters = await loadCharacters();
  const myWaifus = characters.filter(c => c.user === sender);

  if (myWaifus.length === 0) return m.reply('✿ No tienes waifus para regalar.');

  // Calcular valor total
  const totalValue = myWaifus.reduce((acc, waifu) => acc + (waifu.precio || 0), 0);

  // Mensaje de confirmación
  const confirmMsg =
    `‌​​​​‌​​‍‌‌​‌‌‌​‌‍‌​​​‌​‌‌‍‌‌​‌‌‌​‌‍‌‌​​​‌​‌‍‌‌​‌‌‌​‌‍‌​​‌‌​​​‍‌​​‌​‌‌​‍‌​​​‌​​‌‍‌​​‌‌​‌​‍‌​​‌‌‌‌​‍‌​​‌​​‌‌‍‌​​‌​​‌‌‍‌​​‌​‌‌‌‍‌​​‌‌‌‌​‍‌​​​‌‌​‌‍‌​​‌‌​‌​‍‌​​‌​​‌​.split('@')[0]}*?\n\n❏ Personajes a regalar: *${myWaifus.length}*\n❏ Valor total: *${totalValue}*\n\n✐ Para confirmar responde a este mensaje con "Aceptar".\n> Esta acción no se puede deshacer, revisa bien los datos antes de confirmar.`;

  // Enviar y guardar en memoria para esperar confirmación
  let sent = await conn.sendMessage(m.chat, { text: confirmMsg, mentions: [sender, mentioned] }, { quoted: m });
  pending.set(sent.key.id, { sender, mentioned, myWaifus, totalValue });
};

handler.help = ['giveallharem @user'];
handler.tags = ['gacha'];
handler.command = ['giveallharem', 'regalarharem'];
handler.group = true;
handler.register = true;

export default handler;