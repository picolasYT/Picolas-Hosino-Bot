import axios from 'axios';


const sendAlbumMessage = async (conn, jid, medias, options = {}) => {
  if (typeof jid !== 'string') throw new TypeError(`jid debe ser string`);
  if (!Array.isArray(medias) || medias.length < 2) throw new RangeError("Se necesitan al menos 2 imágenes para formar un álbum, senpai~");

  const caption = options.text || options.caption || '';
  const delay = !isNaN(options.delay) ? options.delay : 0;

  delete options.text;
  delete options.caption;
  delete options.delay;

  for (let i = 0; i < medias.length; i++) {
    const { type, data } = medias[i];
    const msg = {
      [type]: data,
      ...(i === 0 ? { caption } : {})
    };
    await conn.sendMessage(jid, msg, { quoted: options.quoted });
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  return true;
};


const pins = async (query) => {
  try {
    const res = await axios.get(`https://anime-xi-wheat.vercel.app/api/pinterest?q=${encodeURIComponent(query)}`);
    if (Array.isArray(res.data.images)) {
      return res.data.images.map(url => ({
        image_large_url: url,
        image_medium_url: url,
        image_small_url: url
      }));
    }
    return [];
  } catch (error) {
    console.error('🔴 Error al buscar en Pinterest:', error.message);
    return [];
  }
};

let handler = async (m, { conn, text }) => {
  const userName = conn.getName(m.sender);

  if (!text) {
    return conn.reply(
      m.chat,
      `🌸 ${userName}-chan~!* Debes decirme qué quieres buscar en Pinterest 🖼️✨\n\n🌼 *Ejemplo:*\n.pinterest neko aesthetic`,
      m
    );
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

    const results = await pins(text);
    if (!results.length) {
      return conn.reply(
        m.chat,
        `😿 *Gomen nasai ${userName}-chan...* No encontré nada con: *"${text}"*. Prueba con otra palabra~`,
        m
      );
    }

    const maxImages = Math.min(results.length, 10); // límite de seguridad
    const medias = [];

    for (let i = 0; i < maxImages; i++) {
      medias.push({
        type: 'image',
        data: { url: results[i].image_large_url || results[i].image_medium_url }
      });
    }

    const caption = `
╭─ꨪᰰ⃟⃨ ⛩️ 𝑷𝒊𝒏𝒕𝒆𝒓𝒆𝒔𝒕 𝑨𝒍𝒃𝒖𝒎 ─⬣
🍥 *Búsqueda:* ${text}
🧸 *Solicitado por:* ${userName}
🖼️ *Resultados:* ${maxImages} imágenes
╰───────────────────⬣`.trim();

    await sendAlbumMessage(conn, m.chat, medias, {
      caption,
      quoted: m,
      delay: 0,
    });

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (error) {
    console.error(error);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    m.reply('😵‍💫 *Shimatta!* Ocurrió un error al intentar mostrar las imágenes. Inténtalo más tarde, onii-chan...');
  }
};

handler.help = ['pinterest <texto>'];
handler.tags = ['buscador'];
handler.command = ['pinterest', 'pin'];

export default handler;
