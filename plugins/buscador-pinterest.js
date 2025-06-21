import axios from 'axios';

const pins = async (query) => {
  try {
    const res = await axios.get(`https://anime-xi-wheat.vercel.app/api/pinterest?q=${encodeURIComponent(query)}`);
    const images = Array.from(new Set(res.data.images)); // eliminar duplicadas
    return images.map(url => ({
      image_large_url: url,
      image_medium_url: url,
      image_small_url: url
    }));
  } catch (error) {
    console.error('❌ Error:', error);
    return [];
  }
};

let handler = async (m, { conn, text }) => {
  const contextInfo = {
    mentionedJid: [m.sender],
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363335626706839@newsletter',
      newsletterName: '⏤͟͞ू⃪፝͜⁞⟡『 𝐓͢ᴇ𝙖፝ᴍ⃨ 𝘾𝒉꯭𝐚𝑛𝑛𝒆𝑙: 𝑹ᴜ⃜ɓ𝑦-𝑯ᴏ𝒔𝑯𝙞꯭𝑛𝒐 』࿐⟡',
      serverMessageId: -1
    },
    externalAdReply: {
      title: '🌸 Ruby-Hoshino-Search',
      body: '🔎 Resultados desde Pinterest 🌺',
      thumbnail: icons,
      sourceUrl: redes,
      mediaType: 1,
      renderLargerThumbnail: true
    }
  };

  if (!text) return m.reply('🌸 dime qué imagen quieres buscar en Pinterest~\nEj: *.pinterest gatos kawaii*', m, { contextInfo });

  try {
    await conn.sendMessage(m.chat, { react: { text: '🖼️', key: m.key } });

    const results = await pins(text);
    if (!results.length) return m.reply(`💦 *No encontré nada para:* "${text}", gomen...`, m, { contextInfo });

    const maxImages = Math.min(results.length, 10);
    const urlsUnicas = [...new Set(results.map(v => v.image_large_url || v.image_medium_url))].slice(0, maxImages);

    const imageMessages = await Promise.all(
      urlsUnicas.map(async (url) => ({
        image: { url },
        mimetype: 'image/jpeg'
      }))
    );

    await conn.sendMessage(m.chat, imageMessages, {
      quoted: m,
      contextInfo,
      caption: `🌸 *Resultados de Pinterest para:* _${text}_\n🖼️ Total: ${urlsUnicas.length} imágenes`,
      multiple: true
    });

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (error) {
    console.error(error);
    m.reply('❌ Hubo un error al buscar imágenes en Pinterest.', m, { contextInfo });
  }
};

handler.help = ['pinterest <texto>'];
handler.tags = ['buscador'];
handler.command = ['pinterest', 'pin'];

export default handler;
