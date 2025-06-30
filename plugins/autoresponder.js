import axios from 'axios';

let handler = async (m, { conn, args }) => {
  let packName = args.join(' ').trim();
  if (!packName) return m.reply('Escribe el nombre del pack: .packsticker Ruby Hoshino');

  // Busca el pack en StickersWiki
  let searchUrl = `https://stickerswiki.rocks/api/search?query=${encodeURIComponent(packName)}`;
  let res = await axios.get(searchUrl).catch(() => null);
  let packs = res?.data?.stickers || [];
  if (packs.length === 0) return m.reply('No encontré packs con ese nombre.');

  // Toma el primer pack encontrado
  let packId = packs[0].id;

  // Busca los stickers del pack
  let stickersRes = await axios.get(`https://stickerswiki.rocks/api/packs/${packId}`).catch(() => null);
  let stickers = stickersRes?.data?.stickers || [];
  if (stickers.length === 0) return m.reply('No hay stickers en este pack.');

  // Envía cada sticker como sticker de WhatsApp
  for (let sticker of stickers) {
    let url = sticker.image_url; // link directo al sticker
    await conn.sendFile(m.chat, url, 'sticker.webp', '', m, false, { asSticker: true });
    await new Promise(r => setTimeout(r, 800)); // Evita spam y baneos
  }
};

handler.help = ['packsticker <nombre>'];
handler.tags = ['sticker'];
handler.command = ['packsticker'];

export default handler;