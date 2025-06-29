import fs from 'fs';
const charactersFilePath = './src/database/characters.json';

let activeTrades = {};

function normalizeName(str) {
(/\s+/g, ' ').trim();
}

let handler = async (m, { conn, args, usedPrefix }) => {
    if (!m.isGroup) return;

    // Validación de argumentos mínimos
    if (!args[0] || m.mentionedJid.length === 0 || !args.join(' ').includes('/')) {
        return conn.reply(m.chat,
`《✧》Debes especificar dos personajes para intercambiarlos.

> ✐ Ejemplo: *${usedPrefix}intercambiar @usuario Personaje1 / Personaje2*
> Donde "Personaje1" es el tuyo y "Personaje2" el del usuario mencionado.`, m);
    }

    // Quita todas las menciones tipo @1234567890 o @nombre
    let cleanArgs = args.join(' ').replace(/@\S+/g, '').trim();
    let [rawA, rawB] = cleanArgs.split(/\s*\/\s*/).map(v => v.trim());

    const userA = m.sender;
    const userB = m.mentionedJid[0];
    if (userA === userB) return conn.reply(m.chat, '❀ No puedes intercambiar contigo mismo.', m);

    if (!rawA || !rawB) {
        return conn.reply(m.chat,
`《✧》Debes especificar dos personajes para intercambiarlos.

> ✐ Ejintercambiar @usuario Personaje1 / Personaje2*`, m);
    }

    // Validar solicitudes activas
    if (activeTrades[userA] || activeTrades[userB])
        return conn.reply(m.chat, '❀ Ya hay una solicitud de intercambio activa para uno de los usuarios.', m);

    // Cargar personajes
    if (!fs.existsSync(charactersFilePath))
        return conn.reply(m.chat, '❀ No se encontró la base de datos de personajes.', m);
    let characters = JSON.parse(fs.readFileSync(charactersFilePath, 'utf-8'));

    // Buscar personajes (ignorando espacios y mayúsculas)
    let charA = characters.find(c =>
        normalizeName(c.name) === normalizeName(rawA) && c.user === userA
    );
    if (!charA)
        return conn.reply(m.chat, `❀ No posees a *${rawA}* en tu colección.`, m);

    let charB = characters.find(c =>
        normalizeName(c.name) === normalizeName(rawB)
    );
    if (!charB)
        return conn.reply(m.chat, `❀ No existe ningún personaje llamado *${rawB}*.`, m);
    if (!charB.user)
        return conn.reply(m.chat, `❀ *${rawB}* no pertenece a nadie.`, m);
    if (charB.user !== userB)
        return conn.reply(m.chat, `❀ *${rawB}* no pertenece al usuario mencionado.`, m);

    // Enviar solicitud
    let nameA = conn.getName(userA), nameB = conn.getName(userB);
    let msg = `‌‌‍‌‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‍‌‌‌‌‍‌‌‌‌‌‌‍‌‌「✐」@${userA.split('@')[0]}, @${userB.split('@')[0]} te ha enviado una solicitud de intercambio.

})
✦ [@${userA.split('@')[0]}] *${charA.name}* (${charA.value})

✐ Para aceptar el intercambio responde a este mensaje con "Aceptar", la solicitud expira en 60 segundos.`;

    let sent = await conn.reply(m.chat, msg, m, { mentions: [userA, userB] });

    // Guardar solicitud activa
    activeTrades[userA] = { userA, userB, charA: charA.name, charB: charB.name };
    activeTrades[userB] = activeTrades[userA];

    // Esperar respuesta
    let accepted = false;
    let handlerAccept = async (msgAccept) => {
        if (
            msgAccept.isGroup &&
            msgAccept.quoted &&
            msgAccept.quoted.id === sent.key.id &&
            msgAccept.sender === userB &&
            (msgAccept.text || '').trim().toLowerCase() === 'aceptar'
        ) {
            accepted = true;

            // Intercambiar dueños
            let idxA = characters.findIndex(c => normalizeName(c.name) === normalizeName(charA.name) && c.user === userA);
            let idxB = characters.findIndex(c => normalizeName(c.name) === normalizeName(charB.name) && c.user === userB);
            if (idxA === -1 || idxB === -1) return;

            characters[idxA].user = userB;
            characters[idxB].user = userA;
            fs.writeFileSync(charactersFilePath, JSON.stringify(characters, null, 2));

            delete activeTrades[userA];
            delete activeTrades[userB];

            let msgDone = `「✐」Intercambio aceptado!

✦ @${userB.split('@')[0]} » *${charA.name}*
✦ @${userA.split('@')[0]} » *${charB.name}*`;
            await conn.reply(m.chat, msgDone, m, { mentions: [userA, userB] });
        }
    };
    conn.ev.on('messages.upsert', handlerAccept);

    // Expirar solicitud
    setTimeout(() => {
        if (!accepted) {
            delete activeTrades[userA];
            delete activeTrades[userB];
            conn.reply(m.chat, '⏳ La solicitud de intercambio ha expirado.', m);
        }
        conn.ev.off('messages.upsert', handlerAccept);
    }, 60000);
};

handler.help = ['intercambiar @usuario Personaje1 / Personaje2'];
handler.tags = ['anime'];
handler.command = ['intercambiar'];
handler.group = true;

export default handler;