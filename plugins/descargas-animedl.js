import { getDownloadLinks, detail, search } from "../lib/anime.js";

// Ya no necesitamos la función 'lang', era la fuente de la ineficiencia.

let handler = async (m, { conn, command, usedPrefix, text, args }) => {
    if (!text) return m.reply(`🌱 *Ingresa el título de un anime o una URL válida.*\n\n*Ejemplos:*\n• ${usedPrefix + command} Mushoku Tensei\n• ${usedPrefix + command} https://animeav1.com/media/mushoku-tensei`);

    try {
        if (text.startsWith('https://animeav1.com/media/')) {
            await m.react("⌛");
            const info = await detail(args[0]);
            if (info.error) return m.reply(`❌ Error al obtener detalles: ${info.error}`);
            
            const { title, altTitle, description, cover, votes, rating, total, genres, episodes } = info;
            
            // Ya no verificamos los idiomas de antemano. Es mucho más rápido.
            const eps = episodes.map(e => `• Episodio ${e.ep}`).join('\n');
            const gen = genres.join(', ');

            const cap = `乂 \`\`\`ANIME - INFO\`\`\`

≡ 🌷 *Título:* ${title} ${altTitle ? `- ${altTitle}` : ''}
≡ 🌾 *Descripción:* ${description || 'No disponible.'}
≡ 🌲 *Votos:* ${votes}
≡ 🍂 *Rating:* ${rating}
≡ 🍃 *Géneros:* ${gen}
≡ 🌱 *Episodios totales:* ${total}

${eps}

> *Responde a este mensaje con el número del episodio que quieres descargar. Ejemplo:* \`1\`
`.trim();

            const sentMsg = await conn.sendMessage(m.chat, {
                image: { url: cover },
                caption: cap
            }, { quoted: m });

            conn.anime = conn.anime || {};
            conn.anime[m.sender] = {
                ...info, // Guardamos toda la info del anime
                key: sentMsg.key,
                downloading: false,
                timeout: setTimeout(() => {
                    if (conn.anime && conn.anime[m.sender]) {
                        // conn.sendMessage(m.chat, { delete: sentMsg.key }); // Opcional: borrar el mensaje si expira
                        delete conn.anime[m.sender];
                    }
                }, 300_000) // 5 minutos de espera
            };
            await m.react("✅");

        } else {
            await m.react('🔍');
            const results = await search(text);
            if (!results.length) return m.reply('❌ No se encontraron resultados para tu búsqueda.');

            let cap = `✅ *Resultados para "${text}":*\n\n`;
            results.slice(0, 10).forEach((res, index) => {
                cap += `*${index + 1}. ${res.title}*\n🔗 ${res.link}\n\n`;
            });
            cap += `> *Para ver los episodios, usa el comando con el enlace del anime que desees.*`;
            
            // Envío de mensaje simple y eficiente
            await conn.sendMessage(m.chat, { text: cap.trim() }, { quoted: m });
        }
    } catch (error) {
        console.error('Error en handler anime:', error);
        await m.reply(`❌ Ocurrió un error inesperado: ${error.message}`);
    }
};

handler.before = async (m, { conn }) => {
    conn.anime = conn.anime || {};
    const session = conn.anime[m.sender];
    
    // Validaciones iniciales
    if (!session || !m.quoted || m.quoted.id !== session.key.id || session.downloading) return;
    
    const text = m.text.trim();
    // Permite responder con "1" o "1 sub" o "1 dub"
    const [epNumStr, langInput] = text.split(/\s+/);
    const epNum = parseInt(epNumStr);

    if (isNaN(epNum)) return; // No es una respuesta para este comando, ignorar.

    const episode = session.episodes.find(e => parseInt(e.ep) === epNum);
    if (!episode) return m.reply(`❌ Episodio *${epNum}* no encontrado en la lista.`);
    
    try {
        session.downloading = true; // Bloquear nuevas descargas hasta que esta termine
        await m.react("📥");

        // Obtenemos los links solo para el episodio solicitado
        const linkInfo = await getDownloadLinks(episode.link);
        if (linkInfo.error || (!linkInfo.dl.sub && !linkInfo.dl.dub)) {
            return m.reply(`❌ No se encontraron enlaces de descarga para el episodio *${epNum}*.`);
        }
        
        const { sub, dub } = linkInfo.dl;
        let finalLink;
        let chosenLang;

        if (sub && dub && !langInput) {
             // Si hay ambos idiomas y el usuario no especificó, le preguntamos.
            return m.reply(`✅ El episodio *${epNum}* está disponible en SUB y DUB.\n\nResponde de nuevo con:\n• \`${epNum} sub\` para Subtitulado\n• \`${epNum} dub\` para Audio Latino`);
        }

        const lang = langInput?.toLowerCase();
        if (lang === 'sub' && sub) {
            finalLink = sub;
            chosenLang = 'Subtitulado';
        } else if (lang === 'dub' && dub) {
            finalLink = dub;
            chosenLang = 'Audio Latino';
        } else if (sub) { // Si el usuario no especificó o puso algo inválido, tomamos el que esté disponible
            finalLink = sub;
            chosenLang = 'Subtitulado';
        } else {
            finalLink = dub;
            chosenLang = 'Audio Latino';
        }

        await m.reply(`⏳ Descargando *${session.title}* - Episodio ${epNum} (${chosenLang})...`);
        
        // --- LA CORRECCIÓN MÁS IMPORTANTE ---
        // Usar .arrayBuffer() en lugar de .buffer()
        const response = await fetch(finalLink);
        if (!response.ok) throw new Error(`El servidor de descarga respondió con un error: ${response.statusText}`);
        
        const videoBuffer = await response.arrayBuffer();
        
        await conn.sendMessage(m.chat, {
            video: Buffer.from(videoBuffer),
            mimetype: 'video/mp4',
            fileName: `${session.title} - Cap ${epNum} [${chosenLang}].mp4`,
            caption: `✅ ¡Aquí tienes tu episodio!`
        }, { quoted: m });

        await m.react("✅");

    } catch (err) {
        console.error('Error al descargar y enviar:', err);
        await m.reply(`❌ *Error al descargar el episodio ${epNum}:*\n${err.message}`);
        await m.react("❌");
    } finally {
        // Limpiamos la sesión tanto si tuvo éxito como si falló
        if (conn.anime && conn.anime[m.sender]) {
            clearTimeout(session.timeout);
            delete conn.anime[m.sender];
        }
    }
};


handler.command = ["anime", "animedl", "animes"];
handler.tags = ['download'];
handler.help = ["animedl"];
handler.premium = true;

export default handler;