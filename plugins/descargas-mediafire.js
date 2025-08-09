import fetch from 'node-fetch';
import { pipeline } from 'stream';
import { promisify } from 'util';
import fs from 'fs';
const streamPipeline = promisify(pipeline);

let handler = async (m, { conn, args }) => {
  if (!args[0]) return conn.reply(m.chat, '🚩 Ingrese el enlace de un archivo de Mediafire.', m, rcanal);
  if (!/mediafire\.com/i.test(args[0])) return conn.reply(m.chat, '🚩 El enlace debe ser de un archivo de Mediafire.', m, rcanal);

  await m.react('🕓');

  try {
    let apiUrl = `https://api.sylphy.xyz/download/mediafire?url=${encodeURIComponent(args[0])}&apikey=sylph-30fc019324`;
    let res = await fetch(apiUrl);
    let json = await res.json();

    if (!json.status || !json.data) {
      await m.react('✖️');
      return conn.reply(m.chat, '❌ No se pudo obtener la información del archivo.', m, rcanal);
    }

    let { filename, filesize, mimetype, uploaded, dl_url } = json.data;

    let txt = `乂  *M E D I A F I R E  -  D O W N L O A D*\n\n`;
    txt += `        ✩  *Nombre* : ${filename}\n`;
    txt += `        ✩  *Peso* : ${filesize}\n`;
    txt += `        ✩  *Publicado* : ${uploaded}\n`;
    txt += `        ✩  *MimeType* : ${mimetype}\n\n`;
    txt += `⏳ *Descargando… 0%*`;

    let img = await (await fetch('https://i.ibb.co/wLQFn7q/logo-mediafire.jpg')).buffer();
    let progressMsg = await conn.sendFile(m.chat, img, 'thumbnail.jpg', txt, m, null, rcanal);

    let filePath = `/tmp/${filename}`;
    let downloadRes = await fetch(dl_url);

    if (!downloadRes.ok) throw new Error(`❌ Error al descargar: ${downloadRes.statusText}`);
    
    let total = Number(downloadRes.headers.get('content-length')) || 0;
    let downloaded = 0;

    await streamPipeline(
      downloadRes.body.on('data', chunk => {
        downloaded += chunk.length;
        if (total) {
          let percent = Math.round((downloaded / total) * 100);
          conn.sendMessage(m.chat, { text: `⏳ *Descargando… ${percent}%*`, edit: progressMsg.key });
        }
      }),
      fs.createWriteStream(filePath)
    );

    await conn.sendFile(m.chat, filePath, filename, null, m, null, { mimetype, asDocument: true });
    await m.react('✅');
    conn.sendMessage(m.chat, { text: `✅ Archivo enviado: *${filename}*`, edit: progressMsg.key });

    fs.unlinkSync(filePath);

  } catch (err) {
    console.error(err);
    await m.react('✖️');
    conn.reply(m.chat, '❌ Ocurrió un error al procesar la descarga.', m, rcanal);
  }
};

handler.help = ['mediafire *<url>*'];
handler.tags = ['downloader', 'premium'];
handler.command = ['mediafire', 'mdfire', 'mf'];
handler.premium = true;

export default handler;
