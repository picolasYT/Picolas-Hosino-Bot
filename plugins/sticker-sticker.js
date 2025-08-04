import { Sticker } from 'wa-sticker-formatter';

let handler = async (m, { conn, usedPrefix, command }) => {
  const quoted = m.quoted ? m.quoted : m;
  const mime = (quoted.msg || quoted).mimetype || '';

  if (!/image\/(jpe?g|png|webp)/.test(mime)) {
    throw `🖼️ *Debes responder o etiquetar una imagen para convertirla en sticker!*\n\nEjemplo: *${usedPrefix + command}* (respondiendo a una imagen)`;
  }

  await m.react('🧩');

  try {
    const imgBuffer = await quoted.download();

    const sticker = new Sticker(imgBuffer, {
      pack: `Sticker de ${conn.getName(m.sender)}`,
      author: 'by ${packname}',
      type: 'full',             // Usa 'full' para mayor tamaño
      quality: 100,             // Alta calidad
      background: null,         // Fondo transparente si es webp
      categories: ['✨'],        // Categoría opcional
    });

    await conn.sendMessage(m.chat, {
      sticker: await sticker.toBuffer()
    }, { quoted: m });

    await m.react('✅');

  } catch (e) {
    console.error(e);
    throw `❌ *Error al convertir la imagen en sticker.*\nVerifica que estés respondiendo a una imagen válida.`;
  }
};

handler.help = ['sticker'];
handler.tags = ['sticker'];
handler.command = ['sticker', 's', '#s'];
handler.register = true;
handler.limit = true;

export default handler;
