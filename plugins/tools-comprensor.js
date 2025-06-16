import FormData from 'form-data';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';

  if (!mime || !mime.startsWith('image/')) {
    return m.reply(`❌ *Responde a una imagen o envía una imagen con el comando* _.comprimir_`);
  }

  try {
    m.react('🛠️');

    // 1. Descarga y guarda temporalmente
    const buffer = await q.download();
    const tempDir = './temp';
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    const inputPath = path.join(tempDir, `${Date.now()}_in.jpg`);
    fs.writeFileSync(inputPath, buffer);

    // 2. Súbela a qu.ax usando nuestra función
    const imageURL = await uploadToQuax(inputPath);
    if (!imageURL) throw new Error('No se pudo subir la imagen a qu.ax');

    // 3. Llama a la API de compresión
    const apiURL = `https://api.siputzx.my.id/api/iloveimg/compress?image=${encodeURIComponent(imageURL)}`;
    const res = await fetch(apiURL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const compressedBuffer = await res.buffer();

    // 4. Envía la imagen comprimida
    await conn.sendMessage(m.chat, {
      image: compressedBuffer,
      caption: `🎯 *¡Imagen comprimida!*\n✨ *Calidad optimizada por LoveIMG*\n🔧 *by Ruby Hoshino Bot*`
    }, { quoted: m });

    // 5. Limpieza
    fs.unlinkSync(inputPath);

  } catch (err) {
    console.error(err);
    m.reply(`❌ *Ocurrió un error al procesar la imagen.*\n\n🪵 *Detalle:* ${err.message}`);
  }
};

handler.help = ['comprimir'];
handler.tags = ['herramientas'];
handler.command = ['compress', 'comprimir'];

export default handler;


/**
 * Función auxiliar para subir una imagen a qu.ax
 */
async function uploadToQuax(filePath) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));

  try {
    const res = await fetch('https://qu.ax/upload', {
      method: 'POST',
      body: form
    });
    const json = await res.json();
    if (json.success && json.url) return json.url;
    console.error('Error al subir a qu.ax:', json);
    return null;
  } catch (e) {
    console.error('Error en uploadToQuax:', e);
    return null;
  }
}
