import { Sticker } from 'wa-sticker-formatter';

const handler = async (m, { conn, usedPrefix, command }) => {
  const quoted = m.quoted || m;
  const mime = (quoted.msg || quoted).mimetype || '';

  if (!/image\/(jpe?g|png)/.test(mime)) {
    return conn.reply(m.chat, `📸 Responde a una imagen o etiqueta una imagen para convertirla en sticker.`, m);
  }

  await m.react('🧃');

  try {
    const buffer = await quoted.download();

    const sticker = new Sticker(buffer, {
      pack: `👤 ${conn.getName(m.sender)}`,
      author: 'by RubyBot',
      type: 'full',
      quality: 100,
      categories: ['🤖'],
      id: `imgsticker-${Date.now()}`
    });

    const stickerBuffer = await sticker.toBuffer();

    await conn.sendMessage(m.chat, {
      sticker: stickerBuffer
    }, { quoted: m });

    await m.react('✅');

  } catch (err) {
    console.error(err);
    await m.react('❌');
    return m.reply('❌ Hubo un error al crear el sticker. Asegúrate de que la imagen no esté dañada.');
  }
};

handler.help = ['sticker', '#s'];
handler.tags = ['sticker'];
handler.command = ['sticker', 's', '#s'];
handler.register = true;
handler.limit = true;

export default handler;
