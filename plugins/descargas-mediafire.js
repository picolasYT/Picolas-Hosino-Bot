import fetch from 'node-fetch';

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) return conn.reply(m.chat, '🚩 Ingrese el enlace de un archivo de Mediafire.', m, rcanal);
    if (!/mediafire/gi.test(args[0])) return conn.reply(m.chat, '🚩 El enlace debe ser de un archivo de Mediafire.', m, rcanal);

    await m.react('🕓');

    try {
        let apiUrl = `https://api.sylphy.xyz/download/mediafire?url=${encodeURIComponent(args[0])}&apikey=sylph-30fc019324`;
        let res = await fetch(apiUrl);
        if (!res.ok) throw await res.text();
        
        let json = await res.json();
        if (!json.status) throw json;

        let { filename, filesize, mimetype, uploaded, dl_url } = json.data;

        let txt = `乂  *M E D I A F I R E  -  D O W N L O A D*\n\n`;
        txt += `        ✩  *Nombre* : ${filename}\n`;
        txt += `        ✩  *Peso* : ${filesize}\n`;
        txt += `        ✩  *Publicado* : ${uploaded}\n`;
        txt += `        ✩  *MimeType* : ${mimetype}\n\n`;
        txt += `*- ↻ El archivo se está enviando, espera un momento...*`;

        let img = await (await fetch('https://i.ibb.co/wLQFn7q/logo-mediafire.jpg')).buffer();
        await conn.sendFile(m.chat, img, 'thumbnail.jpg', txt, m, null, rcanal);

        await conn.sendFile(m.chat, dl_url, filename, null, m, null, { mimetype, asDocument: true });

        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('✖️');
        conn.reply(m.chat, '❌ Ocurrió un error al descargar el archivo.', m, rcanal);
    }
};

handler.help = ['mediafire <url>'];
handler.tags = ['downloader', 'premium'];
handler.command = ['mediafire', 'mdfire', 'mf'];
handler.premium = true;

export default handler;
