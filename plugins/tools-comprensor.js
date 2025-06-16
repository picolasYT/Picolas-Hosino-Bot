import fetch from 'node-fetch';

const handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';

  if (!mime || !mime.startsWith('image/')) {
    return m.reply(`❌ *Responde a una imagen o envía una imagen con el comando* _.comprimir_`);
  }

  try {
    m.react('🧼');

    const imgBuffer = await q.download();
    const uploaded = await conn.uploadToQuax(imgBuffer); // usa tu sistema de subida, qu.ax o similar

    const apiURL = `https://api.siputzx.my.id/api/iloveimg/compress?image=${encodeURIComponent(uploaded)}`;

    const res = await fetch(apiURL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const img = await res.buffer();

    await conn.sendMessage(m.chat, {
      image: img,
      caption: `🎯 *¡Imagen comprimida!*\n✨ *Calidad optimizada por LoveIMG*\n🔧 *by Ruby Hoshino Bot*`
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    m.reply(`❌ *Ocurrió un error al comprimir la imagen.*\n\n🪵 *Error:* ${err.message}`);
  }
};

handler.help = ['comprimir'];
handler.tags = ['herramientas'];
handler.command = ['compress', 'comprimir'];

export default handler;
