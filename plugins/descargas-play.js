import yts from 'yt-search';
import fetch from 'node-fetch';

const limit = 100; // Tamaño máximo en MB antes de enviarse como documento
const APIKEY = "Sylphiette's";

// Información de "canal" simulado
const newsletterJid = '120363335626706839@newsletter';
const newsletterName = '🌸 Ruby-Hoshino News ✦';

const handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply('🌸 No lo puedes dejar vacio~ escribe el nombre de un video o un link de YouTube!*');
  m.react('🔎');

  const res = await yts(text);
  if (!res || !res.all || res.all.length === 0) {
    return m.reply('🥺 *Gomen... no encontré resultados para esa búsqueda.*');
  }

  const video = res.all[0];
  const caption = `
─ꨪᰰ━۪  ࣪  ꨶ ╼ׄ ╼࡙֟፝͝⌒࣪᷼⏜ׅ ࣪🍵᮫໋⃨𝆬 ࣪ ׅ⏜ׄ᷼⌒╼࡙֟፝͝ ╾ 
 𝆡𑘴⃞ֵ݄݁ׄ🫖ׄׄ ⃨֟፝★̫᤺.݁ׄ⋆⃨݁ 𝐏𝕝𝕒𝕪 𝕗𝕠𝕣 𝕪𝕠𝕦, 𝐨𝕟𝕚𝕚-𝕔𝕙𝕒𝕟~🌸
     ╰─ꨪᰰ━۪  ࣪  ꨶ ╼ׄ ╼࡙֟፝͝⌒࣪᷼⏜ׅ ࣪🍵᮫໋⃨𝆬 ࣪ ׅ⏜ׄ᷼⌒╼࡙֟፝͝ ╾  
╭─ꨪᰰ━۪  ࣪ ꨶ ╼ׄ ╼࡙֟፝͝⌒࣪᷼⏜ׅ 🍵᮫໋⃨𝆬 ࣪ ⏜ׄ᷼⌒╼࡙֟፝͝ ╾ 
> 𑁯᧙  🍓 *Título:* ${video.title}
> 𑁯᧙  📏 *Duración:* ${video.duration.timestamp
> 𑁯᧙  👁️ *Vistas:*   ${video.views.toLocaleString()}
> 𑁯᧙  🎨 *Autor:* ${video.author.name}
> 𑁯᧙  📝 *vídeo url:* ${video.url}
╰─ꨪᰰ━۪  ࣪ ꨶ ╼ׄ ╼࡙֟፝͝⌒࣪᷼⏜ׅ 🍵᮫໋⃨𝆬 ࣪ ⏜ׄ᷼⌒╼࡙֟፝͝ ╾
💌 Arigatou por usarme, siempre estaré aquí para ti~ ✨
`.trim();

  const contextInfo = {
    mentionedJid: [m.sender],
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
      newsletterJid,
      newsletterName,
      serverMessageId: -1,
    },
    externalAdReply: {
      title: packname,
      body: '✨ Powered by Ruby Hoshino',
      thumbnail: icons,
      sourceUrl: video.url,
      mediaType: 1,
      renderLargerThumbnail: true,
    }
  };

  await conn.sendFile(
    m.chat,
    await (await fetch(video.thumbnail)).buffer(),
    'thumb.jpg',
    caption,
    m,
    false,
    { contextInfo }
  );

  const urlAudio = `https://api.sylphy.xyz/download/ytmp3?url=${encodeURIComponent(video.url)}&apikey=${APIKEY}`;
  const urlVideo = `https://api.sylphy.xyz/download/ytmp4?url=${encodeURIComponent(video.url)}&apikey=${APIKEY}`;

  if (command === 'play') {
    try {
      const resApi = await fetch(urlAudio);
      const json = await resApi.json();
      if (!json.status) return m.reply('😿 *No pude obtener el audio del video, onii-chan...*');

      const audioUrl = json.res.downloadURL;
      const title = json.res.title || 'audio.mp3';

      await conn.sendFile(
        m.chat,
        audioUrl,
        title,
        `🎧 *Aquí tienes tu audio, ${conn.getName(m.sender)}-san~*`,
        m,
        false,
        { contextInfo }
      );
      await m.react('✅');
    } catch (e) {
      console.error(e);
      return m.reply('❌ Error al descargar audio: ' + e.message);
    }
  }

  if (command === 'play2' || command === 'playvid') {
    try {
      const resApi = await fetch(urlVideo);
      const json = await resApi.json();
      if (!json.status) return m.reply('😿 *No pude obtener el video...*');

      const videoUrl = json.res.url;
      const title = json.res.title || 'video.mp4';

      const head = await fetch(videoUrl, { method: 'HEAD' });
      const sizeBytes = parseInt(head.headers.get('content-length'), 10);
      const sizeMB = sizeBytes / (1024 * 1024);
      const asDocument = sizeMB >= limit;

      const fileCaption = asDocument
        ? `📦 *El video pesa más de ${limit}MB, por eso lo envié como documento, ${conn.getName(m.sender)}-chan.*`
        : `🎬 *Aquí tienes tu video, disfruta~*`;

      await conn.sendFile(
        m.chat,
        videoUrl,
        title,
        fileCaption,
        m,
        false,
        {
          asDocument,
          mimetype: 'video/mp4',
          contextInfo
        }
      );
      await m.react('✅');
    } catch (e) {
      console.error(e);
      return m.reply('❌ Error al descargar video: ' + e.message);
    }
  }
};

handler.help = ['play', 'play2'];
handler.tags = ['download'];
handler.command = ['play', 'play2', 'playvid'];

export default handler;
