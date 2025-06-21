import fetch from 'node-fetch';
import baileys from '@whiskeysockets/baileys';

async function sendAlbumMessage(jid, medias, conn, options = {}) {
    if (typeof jid !== "string") throw new TypeError(`jid must be string, received: ${jid}`);
    if (medias.length < 2) throw new RangeError("Se necesitan al menos 2 imágenes para un álbum");

    const caption = options.text || options.caption || "";
    const delay = !isNaN(options.delay) ? options.delay : 500;
    delete options.text;
    delete options.caption;
    delete options.delay;

    const album = baileys.generateWAMessageFromContent(
        jid,
        { messageContextInfo: {}, albumMessage: { expectedImageCount: medias.length } },
        {}
    );

    await conn.relayMessage(album.key.remoteJid, album.message, { messageId: album.key.id });

    for (let i = 0; i < medias.length; i++) {
        const { type, data } = medias[i];
        const img = await baileys.generateWAMessage(
            album.key.remoteJid,
            { [type]: data, ...(i === 0 ? { caption } : {}) },
            { upload: conn.waUploadToServer }
        );
        img.message.messageContextInfo = {
            messageAssociation: { associationType: 1, parentMessageKey: album.key },
        };
        await conn.relayMessage(img.key.remoteJid, img.message, { messageId: img.key.id });
        await baileys.delay(delay);
    }
    return album;
}

// Aquí comienza el handler real que usará tu bot
const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return conn.reply(m.chat, `🍥 *Nyaa~ escribe qué deseas buscar*\n\n✨ Ejemplo: \`${usedPrefix + command} anime girl\``, m);
    }

    await m.react('🕐');
    conn.reply(m.chat, `🍡 *Kawaii-búsqueda activada, ${conn.getName(m.sender)}-chan!* Espera un momentito, porfis~`, m, {
        contextInfo: {
            externalAdReply: {
                title: '🌸 Ruby Hoshino',
                body: 'Buscando imágenes con amor...',
                thumbnail: global.icons, // asegúrate que icons esté definido en global
                sourceUrl: 'https://pinterest.com',
                mediaType: 1,
                renderLargerThumbnail: true,
            }
        }
    });

    try {
        const res = await fetch(`https://api.vreden.my.id/api/pinterest?query=${encodeURIComponent(text)}`);
        const json = await res.json();

        if (!Array.isArray(json.result) || json.result.length < 2) {
            return conn.reply(m.chat, `😿 Lo siento... no encontré muchas imágenes para “${text}”...`, m);
        }

        const imgs = json.result
            .sort(() => 0.5 - Math.random())
            .slice(0, 10)
            .map(url => ({ type: "image", data: { url } }));

        const caption = `🌸 *Resultados para:* ${text}\n\n✨ Espero que te encanten, ${conn.getName(m.sender)}-chan~`;

        await sendAlbumMessage(m.chat, imgs, conn, { caption, quoted: m });
        await m.react('✅');
    } catch (e) {
        console.error(e);
        await m.react('✖️');
        conn.reply(m.chat, `💥 Ocurrió un error al buscar tus imágenes, gomenne~ 😿\n\`\`\`${e.message}\`\`\``, m);
    }
};

handler.help = ['pinterest <tema>'];
handler.tags = ['buscador', 'descargas'];
handler.command = ['pinterest', 'pin'];
handler.register = true;

export default handler;
