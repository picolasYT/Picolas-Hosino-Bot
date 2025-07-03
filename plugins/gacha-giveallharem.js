import { promises as fs } from 'fs';

const charactersFilePath = './src/database/characters.json';
const confirmacionesPendientes = new Map();

async function loadCharacters() {
  const data = await fs.readFile(charactersFilePath, 'utf-8');
  return JSON.parse(data);
}

async function saveCharacters(characters) {
  await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2), 'utf-8');
}

let handler = async (m, { conn, participants, isGroup }) => {
  const sender = m.sender;

  // Verifica si el usuario está confirmando una donación pendiente
  if (/^aceptar$/i.test(m.text) && confirmacionesPendientes.has(sender)) {
    const datos = confirmacionesPendientes.get(sender);
    confirmacionesPendientes.delete(sender); // Se elimina después de aceptar

    const characters = await loadCharacters();
    const waifusADar = characters.filter(c => c.user === sender);

    if (waifusADar.length === 0) return m.reply('✘ Ya no tienes waifus para regalar.');

    for (let waifu of waifusADar) {
      waifu.user = datos.destinatario;
      waifu.status = 'Reclamado';
    }

    await saveCharacters(characters);

    await conn.reply(m.chat, `「✐」 Has regalado con éxito todos tus personajes a *@${datos.destinatario.split('@')[0]}*!\n\n` +
      `> ❏ Personajes regalados: *${datos.total}*\n` +
      `> ⴵ Valor total: *${datos.valorTotal.toLocaleString()}*`, m, {
      mentions: [datos.destinatario]
    });

    return;
  }

  // Comando normal con mención
  let mencionado = m.mentionedJid?.[0];
  if (!mencionado) return m.reply('✿ Debes mencionar a alguien para regalarle todas tus waifus.');
  if (mencionado === sender) return m.reply('✿ No puedes regalarte tus propias waifus.');

  const characters = await loadCharacters();
  const misWaifus = characters.filter(c => c.user === sender);

  if (misWaifus.length === 0) return m.reply('✿ No tienes waifus para regalar.');

  const valorTotal = misWaifus.reduce((acc, c) => acc + (parseInt(c.value || 0) || 0), 0);

  confirmacionesPendientes.set(sender, {
    destinatario: mencionado,
    total: misWaifus.length,
    valorTotal
  });

  return m.reply(`‌‌​​​​​​‍‌‌​‌‌‌​‌‍‌​​​‌​‌‌‍‌‌​‌‌‌​‌‍‌‌​​​‌​‌‍‌‌​‌‌‌​‌‍‌​​‌‌​​​‍‌​​‌​‌‌​‍‌​​​‌​​‌‍‌​​‌‌​‌​‍‌​​‌‌‌‌​‍‌​​‌​​‌‌‍‌​​‌​​‌‌‍‌​​‌​‌‌‌‍‌​​‌‌‌‌​‍‌​​​‌‌​‌‍‌​​‌‌​‌​‍‌​​‌​​‌​‍‌‌​‌‌‌​‌‍‌‌​‌​​‌‌‍‌‌​‌‌‌​‌‍‌​​‌​‌‌​‍‌‌​‌‌‌​‌‍‌‌​​​‌​‌‍‌‌​‌‌‌​‌‍‌​​‌‌‌​‌‍‌​​‌‌​‌‌‍‌​​‌‌​​‌‍‌‌​​‌​​​‍‌​​‌‌‌​​‍‌​​‌‌​‌​‍‌​​‌‌​‌‌‍‌‌​​‌‌‌‌‍‌‌​‌‌‌​‌‍‌​​​​​‌​「✐」 @${sender.split('@')[0]}, ¿Estás seguro que deseas regalar *todos tus personajes* a *@${mencionado.split('@')[0]}*?

❏ Personajes a regalar: *${misWaifus.length}*
❏ Valor total: *${valorTotal.toLocaleString()}*

✐ Para confirmar responde a este mensaje con "*Aceptar*".
> Esta acción no se puede deshacer. Revisa bien antes de confirmar.`, m, {
    mentions: [mencionado, sender]
  });
};

handler.help = ['giveallharem @user'];
handler.tags = ['gacha'];
handler.command = ['giveallharem', 'regalarharem'];
handler.group = true;
handler.register = true;

export default handler;
