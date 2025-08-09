import fetch from 'node-fetch';

const handler = async (m, { conn, text }) => {
  if (!text) throw '🍬 *Por favor, ingresa un enlace válido de MediaFire*';

  if (!text.match(/(https?:\/\/(www\.)?mediafire\.com\/[^\s]+)/gi)) {
    throw '🍬 *El enlace debe ser de MediaFire*';
  }

  try {
    // Reacción estética
    await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

    const apiKey = 'sylph-30fc019324';
    const apiUrl = `https://api.sylphy.xyz/download/mediafire?url=${encodeURIComponent(text)}&apikey=${apiKey}`;

    const res = await fetch(apiUrl);
    const json = await res.json();

    if (!json.status || !json.data?.dl_url) throw '🍬 *Error al obtener el archivo de MediaFire*';

    const { filename, filesize, mimetype, dl_url } = json.data;

    await conn.sendMessage(m.chat, {
      document: { url: dl_url },
      fileName: filename,
      mimetype: mimetype,
      caption: `📦 *Nombre:* ${filename}\n📏 *Tamaño:* ${filesize}`
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    throw '🍬 *Ocurrió un error al descargar el archivo*';
  }
};

handler.help = ['mediafire <enlace>'];
handler.tags = ['descargas'];
handler.command = /^mediafire$/i;
handler.register = true;

export default handler;
