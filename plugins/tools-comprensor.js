import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import crypto from 'crypto';
import { FormData, Blob } from 'formdata-node';
import { fileTypeFromBuffer } from 'file-type';

const handler = async (m, { conn }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';

  if (!mime || !mime.startsWith('image/')) {
    return m.reply(`❌ *Responde a una imagen o envía una imagen con el comando* _.comprimir_`);
  }

  try {
    m.react('📤');

    const buffer = await q.download();
    const urlCatbox = await catbox(buffer); // Subimos a Catbox

    const apiURL = `https://api.siputzx.my.id/api/iloveimg/compress?image=${encodeURIComponent(urlCatbox)}`;
    const response = await fetch(apiURL);
    if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
    const compressed = await response.buffer();

    await conn.sendMessage(m.chat, {
      image: compressed,
      caption: `🎯 *¡Imagen comprimida!*\n✨ *Optimizada por LoveIMG*\n🐱 *Subida vía Catbox*`
    }, { quoted: m });

    m.react('✅');
  } catch (err) {
    console.error(err);
    m.react('❌');
    m.reply(`❌ *Ocurrió un error al comprimir la imagen.*\n\n🪵 *Detalle:* ${err.message}`);
  }
};

handler.help = ['comprimir'];
handler.tags = ['herramientas'];
handler.command = ['compress', 'comprimir'];

export default handler;

/** Función de subida a Catbox (la misma que tú usaste) */
async function catbox(content) {
  const { ext, mime } = (await fileTypeFromBuffer(content)) || {};
  const blob = new Blob([content.toArrayBuffer()], { type: mime });
  const formData = new FormData();
  const random = crypto.randomBytes(5).toString('hex');
  formData.append('reqtype', 'fileupload');
  formData.append('fileToUpload', blob, `${random}.${ext}`);

  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: formData,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android)',
    }
  });

  return await res.text();
}
