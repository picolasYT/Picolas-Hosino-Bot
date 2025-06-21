import fetch from 'node-fetch';
import baileys from '@whiskeysockets/baileys';

async function sendAlbumMessage(jid, medias, conn, options = {}) {
    if (typeof jid !== "string") throw new TypeError(`jid must be string, received: ${jid}`);
    if (medias.length < 2) throw new RangeError("Se necesitan al menos 2 imágenes para un álbum");

    const caption = options.caption || "";
    const quoted = options.quoted;

    const messageKeys = [];

    for (let i = 0; i < medias.length; i++) {
        const { type, data } = medias[i];

        const message = {
            [type]: data,
            ...(i === 0 ? { caption } : {})
        };

        const msg = await baileys.generateWAMessage(jid, message, { upload: conn.waUploadToServer });
        msg.message.messageContextInfo = {
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363335626706839@newsletter',
                newsletterName: '⏤͟͞ू⃪፝͜⁞⟡『 𝐓͢ᴇ𝙖፝ᴍ⃨ 𝘾𝒉꯭𝐚𝑛𝑛𝒆𝑙: 𝑹ᴜ⃜ɓ𝑦-𝑯ᴏ𝒔𝑯𝙞꯭𝑛𝒐 』࿐⟡',
                serverMessageId: -1
            }
        };

        if (quoted) msg.messageContextInfo.quotedMessage = quoted;

        await conn.relayMessage(jid, msg.message, { messageId: msg.key.id });
        messageKeys.push(msg.key.id);
    }

    return messageKeys;
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return conn.reply(m.chat, `🍥 *Nyaa~ escribe qué deseas buscar*\n\n✨ Ejemplo: \`${usedPrefix + command} anime girl\``, m, {
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363335626706839@newsletter',
                    newsletterName: '⏤͟͞ू⃪፝͜⁞⟡『 𝐓͢ᴇ𝙖፝ᴍ⃨ 𝘾𝒉꯭𝐚𝑛𝑛𝒆𝑙: 𝑹ᴜ⃜ɓ𝑦-𝑯ᴏ𝒔𝑯𝙞꯭𝑛𝒐 』࿐⟡',
                    serverMessageId: -1
                }
            }
        });
    }

    await m.react('🔍');

    try {
        const res = await fetch(`https://api.vreden.my.id/api/pinterest?query=${encodeURIComponent(text)}`);
        const json = await res.json();

        if (!Array.isArray(json.result) || json.result.length < 2) {
            return conn.reply(m.chat, `😿 Lo siento... no encontré muchas imágenes para “${text}”...`, m, {
                contextInfo: {
                    isForwarded: true,
                    forwardingScore: 999,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363335626706839@newsletter',
                        newsletterName: '⏤͟͞ू⃪፝͜⁞⟡『 𝐓͢ᴇ𝙖፝ᴍ⃨ 𝘾𝒉꯭𝐚𝑛𝑛𝒆𝑙: 𝑹ᴜ⃜ɓ𝑦-𝑯ᴏ𝒔𝑯𝙞꯭𝑛𝒐 』࿐⟡',
                        serverMessageId: -1
                    }
                }
            });
        }

        const imgs = json.result
            .sort(() => 0.5 - Math.random())
            .slice(0, 10)
            .map(url => ({ type: "image", data: { url } }));

        const caption = `🌸 *Resultados para:* ${text}\n\n✨ Espero que te encanten, ${conn.getName ? conn.getName(m.sender) : m.sender}-chan~`;

        await sendAlbumMessage(m.chat, imgs, conn, {
            caption,
            quoted: m
        });

        await m.react('✅');
    } catch (e) {
        console.error(e);
        await m.react('✖️');
        conn.reply(m.chat, `💥 Ocurrió un error al buscar tus imágenes, gomenne~ 😿\n\`\`\`${e.message}\`\`\``, m, {
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363335626706839@newsletter',
                    newsletterName: '⏤͟͞ू⃪፝͜⁞⟡『 𝐓͢ᴇ𝙖፝ᴍ⃨ 𝘾𝒉꯭𝐚𝑛𝑛𝒆𝑙: 𝑹ᴜ⃜ɓ𝑦-𝑯ᴏ𝒔𝑯𝙞꯭𝑛𝒐 』࿐⟡',
                    serverMessageId: -1
                }
            }
        });
    }
};

handler.help = ['pinterest <tema>'];
handler.tags = ['buscador', 'descargas'];
handler.command = ['pinterest', 'pin'];
handler.register = true;

export default handler;
