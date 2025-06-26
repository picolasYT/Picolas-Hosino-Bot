import { promises as fs } from 'fs';

const charactersFilePath = './src/database/characters.json';
const haremFilePath = './src/database/harem.json';

const cooldowns = {};

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error('❀ No se pudo cargar el archivo characters.json.');
    }
}

async function saveCharacters(characters) {
    try {
        await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2), 'utf-8');
    } catch (error) {
        throw new Error('❀ No se pudo guardar el archivo characters.json.');
    }
}

let handler = async (m, { conn }) => {
    const userId = m.sender;
    const now = Date.now();

    if (cooldowns[userId] && now < cooldowns[userId]) {
        const remainingTime = Math.ceil((cooldowns[userId] - now) / 1000);
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        return await conn.reply(m.chat, `𝙙𝙚𝙗𝙚𝙨 𝙚𝙨𝙥𝙚𝙧𝙖𝙧 ${minutes} minutos y ${seconds} segundos* 𝙥𝙖𝙧𝙖 𝙫𝙤𝙡𝙫𝙚𝙧 𝙖 𝙧𝙚𝙘𝙡𝙖𝙢𝙖𝙧 𝙤𝙩𝙧𝙖 𝙬𝙖𝙞𝙛𝙪 ᓀ‸ᓂ`, m);
    }

    if (m.quoted && m.quoted.text) {
        try {
            const characters = await loadCharacters();
            const characterIdMatch = m.quoted.text.match(/𝙄𝘿: \*(.+?)\*/);

            if (!characterIdMatch) {
                await conn.reply(m.chat, '《✧》No se pudo encontrar el ID del personaje en el mensaje citado.', m);
                return;
            }

            const characterId = characterIdMatch[1];
            const character = characters.find(c => c.id === characterId);

            if (!character) {
                await conn.reply(m.chat, '《✧》El mensaje citado no es un personaje válido.', m);
                return;
            }

            if (character.user && character.user !== userId) {
                await conn.reply(
                    m.chat,
                    `ඩා 𝙡𝙤 𝙨𝙞𝙚𝙣𝙩𝙤 𝙥𝙚𝙧𝙤 𝙚𝙡 𝙥𝙚𝙧𝙨𝙤𝙣𝙖𝙟𝙚 *${character.name}* 𝙮𝙖 𝙛𝙪𝙚 𝙧𝙚𝙘𝙡𝙖𝙢𝙖𝙙𝙤 𝙥𝙤𝙧 @${character.user.split('@')[0]},`,
                    m,
                    { mentions: [character.user] }
                );
                return;
            }

            character.user = userId;
            character.status = "Reclamado";

            await saveCharacters(characters);

            await conn.reply(
                m.chat,
                ` ᥫ᭡ ⏤͟͟͞͞𝙍𝙀𝘾𝙇𝘼𝙈𝘼𝘿𝙊 𝙀𝙓𝙄𝙏𝙊𝙎𝘼𝙈𝙀𝙉𝙏𝙀⃤\n` +
                `┃ ¡𝐅𝐄𝐋𝐈𝐂𝐈𝐃𝐀𝐃𝐄𝐒 𝐏𝐎𝐑 𝐑𝐄𝐂𝐋𝐀𝐌𝐀𝐑 𝐀 *${character.name}* ૮(˶ᵔᵕᵔ˶)ა,
                m
            );

            cooldowns[userId] = now + 30 * 60 * 1000; // 30 minutos

        } catch (error) {
            await conn.reply(m.chat, `𖤛 𝒊 𝒂𝒎 𝒔𝒐𝒓𝒓𝒚 𝒉𝒖𝒃𝒐 𝒖𝒏 𝒆𝒓𝒓𝒐𝒓 𝒂𝒍 𝒊𝒏𝒕𝒆𝒏𝒕𝒂𝒓 𝒓𝒆𝒄𝒍𝒂𝒎𝒂𝒓 𝒕𝒖 𝒘𝒂𝒊𝒇𝒖 ｡°(°¯᷄◠¯᷅°)°｡: ${error.message}`, m);
        }

    } else {
        await conn.reply(m.chat, '⏤͟͟͞͞✐ 𝘿𝙚𝙗𝙚𝙨 𝙘𝙞𝙩𝙖𝙧 𝙪𝙣 𝙥𝙚𝙧𝙨𝙤𝙣𝙖𝙟𝙚 𝙫𝙖́𝙡𝙞𝙙𝙤 ՞߹ - ߹՞', m);
    }
};

handler.help = ['claim'];
handler.tags = ['gacha'];
handler.command = ['c', 'claim', 'reclamar'];
handler.group = true;

export default handler;