import fetch from 'node-fetch';
import yts from 'yt-search';

const newsletterJid  = '120363335626706839@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡『 𝐓͢ᴇ𝙖፝ᴍ⃨ 𝘾𝒉꯭𝐚𝑛𝑛𝒆𝑙: 𝑹ᴜ⃜ɓ𝑦-𝑯ᴏ𝒔𝑯𝙞꯭𝑛𝒐 』࿐⟡';

var handler = async (m, { conn, args, usedPrefix, command }) => {
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
      title: botname,
      body: wm,
      thumbnail: icons,
      sourceUrl: redes,
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  if (!args[0]) {
    return conn.reply(
      m.chat,
      `🌸 *Onii-chan... nani sagashitai no?* 〜 (≧◡≦)\n\n🔍 Escribe lo que deseas buscar o pega un enlace de YouTube~\n\n🌼 *Ejemplos:*\n\`${usedPrefix + command} Shinzou wo Sasageyo\`\n\`${usedPrefix + command} https://youtu.be/xxxx\``,
      m,
      { contextInfo, quoted: m }
    );
  }

  try {
    const query = args.join(' ');
    let video = null;
    let url = '';

    // Detecta si es un enlace de YouTube
    const ytUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    const isUrl = ytUrlPattern.test(query);

    if (isUrl) {
      url = query;
    } else {
      await conn.reply(m.chat, `🔎 *Yatta~! estoy buscando tu deseo ${name}-chan.. espera un poco porfi* 🧸`, m, { contextInfo, quoted: m });
      const search = await yts(query);
      video = search.videos?.[0];

      if (!video) {
        return conn.reply(m.chat, `💦 *Gomen ne... no pude encontrar nada...*`, m, { contextInfo, quoted: m });
      }

      const durationSeconds = video.seconds || 0;
      const maxSeconds = 30 * 60;

      if (durationSeconds > maxSeconds) {
        return conn.reply(m.chat, `*lo siento &{name}-chan ~.. ese vídeo supera los 30 minutos..*`, m, { contextInfo, quoted: m });
      }

      // Muestra los detalles del video kawaii antes de descargar
      const caption = `
╭─ꨪᰰ━۪  ࣪  ꨶ ╼ׄ ╼࡙֟፝͝⌒࣪᷼⏜ׅ ࣪🍵᮫໋⃨𝆬 ࣪ ׅ⏜ׄ᷼⌒╼࡙֟፝͝ ╾ 
 𝆡𑘴⃞ֵ݄݁ׄ🫖ׄׄ ⃨֟፝★̫᤺.݁ׄ⋆⃨݁ 𝐏𝕝𝕒𝕪 𝐯𝕚̊𝕕𝕖𝕠 𝕗𝕠𝕣 𝕪𝕠𝕦, 𝐨𝕟𝕚𝕚-𝕔𝕙𝕒𝕟~🌸
     ╰─ꨪᰰ━۪  ࣪  ꨶ ╼ׄ ╼࡙֟፝͝⌒࣪᷼⏜ׅ ࣪🍵᮫໋⃨𝆬 ࣪ ׅ⏜ׄ᷼⌒╼࡙֟፝͝ ╾  
╭─ꨪᰰ━۪  ࣪ ꨶ ╼ׄ ╼࡙֟፝͝⌒࣪᷼⏜ׅ 🍵᮫໋⃨𝆬 ࣪ ⏜ׄ᷼⌒╼࡙֟፝͝ ╾ 
> 𑁯᧙  🍓 *Título:* ${video.title}
> 𑁯᧙  📏 *Duración:* ${video.timestamp}
> 𑁯᧙  👁️ *Vistas:*  ${video.views.toLocaleString()}
> 𑁯᧙  🎨 *Autor:* ${video.author.name}
> 𑁯᧙  🕰️ *Publicado:* ${video.ago}
> 𑁯᧙  📝 *vídeo url:* ${video.url}
╰─ꨪᰰ━۪  ࣪ ꨶ ╼ׄ ╼࡙֟፝͝⌒࣪᷼⏜ׅ 🍵᮫໋⃨𝆬 ࣪ ⏜ׄ᷼⌒╼࡙֟፝͝ ╾
💌 Arigatou por usarme, siempre estaré aquí para ti~ ✨
`.trim();

      await conn.sendMessage(m.chat, { text: caption }, { quoted: m, contextInfo });

      url = video.url;
    }

    const apiUrl = `https://api.vreden.my.id/api/ytplaymp3?query=${encodeURIComponent(url)}`;
    const res = await fetch(apiUrl);
    const json = await res.json();

    if (json.status !== 200 || !json.result?.download?.url) {
      return conn.reply(m.chat, `😿 *No pude descargar ese audio, onii-chan...*`, m, { contextInfo, quoted: m });
    }

    const audioRes = await fetch(json.result.download.url);
    const audioBuffer = await audioRes.buffer();

    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error('Audio vacío o inválido');
    }

    await conn.sendMessage(
      m.chat,
      {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: json.result.download.filename || 'audio.mp3',
        ptt: false
      },
      { contextInfo, quoted: m }
    );

  } catch (e) {
    console.error(e);
    await conn.reply(m.chat, `😭 *Ocurrió un error, onii-chan...*\n\`\`\`${e.message}\`\`\``, m, { contextInfo, quoted: m });
  }
};

handler.help = ['play', 'ytplay'].map(v => v + ' <texto o url>');
handler.tags = ['descargas'];
handler.command = ['play', 'ytplay', 'playaudio'];
handler.register = true;
handler.limit = true;
handler.coin = 2;

export default handler;
