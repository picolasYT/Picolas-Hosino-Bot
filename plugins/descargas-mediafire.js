import fetch from 'node-fetch';

const handler = async (m, { conn, args }) => {
    if (!args[0]) throw '📎 *Por favor, proporciona un enlace válido de MediaFire.*\n\nEjemplo: `.mf https://www.mediafire.com/file/xxxxxx/archivo.apk/file`';

    if (!args[0].includes('mediafire.com')) throw '❌ *Ese enlace no es válido de MediaFire.*';

    try {
        // Reacción estética
        await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

        let apiUrl = `https://api.sylphy.xyz/download/mediafire?url=${encodeURIComponent(args[0])}&apikey=sylph-30fc019324`;

        let res = await fetch(apiUrl);
        let json = await res.json();

        if (!json.status) throw '⚠️ *No se pudo descargar el archivo, revisa el enlace.*';

        let { filename, filesize, mimetype, dl_url } = json.data;

        await conn.sendMessage(
            m.chat,
            {
                document: { url: dl_url },
                mimetype,
                fileName: filename,
                caption: `📂 *Nombre:* ${filename}\n📦 *Tamaño:* ${filesize}`
            },
            { quoted: m }
        );

    } catch (err) {
        console.error(err);
        throw '❌ *Ocurrió un error al procesar tu solicitud.*';
    }
};

handler.command = ['mf', 'mediafire'];
handler.help = ['mediafire <url>'];
handler.tags = ['descargas'];

export default handler;
