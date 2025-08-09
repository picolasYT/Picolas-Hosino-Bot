import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { webp2png } from '../lib/webp2mp4.js';

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const quoted = m.quoted || m;
  const mime = (quoted.msg || quoted).mimetype || quoted.mediaType || '';
  const toimg = /toimg/i.test(args[0]);

  if (toimg) {
    if (!/webp/g.test(mime)) {
      return m.reply(`🚩 Para convertir un sticker en imagen, responde a un sticker y usa el comando *${usedPrefix + command} toimg*`);
    }
    await m.react('🖼️');
    try {
      const img = await quoted.download();
      const out = await webp2png(img);
      await conn.sendFile(m.chat, out, 'image.png', '✅ ¡Listo! Aquí tienes tu imagen.', m);
    } catch (e) {
      console.error(e);
      m.reply('❌ Ocurrió un error al convertir el sticker en imagen.');
    }
    return;
  }

  if (!/image|webp|video/g.test(mime)) {
    return m.reply(`✨ Responde a una imagen, gif o video para crear un sticker.\n\n*Función extra:*\nResponde a un sticker y usa *${usedPrefix + command} toimg* para convertirlo en imagen.`);
  }

  await m.react('🎨');

  try {
    const img = await quoted.download();
    if (!img) throw new Error('No se pudo descargar el archivo.');

    const user = global.db.data.users[m.sender];
    const packname = user?.text1 || global.packsticker;
    const author = user?.text2 || global.packsticker2;

    const sticker = new Sticker(img, {
      pack: packname,
      author: author,
      type: StickerTypes.FULL,
      quality: 100,
    });

    const stikerBuffer = await sticker.toBuffer();

    if (stikerBuffer) {
      await conn.sendFile(m.chat, stikerBuffer, 'sticker.webp', '', m);
      await m.react('✅');
    } else {
      throw new Error('No se pudo generar el buffer del sticker.');
    }
  } catch (err) {
    console.error(err);
    await m.react('❌');
    m.reply(`❌ Hubo un error al crear el sticker. Asegúrate de que el archivo no esté dañado y sea compatible (video de menos de 7 segundos).`);
  }
};

handler.help = ['sticker', 'sticker toimg'];
handler.tags = ['sticker'];
handler.command = ['sticker', 's', '#s'];
handler.register = true;
handler.limit = true;

export default handler;