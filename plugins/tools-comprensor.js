import FormData from 'form-data'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

const handler = async (m, { conn }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';

  if (!mime || !mime.startsWith('image/')) {
    return m.reply(`❌ *Responde a una imagen o envía una imagen con el comando* _.comprimir_`);
  }

  try {
    m.react('🛠️');

    const buffer = await q.download();
    const tempPath = path.join('./temp', `${Date.now()}.jpg`);

    if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');
    fs.writeFileSync(tempPath, buffer);

    // 🔧 Subir a qu.ax (CORREGIDO)
    const imageURL = await uploadToQuax(tempPath);

    if (!imageURL) throw new Error('No se pudo subir la imagen a qu.ax');

    // 🔧 Comprimir la imagen con la API
    const compressAPI = `https://api.siputzx.my.id/api/iloveimg/compress?image=${encodeURIComponent(imageURL)}`;
    const res = await fetch(compressAPI);

    if (!res.ok) throw new Error(`Error al comprimir la imagen: ${res.status}`);
    const compressedImage = await res.buffer();

    // ✅ Enviar imagen comprimida
    await conn.sendMessage(m.chat, {
      image: compressedImage,
      caption: `🎯 *¡Imagen comprimida!*\n✨ *Calidad optimizada por LoveIMG*\n🔧 *by Ruby Hoshino Bot*`
    }, { quoted: m });

    fs.unlinkSync(tempPath);

  } catch (err) {
    console.error(err);
    m.reply(`❌ *Ocurrió un error al comprimir la imagen.*\n\n🪵 *Error:* ${err.message}`);
  }
};

handler.help = ['comprimir'];
handler.tags = ['herramientas'];
handler.command = ['compress', 'comprimir'];

export default handler;
