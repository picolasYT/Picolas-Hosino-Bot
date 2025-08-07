import fetch from 'node-fetch';

const handler = async (m, { conn, command, text, isAdmin }) => {
    if (command === 'mute') {
        if (!isAdmin) throw '🍬 *Solo un administrador puede ejecutar este comando';

        const botOwnerJid = global.owner[0][0] + '@s.whatsapp.net';
        if (m.mentionedJid[0] === botOwnerJid) throw '🍬 *El creador del bot no puede ser mutado*';

        let targetJid =
            m.mentionedJid[0] ??
            m.quoted?.sender ??
            text;

        if (targetJid === conn.user.jid) throw '🍭 *No puedes mutar el bot*';

        const metadata = await conn.groupMetadata(m.chat);
        const groupOwner = metadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net';

        if (m.mentionedJid[0] === groupOwner) throw '🍭 *No puedes mutar el creador del grupo*';

        let user = global.db.data.users[targetJid];
        const fakeContact = {
            key: {
                participants: '0@s.whatsapp.net',
                fromMe: false,
                id: 'Halo',
            },
            message: {
                locationMessage: {
                    name: '𝗨𝘀𝘂𝗮𝗿𝗶𝗼 𝗺𝘂𝘁𝗮𝗱𝗼',
                    jpegThumbnail: await (await fetch('https://telegra.ph/file/f8324d9798fa2ed2317bc.png')).buffer(),
                    vcard: `BEGIN:VCARD
VERSION:3.0
N:;Unlimited;;;
FN:Unlimited
ORG:Unlimited
TITLE:
item1.TEL;waid=19709001746:+1 (970) 900-1746
item1.X-ABLabel:Unlimited
X-WA-BIZ-DESCRIPTION:ofc
X-WA-BIZ-NAME:Unlimited
END:VCARD`
                }
            },
            participant: '0@s.whatsapp.net'
        };

        const usageText = '🍬 *Menciona a la persona que deseas mutar*';

        if (!m.mentionedJid[0] && !m.quoted) return conn.reply(m.chat, usageText, m);

        if (user.mute === true) throw '🍭 *Este usuario ya ha sido mutado*';

        conn.reply(m.chat, '*Tus mensajes serán eliminados*', fakeContact, null, {
            mentions: [targetJid]
        });

        global.db.data.users[targetJid].mute = true;

    } else if (command === 'unmute') {
        if (!isAdmin) throw '🍬 *Solo un administrador puede ejecutar este comando';

        let targetJid =
            m.mentionedJid[0] ??
            m.quoted?.sender ??
            text;

        let user = global.db.data.users[targetJid];

        const fakeContact = {
            key: {
                participants: '0@s.whatsapp.net',
                fromMe: false,
                id: 'Halo',
            },
            message: {
                locationMessage: {
                    name: '𝗨𝘀𝘂𝗮𝗿𝗶𝗼 𝗱𝗲𝗺𝘂𝘁𝗮𝗱𝗼',
                    jpegThumbnail: await (await fetch('https://telegra.ph/file/aea704d0b242b8c41bf15.png')).buffer(),
                    vcard: `BEGIN:VCARD
VERSION:3.0
N:;Unlimited;;;
FN:Unlimited
ORG:Unlimited
TITLE:
item1.TEL;waid=19709001746:+1 (970) 900-1746
item1.X-ABLabel:Unlimited
X-WA-BIZ-DESCRIPTION:ofc
X-WA-BIZ-NAME:Unlimited
END:VCARD`
                }
            },
            participant: '0@s.whatsapp.net'
        };

        const usageText = '🍬 *Menciona a la persona que deseas demutar*';

        if (targetJid === m.sender) throw '🍬 *Sólo otro administrador puede desmutarte*';

        if (!m.mentionedJid[0] && !m.quoted) return conn.reply(m.chat, usageText, m);

        if (user.mute === false) throw '🍭 *Este usuario no ha sido mutado*';

        global.db.data.users[targetJid].mute = false;

        conn.reply(m.chat, '*Tus mensajes no serán eliminados*', fakeContact, null, {
            mentions: [targetJid]
        });
    }
};

handler.command = ['mute', 'unmute'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
