import fetch from 'node-fetch';

const newsletterJid  = '120363335626706839@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡『 𝐓͢ᴇ𝙖፝ᴍ⃨ 𝘾𝒉꯭𝐚𝑛𝑛𝒆𝑙: 𝑹ᴜ⃜ɓ𝑦-𝑯ᴏ𝒔𝑯𝙞꯭𝑛𝒐 』࿐⟡';
const packname       = '✿⃝𓂃 𝑹𝙪͜͡𝑏𝙮 𝙃𝒐𝘀𝙝𝑖𝙣𝙤 ❀';

var handler = async (m, { conn, args, usedPrefix, command }) => {
  const emoji = '🔎';
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
      body: dev,
      thumbnail: icons,
      sourceUrl: redes,
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  if (!args[0]) {
    return conn.reply(
      m.chat,
      `🌸 *Konnichiwa, onii-chan~!* Necesito que me digas qué quieres buscar en YouTube, ¡te lo buscaré con amor uwu~!\n\n📦 Ejemplo:\n\`${usedPrefix + command} Goku conoce a Bills\``,
      m,
      { contextInfo, quoted: m }
    );
  }

  try {
    await conn.reply(
      m.chat,
      `🕊️ *Buscando tu deseo, onii-chan...*\nUn momento, ne~ 🎧✨`,
      m,
      { contextInfo, quoted: m }
    );

    const query   = encodeURIComponent(args.join(' '));
    const apiUrl  = `https://api.vreden.my.id/api/ytplaymp3?query=${query}`;
    const res     = await fetch(apiUrl);
    const json    = await res.json();

    if (json.status !== 200 || !json.result?.download?.url) {
      return conn.reply(
        m.chat,
        `😿 *Gomenasai... no pude encontrar ni descargar eso, onii-chan~.*`,
        m,
        { contextInfo, quoted: m }
      );
    }

    // Metadata
    const meta = json.result.metadata;
    const title       = meta.title;
    const description = meta.description;
    const timestamp   = meta.timestamp;
    const views       = meta.views.toLocaleString();
    const ago         = meta.ago;
    const authorName  = meta.author?.name || 'Desconocido';
    const downloadURL = json.result.download.url;
    const quality     = json.result.download.quality;
    const filename    = json.result.download.filename;

    const audioRes    = await fetch(downloadURL);
    const audioBuffer = await audioRes.buffer();

    const caption = `
🌸⸝⸝ Konbanwa onii-chan~ ¡Aquí tienes tu música kawaii! 🎶

📌 *Título:* ${title}
👤 *Autor:* ${authorName}
⏱️ *Duración:* ${timestamp}
📅 *Publicado:* ${ago}
👁️ *Vistas:* ${views}
🎧 *Calidad:* ${quality}
📝 *Descripción:*
${description}

Arigatou por usarme, onii-chan~ 💖
`.trim();

    await conn.sendMessage(
      m.chat,
      {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: filename,
        ptt: false,
        caption
      },
      { contextInfo, quoted: m }
    );

  } catch (e) {
    console.error(e);
    await conn.reply(
      m.chat,
      `😭 *Nyaa~ ocurrió un error muy feo, onii-chan...*\n\`\`\`${e.message}\`\`\``,
      m,
      { contextInfo, quoted: m }
    );
  }
};

handler.help = ['play', 'ytplay'].map(v => v + ' <texto>');
handler.tags = ['descargas'];
handler.command = ['play', 'ytplay', 'playaudio'];
handler.register = true;
handler.limit = true;
handler.coin = 2;

export default handler;
