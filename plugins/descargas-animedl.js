import { download, detail, search } from "../lib/anime.js";

const handler = async (m, { command, usedPrefix, conn, text, args }) => {
    if (!text) {
        return m.reply(`🌱 *Ingresa el título de un anime o una URL válida.*\n\n*Ejemplos:*\n• \`${usedPrefix + command} Mushoku Tensei\`\n• \`${usedPrefix + command} https://animeav1.com/media/mushoku-tensei\``);
    }

    try {
        if (text.startsWith('https://animeav1.com/media/')) {
            await m.react("⌛");
            const info = await detail(text);

            if (info.error) {
                return m.reply(`❌ Ocurrió un error al obtener los detalles: ${info.error}`);
            }

            const { title, altTitle, description, cover, votes, rating, total, genres, episodes } = info;
            const gen = genres.join(', ');

            // Generar lista de episodios con idiomas ya disponibles gracias a la optimización
            const eps = episodes.map(e => {
                const langStr = e.lang.map(l => l.toUpperCase()).join(' & ');
                return `• Episodio ${e.ep} (${langStr})`;
            }).join('\n');

            const cap = `乂 \`\`\`ANIME - DOWNLOAD\`\`\`

≡ 🌷 *Título:* ${title} ${altTitle ? `- ${altTitle}` : ''}
≡ 🌾 *Descripción:* ${description}
≡ 🌲 *Votos:* ${votes}
≡ 🍂 *Rating:* ${rating}
≡ 🍃 *Géneros:* ${gen}
≡ 🌱 *Episodios totales:* ${total}
≡ 🌿 *Episodios disponibles:*
${eps}

> Responde a este mensaje con el número del episodio y el idioma que deseas.
> *Ejemplo: 1 sub*
> *Ejemplo: 3 dub*`;

            const sentMsg = await conn.sendMessage(m.chat, { image: { url: cover }, caption: cap }, { quoted: m });

            conn.anime = conn.anime || {};
            conn.anime[m.sender] = {
                ...info, // Guardamos toda la info para no tener que volver a buscarla
                key: sentMsg.key,
                downloading: false,
                timeout: setTimeout(() => {
                    if (conn.anime[m.sender]) {
                        // Opcional: enviar un mensaje de que la sesión expiró
                        conn.sendMessage(m.chat, { text: 'La sesión para descargar ha expirado.', edit: sentMsg.key });
                        delete conn.anime[m.sender];
                    }
                }, 300_000) // 5 minutos de tiempo de espera
            };
            await m.react("✅");

        } else {
            await m.react('🔍');
            const results = await search(text);
            if (!results.length) {
                return conn.reply(m.chat, '❌ No se encontraron resultados para tu búsqueda.', m);
            }

            const searchResults = results.slice(0, 10).map((res, index) => 
                `*${index + 1}. ${res.title}*\n${res.link}`
            ).join('\n\n');

            const cap = `✅ *Resultados de la búsqueda:*\n\n${searchResults}\n\n*Responde con el número del anime que quieres ver o usa el comando con el link.*`;
            
            // Puedes usar una imagen genérica o la del primer resultado
            const thumbUrl = results[0]?.img || 'https://i.imgur.com/P1jP3J1.jpeg'; 
            await conn.sendMessage(m.chat, { image: { url: thumbUrl }, caption: cap }, { quoted: m });
        }
    } catch (error) {
        console.error('Error en el handler de anime:', error);
        await conn.reply(m.chat, '❌ Ocurrió un error inesperado al procesar tu solicitud.', m);
    }
};

handler.before = async (m, { conn }) => {
    conn.anime = conn.anime || {};
    const session = conn.anime[m.sender];
    if (!session || !m.isQuoted || !m.quoted.isBaileys || m.quoted.id !== session.key.id) return;
    if (session.downloading) {
        return m.reply('⏳ Ya hay una descarga en proceso. Por favor, espera a que termine.');
    }

    const [epStr, langInput] = m.text.trim().split(/\s+/);
    const epNum = parseInt(epStr);

    if (isNaN(epNum)) {
        return m.reply('💬 Por favor, responde con un número de episodio válido. Ejemplo: `1 sub`');
    }

    const episode = session.episodes.find(e => parseInt(e.ep) === epNum);
    if (!episode) {
        return m.reply(`❌ Episodio *${epNum}* no encontrado en la lista.`);
    }

    const lang = langInput?.toLowerCase() || episode.lang[0]; // Si no especifica idioma, tomar el primero disponible
    if (!episode.lang.includes(lang)) {
        return m.reply(`❌ El idioma *${lang.toUpperCase()}* no está disponible para el episodio ${epNum}.\n\nDisponibles: *${episode.lang.join(', ').toUpperCase()}*`);
    }

    const idiomaLabel = lang === 'sub' ? 'Sub Español' : 'Español Latino';
    await m.reply(`📥 Preparando descarga de *${session.title}* - Cap. ${epNum} [${idiomaLabel}]...`);

    session.downloading = true; // Bloquear nuevas descargas

    try {
        const downloadInfo = await download(episode.link);
        if (downloadInfo.error || !downloadInfo.dl[lang]) {
            throw new Error(downloadInfo.details || 'No se pudo obtener el enlace de descarga.');
        }

        const downloadUrl = downloadInfo.dl[lang];

        await conn.sendFile(m.chat, downloadUrl, `${session.title} - Cap ${epNum}.mp4`, `✅ Descarga completa.\n*${session.title}*\nEpisodio ${epNum} - ${idiomaLabel}`, m, false, {
            asDocument: true // Enviar como documento para evitar compresión de WhatsApp
        });
        await m.react("✅");

    } catch (err) {
        console.error('Error al descargar y enviar el video:', err);
        await m.reply(`❌ *Error al descargar el episodio.*\n\nMotivo: ${err.message}\n\nInténtalo de nuevo más tarde.`);
        await m.react("❌");
    } finally {
        // Limpiar la sesión después de intentar la descarga
        if (conn.anime[m.sender]) {
            clearTimeout(session.timeout);
            delete conn.anime[m.sender];
        }
    }
};

handler.command = ["anime", "animedl", "animes"];
handler.tags = ['download'];
handler.help = ["anime"];
handler.premium = true; // O false, según tu configuración

export default handler;