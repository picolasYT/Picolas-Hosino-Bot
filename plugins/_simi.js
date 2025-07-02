import fetch from 'node-fetch';
import { Sticker } from 'wa-sticker-formatter';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `🔍 *Ejemplo de uso:* ${usedPrefix + command} gato cute`;

  m.react('🔎');

  try {
    let res = await fetch(`https://zenzxz.dpdns.org/search/stickerlysearch?query=${encodeURIComponent(text)}`);
    if (!res.ok) throw '❌ Error al conectar con la API.';
    let json = await res.json();

    if (!json.status || !json.data || json.data.length === 0) {
      throw '😿 No se encontraron stickers con esa búsqueda.';
    }

    let resultados = json.data.slice(0, 5); // Solo 5 resultados
    for (let sticker of resultados) {
      const stiker = new Sticker(sticker.thumbnailUrl, {
        pack: sticker.name,
        author: sticker.author,
        type: 'full',
        categories: ['🤖'],
        id: `stickerly-${Date.now()}`,
        quality: 80
      });

      await conn.sendMessage(m.chat, { sticker: await stiker.toBuffer() }, { quoted: m });
    }

  } catch (e) {
    console.error(e);
    throw '❌ Hubo un error al buscar o enviar los stickers.';
  }
};

handler.help = ['stickerly <texto>'];
handler.tags = ['sticker', 'internet'];
handler.command = ['stickerly', 'stickerpack', 'stickersearch'];
handler.limit = true;

export default handler;
