import fetch from 'node-fetch';
import { Sticker } from 'wa-sticker-formatter';

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `🔍 *Ejemplo de uso:* ${usedPrefix + command} hatsune miku`;

  m.react('🎴');

  try {
    let res = await fetch(`https://zenzxz.dpdns.org/search/stickerlysearch?query=${encodeURIComponent(text)}`);
    if (!res.ok) throw '❌ Error al conectar con la API.';
    let json = await res.json();

    if (!json.status || !json.data || json.data.length === 0) {
      throw '😿 No se encontraron stickers con esa búsqueda.';
    }

    let resultados = shuffleArray(json.data); // Mezclar resultados
    let seleccion = resultados.slice(0, 5); // Elegir 5 aleatorios

    for (let sticker of seleccion) {
      const stiker = new Sticker(sticker.thumbnailUrl, {
        pack: sticker.name,
        author: sticker.author,
        type: 'full',
        categories: ['🔎'],
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
