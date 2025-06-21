import axios from 'axios';

const newsletterJid = '120363335626706839@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡『 𝐓͢ᴇ𝙖፝ᴍ⃨ 𝘾𝒉꯭𝐚𝑛𝑛𝒆𝑙: 𝑹ᴜ⃜ɓ𝑦-𝑯ᴏ𝒔𝑯𝙞꯭𝑛𝒐 』࿐⟡';

const sendAlbumMessage = async (conn, jid, medias, options = {}) => {
  if (typeof jid !== 'string') throw new TypeError(`jid debe ser string`);
  if (!Array.isArray(medias) || medias.length < 2) throw new RangeError("Se necesitan al menos 2 imágenes");

  const caption = options.text || options.caption || '';
  const delay = !isNaN(options.delay) ? options.delay : 500;

  const contextInfo = {
    mentionedJid: [jid],
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
      newsletterJid,
      newsletterName,
      serverMessageId: -1
    },
    externalAdReply: {
      title: packname,
      body: global.dev,
      thumbnail: global.icons,
      sourceUrl: global.redes,
      mediaType: 1,
      renderLargerThumbnail: true
    }
  };

  for (let i = 0; i < medias.length; i++) {
    const { type, data } = medias[i];
    const msg = {
      [type]: data,
      ...(i === 0 ? { caption } : {})
    };

    await conn.sendMessage(jid, msg, {
      quoted: options.quoted,
      contextInfo
    });

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
    console.error('❌ Error al buscar imágenes de Pinterest:', error);
    return [];
  }
};

let handler = async (m, { conn, text }) => {
  const userName = conn.getName(m.sender);

  const contextInfo = {
    mentionedJid: [m.sender],
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
      newsletterJid,
      newsletterName,
      serverMessageId: -1
    },
    externalAdReply: {
      title: packname,
      body: global.dev,
      thumbnail: global.icons,
      sourceUrl: global.redes,
      mediaType: 1,
      renderLargerThumbnail: true
    }
  };

  if (!text) {
    return conn.reply(
      m.chat,
      `📌 *${userName}-chan~!* porfis escribe lo que deseas buscar en Pinterest 🖼️\n\n🌼 *Ejemplo:*\n.pinterest neko aesthetic`,
      m,
      { contextInfo, quoted: m }
    );
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

    const results = await pins(text);
    if (!results.length) {
      return conn.reply(
        m.chat,
        `😿 *Gomen ${userName}-chan… no encontré resultados para:* "${text}"`,
        m,
        { contextInfo, quoted: m }
      );
    }

    const maxImages = Math.min(results.length, 10);
    const medias = [];

    for (let i = 0; i < maxImages; i++) {
      medias.push({
        type: 'image',
        data: {
          url: results[i].image_large_url || results[i].image_medium_url
        }
      });
    }

    const caption = `
╭─❀⃟⃨ 𝑷𝒊𝒏𝒕𝒆𝒓𝒆𝒔𝒕 𝑨𝒍𝒃𝒖𝒎 ⛩️
🌸 *Búsqueda:* ${text}
💌 *Solicitado por:* ${userName}
🖼️ *Imágenes encontradas:* ${maxImages}
╰──────────────────⬣`.trim();

    await sendAlbumMessage(conn, m.chat, medias, {
      caption,
      quoted: m,
      delay: 700
    });

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (error) {
    console.error(error);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    conn.reply(
      m.chat,
      `💥 *Ups... algo salió mal, ${userName}-chan...*\n\`\`\`${error.message}\`\`\``,
      m,
      { contextInfo, quoted: m }
    );
  }
};

handler.help = ['pinterest <texto>'];
handler.tags = ['buscador'];
handler.command = ['pinterest', 'pin'];

export default handler;
