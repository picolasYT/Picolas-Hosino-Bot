import yts from "yt-search";
import fetch from "node-fetch";

const APIKEY = "Sylphiette's";
const limitMB = 100;

const newsletterJid  = '120363335626706839@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡『 Ruby-Hoshino-Channel 』࿐⟡';

const handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply('🌱 *Escribe el nombre del video o un link de YouTube~*');

  await m.react('🔎');

  // Buscar video
  const res = await yts(text);
  if (!res?.all?.length) return m.reply('😿 *No encontré nada con ese nombre...*');

  const video = res.all[0];

  // Contexto de canal reenviado
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
      title: video.title,
      body: dev,
      thumbnail: icons,
      sourceUrl: video.url,
      mediaType: 1,
      renderLargerThumbnail: true
    }
  };

  // Mostrar detalles del video
  const caption = `
┏━━━━━━━━━━ ♬
┃ 🍃 *YouTube Play* 🎶
┃━━━━━━━━━━━━
┃ 💫 *Título:* ${video.title}
┃ 🎨 *Autor:* ${video.author.name}
┃ ⏱️ *Duración:* ${video.duration.timestamp}
┃ 👁️ *Vistas:* ${video.views.toLocaleString()}
┃ 🔗 *Enlace:* ${video.url}
┗━━━━━━━━━━ ♡`.trim();

  await conn.sendFile(m.chat, video.thumbnail, 'thumb.jpg', caption, m, { contextInfo });

  // Generar links
  const urlAudio = `https://api.sylphy.xyz/download/ytmp3?url=${encodeURIComponent(video.url)}&apikey=${APIKEY}`;
  const urlVideo = `https://api.sylphy.xyz/download/ytmp4?url=${encodeURIComponent(video.url)}&apikey=${APIKEY}`;

  try {
    if (command === 'play') {
      const resApi = await fetch(urlAudio);
      const json = await resApi.json();

      if (!json?.status || !json?.res?.downloadURL) {
        throw new Error('No se pudo descargar el audio.');
      }

      const title = json.res.title || 'audio.mp3';
      await conn.sendFile(m.chat, json.res.downloadURL, title + '.mp3', '', m, { contextInfo });
      await m.react('🎧');

    } else if (command === 'play2' || command === 'playvid') {
      const resApi = await fetch(urlVideo);
      const json = await resApi.json();

      if (!json?.status || !json?.res?.url) {
        throw new Error('No se pudo descargar el video.');
      }

      const videoUrl = json.res.url;
      const title = json.res.title || 'video.mp4';

      const head = await fetch(videoUrl, { method: 'HEAD' });
      const sizeBytes = parseInt(head.headers.get('content-length') || '0');
      const sizeMB = sizeBytes / (1024 * 1024);
      const asDocument = sizeMB > limitMB;

      await conn.sendFile(m.chat, videoUrl, title + '.mp4', '', m, null, {
        asDocument,
        mimetype: 'video/mp4'
      });
      await m.react('🎬');
    }
  } catch (e) {
    console.error(e);
    await m.reply(`💥 *Ocurrió un error inesperado, onii-chan...*\n\`\`\`${e.message}\`\`\``);
  }
};

handler.help = ['play', 'play2'];
handler.tags = ['descargas'];
handler.command = ['play', 'play2', 'playvid'];

export default handler;
