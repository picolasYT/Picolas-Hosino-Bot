// Código creado por Destroy wa.me/584120346669

import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `🔍 *Ejemplo de uso:* ${usedPrefix + command} gato cute`;

  m.react('🕵️‍♂️');

  try {
    let res = await fetch(`https://zenzxz.dpdns.org/search/stickerlysearch?query=${encodeURIComponent(text)}`);
    if (!res.ok) throw '❌ Error al conectar con la API.';
    let json = await res.json();

    if (!json.status || !json.data || json.data.length === 0) {
      throw '😿 No se encontraron stickers con esa búsqueda.';
    }

    let resultados = json.data.slice(0, 5); // Solo los primeros 5
    for (let sticker of resultados) {
      let mensaje = `
🎀 *${sticker.name}*
📌 *Autor:* ${sticker.author}
📦 *Stickers:* ${sticker.stickerCount}
👁 *Vistas:* ${sticker.viewCount}
🚀 *Exportados:* ${sticker.exportCount}
🔗 *Enlace:* ${sticker.url}`.trim();

      await conn.sendFile(m.chat, sticker.thumbnailUrl, 'sticker.jpg', mensaje, m);
    }

  } catch (e) {
    console.error(e);
    throw '❌ Hubo un error al buscar los stickers.';
  }
};

handler.help = ['stickerly <texto>'];
handler.tags = ['sticker', 'internet'];
handler.command = ['stickerly', 'stickersearch', 'stickerpack']; // Puedes añadir más alias
handler.limit = true;

export default handler;
