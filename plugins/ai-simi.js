import fetch from 'node-fetch';

let handler = async (m, { conn, text, command }) => {
  if (!text) throw `🔎 Ejemplo de uso:\n${command} conejito blanco`;

  let res = await fetch(`https://zenzxz.dpdns.org/search/stickerlysearch?query=${encodeURIComponent(text)}`);
  if (!res.ok) throw '❌ Error al buscar stickers.';
  
  let json = await res.json();
  if (!json.status || !json.data || json.data.length === 0) throw '❌ No se encontraron stickers con ese nombre.';

  let resultados = json.data.slice(0, 5); // máximo 5
  for (let result of resultados) {
    let { name, author, stickerCount, viewCount, exportCount, thumbnailUrl, url } = result;

    let mensaje = `*🎨 Paquete:* ${name}\n👤 *Autor:* ${author}\n🧩 *Stickers:* ${stickerCount}\n👁️ *Vistas:* ${viewCount}\n📤 *Exportados:* ${exportCount}\n🔗 *Link:* ${url}`;

    await conn.sendFile(m.chat, thumbnailUrl, 'sticker.jpg', mensaje, m);
  }
};

handler.help = ['stickerly <texto>'];
handler.tags = ['sticker'];
handler.command = /^stickerly$/i;

export default handler;
