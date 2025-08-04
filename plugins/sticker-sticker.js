import { Sticker } from 'wa-sticker-formatter';
import { sticker } from '../lib/sticker.js';
import uploadFile from '../lib/uploadFile.js';
import uploadImage from '../lib/uploadImage.js';
import { webp2png } from '../lib/webp2mp4.js';

const handler = async (m, { conn, usedPrefix, command }) => {
  const quoted = m.quoted || m;
  const mime = (quoted.msg || quoted).mimetype || quoted.mediaType || '';
  let stiker = false;

  if (!/image|webp|video/g.test(mime)) {
    return conn.reply(m.chat, `📸 Responde a una imagen o etiqueta una imagen para convertirla en sticker.`, m);
  }

  await m.react('🧃');

  try {
    let img = await quoted.download?.();
    if (!img) return m.reply('❌ No se pudo obtener la imagen.');

    const packstickers = global.db.data.users[m.sender];
    const texto1 = packstickers?.text1 || global.packsticker;
    const texto2 = packstickers?.text2 || global.packsticker2;

    try {
      stiker = await sticker(img, false, texto1, texto2);
    } catch (e) {
      console.error('⚠️ Error creando con sticker():', e);
    }

    if (!stiker) {
      let out;
      try {
        if (/webp/g.test(mime)) out = await webp2png(img);
        else if (/image/g.test(mime)) out = await uploadImage(img);
        else if (/video/g.test(mime)) out = await uploadFile(img);
        if (typeof out !== 'string') out = await uploadImage(img);

        stiker = await sticker(false, out, texto1, texto2);
      } catch (e) {
        console.error('⚠️ Error creando desde URL:', e);
      }
    }

    if (stiker) {
      await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m);
      await m.react('✅');
    } else {
      throw '❌ No se pudo generar el sticker.';
    }

  } catch (err) {
    console.error(err);
    await m.react('❌');
    return m.reply('❌ Hubo un error al crear el sticker. Asegúrate de que la imagen no esté dañada o sea compatible.');
  }
};

handler.help = ['sticker', '#s'];
handler.tags = ['sticker'];
handler.command = ['sticker', 's', '#s'];
handler.register = true;
handler.limit = true;

export default handler;
