import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import sharp from 'sharp'; // <-- Importamos la nueva librería

const handler = async (m, { conn, usedPrefix, command }) => {
  const quoted = m.quoted || m;
  const mime = (quoted.msg || quoted).mimetype || quoted.mediaType || '';

  if (!/image|video|webp/.test(mime)) {
    return conn.reply(m.chat, `✨ Responde a una imagen, video o gif para convertirlo en un sticker épico.`, m);
  }

  await m.react('⚙️');

  try {
    const img = await quoted.download();
    if (!img) {
      await m.react('❌');
      return m.reply('❌ No se pudo descargar el archivo. Inténtalo de nuevo.');
    }

    const packstickers = global.db.data.users[m.sender];
    const author = packstickers?.text2 || global.packsticker2 || 'Bot';
    const pack = packstickers?.text1 || global.packsticker || 'Stickers';

    let stickerBuffer;

    if (/image/.test(mime)) {
      // --- NUEVO PASO CON SHARP PARA IMÁGENES ---
      // Forzamos la redimensión a 512x512, estirando la imagen si es necesario
      stickerBuffer = await sharp(img)
        .resize(512, 512, {
          fit: 'fill', // La opción 'fill' ignora la proporción y estira para rellenar
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Asegura fondo transparente
        })
        .webp({ quality: 90 }) // Convertimos a webp con buena calidad
        .toBuffer();
      // --- FIN DEL NUEVO PASO ---
    } else {
      // Para videos y GIFs, usamos el método anterior ya que sharp no los anima.
      // 'full' funciona mejor para videos.
      const sticker = new Sticker(img, {
        pack,
        author,
        type: StickerTypes.FULL,
        quality: 80,
      });
      stickerBuffer = await sticker.toBuffer();
    }
    
    // Creamos el sticker final con los metadatos correctos
    const finalSticker = new Sticker(stickerBuffer, {
      pack,
      author,
      quality: 100 // Aplicamos los metadatos con la máxima calidad
    });

    await conn.sendFile(m.chat, await finalSticker.toBuffer(), 'sticker.webp', '', m);
    await m.react('✅');

  } catch (err) {
    console.error('⚠️ Error al crear el sticker:', err);
    await m.react('❌');
    await conn.reply(m.chat, '❌ Ocurrió un error al crear el sticker. El archivo podría estar dañado o no ser compatible.', m);
  }
};

handler.help = ['sticker', 's'];
handler.tags = ['sticker'];
handler.command = ['sticker', 's', '#s'];
handler.register = true;
handler.limit = true;

export default handler;