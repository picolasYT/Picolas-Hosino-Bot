import sharp from 'sharp'; // <-- 1. Importamos la nueva librería
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { webp2png } from '../lib/webp2mp4.js';

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const quoted = m.quoted || m;
  const mime = (quoted.msg || quoted).mimetype || quoted.mediaType || '';
  const toimg = /toimg/i.test(args[0]);

  // --- MODO: Convertir Sticker a Imagen (se mantiene igual) ---
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

  // --- MODO: Crear Sticker (con la solución definitiva) ---
  if (!/image|webp|video/g.test(mime)) {
    return m.reply(`✨ Responde a una imagen, gif o video para crear un sticker.\n\n*Función extra:*\nResponde a un sticker y usa *${usedPrefix + command} toimg* para convertirlo en imagen.`);
  }

  await m.react('🎨');

  try {
    const img = await quoted.download();
    if (!img) throw new Error('No se pudo descargar el archivo.');

    // <-- 2. LA SOLUCIÓN DEFINITIVA EMPIEZA AQUÍ -->
    // Pre-procesamos la imagen con Sharp para forzarla a ser un cuadrado de 512x512
    const resizedImgBuffer = await sharp(img, { animated: /webp|video|gif/.test(mime) })
      .resize(512, 512, {
        fit: 'fill', // La opción 'fill' ignora el aspect ratio y estira la imagen para que llene el espacio.
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Fondo transparente por si acaso
      })
      .webp({ quality: 90 }) // Convertimos a webp con buena calidad
      .toBuffer();
    // <-- LA SOLUCIÓN DEFINITIVA TERMINA AQUÍ -->

    const user = global.db.data.users[m.sender];
    const packname = user?.text1 || global.packsticker;
    const author = user?.text2 || global.packsticker2;

    // 3. Ahora creamos el sticker desde la imagen YA MODIFICADA
    const sticker = new Sticker(resizedImgBuffer, {
      pack: packname,
      author: author,
      type: StickerTypes.DEFAULT, // Ya no necesitamos 'full', pues la imagen ya es perfecta
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