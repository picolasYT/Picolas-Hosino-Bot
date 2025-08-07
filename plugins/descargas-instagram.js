import { igdl } from 'ruhend-scraper';

const rwait = '⏳';
const done = '✅';
const error = '❌';
const msm = '⚠️';

const handler = async (m, { args, conn }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `${emoji2} 𝙿𝚘𝚛 𝚏𝚊𝚟𝚘𝚛, 𝚒𝚗𝚐𝚛𝚎𝚜𝚊 𝚞𝚗 𝚎𝚗𝚕𝚊𝚌𝚎 𝚍𝚎 𝙸𝚗𝚜𝚝𝚊𝚐𝚛𝚊𝚖.\n\n📌 *Ejemplo:* .instagram https://www.instagram.com/...`, m);
  }

  try {
    await m.react(rwait);
    const res = await igdl(args[0]);
    const data = res.data;

    for (let media of data) {
      const caption = `
┏━━━⬣ 𝗜𝗡𝗦𝗧𝗔𝗚𝗥𝗔𝗠 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗
┃❒  *Descripción:* ${media.caption || 'Sin descripción'}
┃❐  *Usuario:* @${media.username || 'Desconocido'}
┃❐  *Publicado:* ${formatDate(media.timestamp)}
┃❐  *Tipo:* ${media.type || 'Desconocido'}
┗━━━━━━━━━━━━⬣`.trim();

      await conn.sendFile(m.chat, media.url, 'instagram.mp4', caption, m);
    }

    await m.react(done);
  } catch (e) {
    console.error(e);
    await m.react(error);
    return conn.reply(m.chat, `${msm} 𝙾𝚌𝚞𝚛𝚛𝚒𝚘́ 𝚞𝚗 𝚎𝚛𝚛𝚘𝚛 𝚊𝚕 𝚍𝚎𝚜𝚌𝚊𝚛𝚐𝚊𝚛 𝚎𝚕 𝚟𝚒𝚍𝚎𝚘.`, m);
  }
};

handler.command = ['instagram', 'ig'];
handler.tags = ['descargas'];
handler.help = ['instagram', 'ig <link>'];
handler.group = true;
handler.register = true;
handler.coin = 2;

export default handler;

function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('es-ES', { timeZone: 'America/Mexico_City' });
}
