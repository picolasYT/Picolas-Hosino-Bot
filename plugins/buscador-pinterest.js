import fetch from 'node-fetch';
import baileys from '@whiskeysockets/baileys';

const newsletterJid  = '120363335626706839@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡『 𝐓͢ᴇ𝙖፝ᴍ⃨ 𝘾𝒉꯭𝐚𝑛𝑛𝒆𝑙: 𝑹ᴜ⃜ɓ𝑦-𝑯ᴏ𝒔𝑯𝙞꯭𝑛𝒐 』࿐⟡';

const sendAlbumMessage = async (jid, images, conn, options = {}) => {
    const caption = options.caption || '';
    const delay = isNaN(options.delay) ? 500 : options.delay;
    const quoted = options.quoted;

    const messages = await Promise.all(
        images.map(async (img, index) => {
            const message = await baileys.generateWAMessageContent(
                {
                    image: { url: img },
                    caption: index === 0 ? caption : undefined
                },
                { upload: conn.waUploadToServer }
            );

            const full = await baileys.generateWAMessageFromContent(jid, message, {});

            full.message.imageMessage.contextInfo = {
                mentionedJid: [quoted.sender],
                isForwarded: true,
                forwardingScore: 999,
                forwardedNewsletterMessageInfo: {
                    newsletterJid,
                    newsletterName,
                    serverMessageId: -1
                }
            };

            return full;
        })
    );

    // Envía todos como álbum
    await conn.relayMessage(jid, {
        albumMessage: {
            messageList: messages.map(msg => msg.message),
            caption
        }
    }, { messageId: baileys.generateMessageID() });
};

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return conn.reply(m.chat, `🍥 *Nyaa~ escribe qué deseas buscar*\n\n✨ Ejemplo: \`${usedPrefix + command} anime girl\``, m);
    }

    await m.react('🕐');

    conn.reply(m.chat, `🍡 *Kawaii-búsqueda activada, ${conn.getName(m.sender)}-chan!* Espera un momentito, porfis~`, m, {
        contextInfo: {
            mentionedJid: [m.sender],
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
                newsletterJid,
                newsletterName,
                serverMessageId: -1
            },
            externalAdReply: {
                title: '🌸 Ruby Hoshino',
                body: 'Buscando imágenes con amor...',
                thumbnail: global.icons,
                sourceUrl: 'https://pinterest.com',
                mediaType: 1,
                renderLargerThumbnail: false,
            }
        }
    });

    try {
        const res = await fetch(`https://api.vreden.my.id/api/pinterest?query=${encodeURIComponent(text)}`);
        const json = await res.json();

        if (!Array.isArray(json.result) || json.result.length < 2) {
            return conn.reply(m.chat, `😿 Lo siento... no encontré muchas imágenes para “${text}”...`, m);
        }

        const resultImgs = json.result.sort(() => 0.5 - Math.random()).slice(0, 8);

        const caption = `🌸 *Resultados para:* ${text}\n\n✨ Espero que te encanten, ${conn.getName(m.sender)}-chan~ 💕`;
        await sendAlbumMessage(m.chat, resultImgs, conn, { caption, quoted: m });

        await m.react('✅');
    } catch (e) {
        console.error(e);
        await m.react('✖️');
        conn.reply(m.chat, `💥 Ocurrió un error al buscar tus imágenes, gomenne~ 😿\n\`\`\`${e.message}\`\`\``, m);
    }
};

handler.help = ['pinterest <tema>'];
handler.tags = ['descargas', 'buscador'];
handler.command = ['pinterest', 'pin'];
handler.register = true;

export default handler;
