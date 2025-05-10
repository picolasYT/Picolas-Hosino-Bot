import moment from 'moment-timezone';
import fs from 'fs';
import path from 'path';

// Usamos process.cwd() para obtener el directorio de trabajo actual
const cwd = process.cwd();

let handler = async (m, { conn, args }) => {
    let userId = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;
    let user = global.db.data.users[userId];
    let name = conn.getName(userId);
    let _uptime = process.uptime() * 1000;
    let uptime = clockString(_uptime);
    let totalreg = Object.keys(global.db.data.users).length;
    let totalCommands = Object.values(global.plugins).filter((v) => v.help && v.tags).length;

    // Construir la ruta correcta utilizando process.cwd()
    const gifVideosDir = path.join(cwd, 'src', 'menu');  // Aquí utilizamos process.cwd() para construir la ruta

    // Imprimir la ruta generada para depuración
    console.log('Ruta generada para los GIFs:', gifVideosDir);

    // Verifica si la ruta existe
    if (!fs.existsSync(gifVideosDir)) {
        console.error('El directorio no existe:', gifVideosDir);
        return;
    }

    // Lee los archivos del directorio
    const gifVideos = fs.readdirSync(gifVideosDir)
        .filter(file => file.endsWith('.mp4'))  // Filtra solo los archivos .mp4
        .map(file => path.join(gifVideosDir, file));  // Obtiene las rutas completas de los archivos

    // Escoge uno aleatorio
    const randomGif = gifVideos[Math.floor(Math.random() * gifVideos.length)];


    let txt = `
☆✼★━━━━━━━━━━━━━━━━━★✼☆｡
        ┎┈┈┈┈┈┈┈୨♡୧┈┈┈┈┈┈┈┒
    𓏲꯭֟፝੭ ꯭⌑(꯭𝐑).꯭𝐔.꯭𝐁.꯭𝐘.꯭ ⭑𝐇.꯭𝐎.꯭𝐒.꯭𝐇.꯭𝐈.꯭𝐍.꯭𝐎.꯭𓏲꯭֟፝੭ 
        ┖┈┈┈┈┈┈┈୨♡୧┈┈┈┈┈┈┈┚
｡☆✼★━━━━━━━━━━━━━━━━━★✼☆｡


"¡Hola, ${name}! Mi nombre es *Ruby Hoshino* ٩(˘◡˘)۶"
Aquí tienes la lista de comandos
╔═══════⩽✦✰✦⩾═══════╗
       「 𝙄𝙉𝙁𝙊 𝘿𝙀𝙇 𝘽𝙊𝙏 」
╚═══════⩽✦✰✦⩾═══════╝
║ ☆ 🌟 *𝖳𝖨𝖯𝖮 𝖣𝖤 𝖡𝖮𝖳*: *𝖶𝖠𝖨𝖥𝖴*
║ ☆ 🚩 *𝖬𝖮𝖣𝖮*: *𝖯𝖴𝖡𝖫𝖨𝖢𝖮*
║ ☆ 📚 *B𝖠𝖨𝖫𝖤𝖸𝖲*: *𝖬𝖴𝖫𝖳𝖨 𝖣𝖤𝖵𝖨𝖢𝖤*
║ ☆ 🌐 *𝖢𝖮𝖬𝖠𝖭𝖣𝖮𝖲 𝖤𝖭 𝖳𝖮𝖳𝖠𝖫*: ${totalCommands}
║ ☆ ⏱️ *𝖳𝖨𝖤𝖬𝖯𝖮* *𝖠𝖢𝖳𝖨𝖵𝖮*: ${uptime}
║ ☆ 👤 *𝖴𝖲𝖴𝖠𝖱𝖨𝖮𝖲* *𝖱𝖤𝖦𝖨𝖲𝖳𝖱𝖠𝖣𝖮𝖲*: ${totalreg}
║ ☆ 👩‍💻 *𝖢𝖱𝖤𝖠𝖣𝖮𝖱*: [𝑾𝒉𝒂𝒕𝒔𝑨𝒑𝒑](https://Wa.me/18294868853)
╚════════════════════════╝
Crea un *Sub-Bot* con tu número utilizando *#qr* o *#code*

╔══⩽✦✰✦⩾══╗
   「 ${(conn.user.jid == global.conn.user.jid ? '𝘽𝙤𝙩 𝙊𝙛𝙞𝙘𝙞𝙖𝙡' : '𝙎𝙪𝙗𝘽𝙤𝙩')} 」
╚══⩽✦✰✦⩾══╝

*L I S T A  -  D E  -  C O M A N D O S*

֪֪  ᷼⏜۪۪۪۪۪۪۪۪᷼ᩘ͡⏜᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼︵۪۪۪۪֟፝᷼︵᷼⡼🌑 𑂳᮫ִ͛⢧ ᷼︵۪۪۪۪፝֟᷼︵᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼⏜۪۪۪۪۪۪۪۪᷼ᩘ͡⏜᷼ 
╭☁️✿⃟⃢᭄͜═✩═『 𝙸𝚗𝚏𝚘-𝙱𝚘𝚝 』═✩═⃟⃢᭄͜✿☁️
᷼⏝۪۪۪۪۪۪۪۪᷼ᩘ͡⏝᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼︶۪۪۪۪֟፝᷼︶᷼ ⢧᮫ִ𑂳🌑⡼ ᷼︶۪۪۪۪፝֟᷼︶᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼⏝۪۪۪۪۪۪۪۪᷼ᩘ͡⏝᷼

✨⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐩𝐚𝐫𝐚 𝐯𝐞𝐫 𝐞𝐬𝐭𝐚𝐝𝐨 𝐞 𝐢𝐧𝐟𝐨𝐫𝐦𝐚𝐜𝐢𝐨́𝐧 𝐝𝐞 𝐥𝐚 𝐁𝐨𝐭 ✨⊹

╭̭𔘓꯭ุꕀ꯭꯭҇؃꯭░⃝꯭─꯭🦋꯭꯭⌑꯭ֶࣩׄ𝅄⃗་꯭𖤐꯭̯ *#help • #menu*  
> ✦ Ver la lista de comandos de la Bot.  
|  𔘓ุꕀᨛ ░⃝─🦋 ⌑꯭ֶࣩׄ𝅄⃗་꯭𖤐̯ *#uptime • #runtime*  
> ✦ Ver tiempo activo o en línea de la Bot.  
|  𔘓ุꕀᨛ ░⃝─🦋 ⌑꯭ֶࣩׄ𝅄⃗་꯭𖤐̯ *#sc • #script*  
> ✦ Link del repositorio oficial de la Bot.
𔘓꯭ุꕀ꯭꯭҇؃꯭░⃝꯭─꯭🦋꯭꯭⌑꯭ֶࣩׄ𝅄⃗་꯭𖤐꯭̯ *#staff • #colaboradores*  
> ✦ Ver la lista de desarrolladores de la Bot.  
𔘓꯭ุꕀ꯭꯭҇؃꯭░⃝꯭─꯭🦋꯭꯭⌑꯭ֶࣩׄ𝅄⃗་꯭𖤐꯭̯ *#serbot • #serbot code*  
> ✦ Crea una sesión de Sub-Bot.  
𔘓꯭ุꕀ꯭꯭҇؃꯭░⃝꯭─꯭🦋꯭꯭⌑꯭ֶࣩׄ𝅄⃗་꯭𖤐꯭̯ *#bots • #sockets*  
> ✦ Ver la lista de Sub-Bots activos.  
𔘓꯭ุꕀ꯭꯭҇؃꯭░⃝꯭─꯭🦋꯭꯭⌑꯭ֶࣩׄ𝅄⃗་꯭𖤐꯭̯ *#creador*  
> ✦ Contacto del creador de la Bot.  
𔘓꯭ุꕀ꯭꯭҇؃꯭░⃝꯭─꯭🦋꯭꯭⌑꯭ֶࣩׄ𝅄⃗་꯭𖤐꯭̯ *#status • #estado*  
> ✦ Ver el estado actual de la Bot.  
𔘓꯭ุꕀ꯭꯭҇؃꯭░⃝꯭─꯭🦋꯭꯭⌑꯭ֶࣩׄ𝅄⃗་꯭𖤐꯭̯ *#links • #grupos*  
> ✦ Ver los enlaces oficiales de la Bot.  
𔘓꯭ุꕀ꯭꯭҇؃꯭░⃝꯭─꯭🦋꯭꯭⌑꯭ֶࣩׄ𝅄⃗་꯭𖤐꯭̯ *#infobot • #infobot*  
> ✦ Ver la información completa de la Bot.  
𔘓꯭ุꕀ꯭꯭҇؃꯭░⃝꯭─꯭🦋꯭꯭⌑꯭ֶࣩׄ𝅄⃗་꯭𖤐꯭̯ *#sug • #newcommand*  
> ✦ Sugiere un nuevo comando.  
𔘓꯭ุꕀ꯭꯭҇؃꯭░⃝꯭─꯭🦋꯭꯭⌑꯭ֶࣩׄ𝅄⃗་꯭𖤐꯭̯ *#p • #ping*  
> ✦ Ver la velocidad de respuesta del Bot.  
𔘓꯭ุꕀ꯭꯭҇؃꯭░⃝꯭─꯭🦋꯭꯭⌑꯭ֶࣩׄ𝅄⃗་꯭𖤐꯭̯ *#reporte • #reportar*  
> ✦ Reporta alguna falla o problema de la Bot.  
𔘓꯭ุꕀ꯭꯭҇؃꯭░⃝꯭─꯭🦋꯭꯭⌑꯭ֶࣩׄ𝅄⃗་꯭𖤐꯭̯ *#sistema • #system*  
> ✦ Ver estado del sistema de alojamiento.  
𔘓꯭ุꕀ꯭꯭҇؃꯭░⃝꯭─꯭🦋꯭꯭⌑꯭ֶࣩׄ𝅄⃗་꯭𖤐꯭̯ *#speed • #speedtest*  
> ✦ Ver las estadísticas de velocidad de la Bot.  
𔘓꯭ุꕀ꯭꯭҇؃꯭░⃝꯭─꯭🦋꯭꯭⌑꯭ֶࣩׄ𝅄⃗་꯭𖤐꯭̯ *#views • #usuarios*  
> ✦ Ver la cantidad de usuarios registrados en el sistema.  
𔘓꯭ุꕀ꯭꯭҇؃꯭░⃝꯭─꯭🦋꯭꯭⌑꯭ֶࣩׄ𝅄⃗་꯭𖤐꯭̯ *#funciones • #totalfunciones*  
> ✦ Ver todas las funciones de la Bot.  
𔘓꯭ุꕀ꯭꯭҇؃꯭░⃝꯭─꯭🦋꯭꯭⌑꯭ֶࣩׄ𝅄⃗་꯭𖤐꯭̯ *#ds • #fixmsgespera*  
> ✦ Eliminar archivos de sesión innecesarios.  
𔘓꯭ุꕀ꯭꯭҇؃꯭░⃝꯭─꯭🦋꯭꯭⌑꯭ֶࣩׄ𝅄⃗་꯭𖤐꯭̯ *#editautoresponder*  
> ✦ Configurar un Prompt personalizado de la Bot.  
ੈ₊˚༅༴╰────︶.︶ ⸙ ͛ ͎ ͛  ︶.︶ ੈ₊˚༅,

֪  ᷼⏜۪۪۪۪۪۪۪۪᷼ᩘ͡⏜᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼︵۪۪۪۪֟፝᷼︵᷼⡼🌑 𑂳᮫ִ͛⢧ ᷼︵۪۪۪۪፝֟᷼︵᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼⏜۪۪۪۪۪۪۪۪᷼ᩘ͡⏜᷼ 
╭☁️✿⃟⃢᭄͜═✩═『  𝙱𝚞𝚜𝚌𝚊𝚍𝚘𝚛𝚎𝚜 』═✩═⃟⃢᭄͜✿☁️
᷼⏝۪۪۪۪۪۪۪۪᷼ᩘ͡⏝᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼︶۪۪۪۪֟፝᷼︶᷼ ⢧᮫ִ𑂳🌑⡼ ᷼︶۪۪۪۪፝֟᷼︶᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼⏝۪۪۪۪۪۪۪۪᷼ᩘ͡⏝᷼

🔍⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐩𝐚𝐫𝐚 𝐫𝐞𝐚𝐥𝐢𝐳𝐚𝐫 𝐛𝐮́𝐬𝐪𝐮𝐞𝐝𝐚𝐬 𝐞𝐧 𝐝𝐢𝐬𝐭𝐢𝐧𝐭𝐚𝐬 𝐩𝐥𝐚𝐭𝐚𝐟𝐨𝐫𝐦𝐚𝐬 🔎⊹

⌈ ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ. *#tiktoksearch • #tiktoks*  
> ✦ Buscador de videos de TikTok.  
| ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ.*#tweetposts*  
> ✦ Buscador de posts de Twitter/X.    
| ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ. *#ytsearch • #yts*  
> ✦ Realiza búsquedas en YouTube.  
| ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ. *#githubsearch*  
> ✦ Buscador de usuarios de GitHub.  
| ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ. *#cuevana • #cuevanasearch*  
> ✦ Buscador de películas/series por Cuevana.  
| ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ. *#google*  
> ✦ Realiza búsquedas en Google.  
| ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ. *#pin • #pinterest*  
> ✦ Buscador de imágenes de Pinterest.  
| ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ.*animeinfo*  
> ✦ Buscador de información de un animé
| ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ. *#imagen • #image*  
> ✦ Buscador de imágenes en Google.  
| ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ. *#animesearch • #animess*  
> ✦ Buscador de animes en TioAnime.  
| ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ. *#animei • #animeinfo*  
> ✦ Buscador de capítulos de #animesearch.  
| ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ. *#infoanime*  
> ✦ Buscador de información de anime/manga.  
| ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ. *#hentaisearch • #searchhentai*  
> ✦ Buscador de capítulos hentai.  
| ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ. *#xnxxsearch • #xnxxs*  
> ✦ Buscador de videos de XNXX.  
| ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ. *#xvsearch • #xvideossearch*  
> ✦ Buscador de videos de Xvideos.  
| ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ. *#pornhubsearch • #phsearch*  
> ✦ Buscador de videos de Pornhub.  
| ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ. *#npmjs*  
> ✦ Buscador de paquetes en npmjs.  
᷼︶۪۪۪۪፝֟᷼︶᷼╰──────✧──────╯᷼︶᷼

֪  ᷼⏜۪۪۪۪۪۪۪۪᷼ᩘ͡⏜᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼︵۪۪۪۪֟፝᷼︵᷼⡼🌑 𑂳᮫ִ͛⢧ ᷼︵۪۪۪۪፝֟᷼︵᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼⏜۪۪۪۪۪۪۪۪᷼ᩘ͡⏜᷼ 
╭☁️✿⃟⃢᭄͜═✩═『  𝙳𝚎𝚜𝚌𝚊𝚛𝚐𝚊𝚜 』═✩═⃟⃢᭄͜✿☁️
᷼⏝۪۪۪۪۪۪۪۪᷼ᩘ͡⏝᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼︶۪۪۪۪֟፝᷼︶᷼ ⢧᮫ִ𑂳🌑⡼ ᷼︶۪۪۪۪፝֟᷼︶᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼⏝۪۪۪۪۪۪۪۪᷼ᩘ͡⏝᷼

📥⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐝𝐞 𝐝𝐞𝐬𝐜𝐚𝐫𝐠𝐚𝐬 𝐩𝐚𝐫𝐚 𝐯𝐚𝐫𝐢𝐨𝐬 𝐚𝐫𝐜𝐡𝐢𝐯𝐨𝐬  📂⊹

ㅤۚ𑁯ׂᰍ  ☕ ᳴   ׅ  ׄʚ   ̶ *#tiktok • #tt*
> ✦ Descarga videos de TikTok.
ㅤۚ𑁯ׂᰍ  ☕ ᳴   ׅ  ׄʚ   ̶ *#mediafire • #mf*
> ✦ Descargar un archivo de MediaFire.
ㅤۚ𑁯ׂᰍ ☕ ᳴ ׅ ׄʚ ̶ *#tiktok • #tt*
> ✦ Descarga videos de TikTok.
ㅤۚ𑁯ׂᰍ ☕ ᳴ ׅ ׄʚ ̶ *#pindl • #pinterestdl*
> ✦ Descarga videos de Pinterest con un enlace.
ㅤۚ𑁯ׂᰍ ☕ ᳴ ׅ ׄʚ ̶ *#mediafire • #mf*
> ✦ Descargar archivos de MediaFire.
ㅤۚ𑁯ׂᰍ ☕ ᳴ ׅ ׄʚ ̶ *#pinvid • #pinvideo* + [enlace]
> ✦ Descargar videos de Pinterest.
ㅤۚ𑁯ׂᰍ ☕ ᳴ ׅ ׄʚ ̶ *#mega • #mg* + [enlace]
> ✦ Descargar archivos de MEGA.
ㅤۚ𑁯ׂᰍ ☕ ᳴ ׅ ׄʚ ̶ *#play • #play2*
> ✦ Descargar música/video de YouTube.
ㅤۚ𑁯ׂᰍ ☕ ᳴ ׅ ׄʚ ̶ *#ytmp3 • #ytmp4*
> ✦ Descarga directa por url de YouTube.
ㅤۚ𑁯ׂᰍ ☕ ᳴ ׅ ׄʚ ̶ *#fb • #facebook*
> ✦ Descargar videos de Facebook.
ㅤۚ𑁯ׂᰍ ☕ ᳴ ׅ ׄʚ ̶ *#twitter • #x* + [link]
> ✦ Descargar videos de Twitter/X.
ㅤۚ𑁯ׂᰍ ☕ ᳴ ׅ ׄʚ ̶ *#ig • #instagram*
> ✦ Descargar contenido de Instagram.
ㅤۚ𑁯ׂᰍ ☕ ᳴ ׅ ׄʚ ̶ *#tts • #tiktoks* + [búsqueda]
> ✦ Buscar videos de TikTok.
ㅤۚ𑁯ׂᰍ ☕ ᳴ ׅ ׄʚ ̶ *#terabox • #tb* + [enlace]
> ✦ Descargar archivos de Terabox.
ㅤۚ𑁯ׂᰍ ☕ ᳴ ׅ ׄʚ ̶ *#gdrive • #drive* + [enlace]
> ✦ Descargar archivos desde Google Drive.
ㅤۚ𑁯ׂᰍ ☕ ᳴ ׅ ׄʚ ̶ *#ttimg • #ttmp3* + <url>
> ✦ Descargar fotos/audios de TikTok.
ㅤۚ𑁯ׂᰍ ☕ ᳴ ׅ ׄʚ ̶ *#gitclone* + <url>
> ✦ Descargar repositorios desde GitHub.
ㅤۚ𑁯ׂᰍ ☕ ᳴ ׅ ׄʚ ̶ *#xvideosdl*
> ✦ Descargar videos de Xvideos.
ㅤۚ𑁯ׂᰍ ☕ ᳴ ׅ ׄʚ ̶ *#xnxxdl*
> ✦ Descargar videos de XNXX.
ㅤۚ𑁯ׂᰍ ☕ ᳴ ׅ ׄʚ ̶ *#apk • #modapk*
> ✦ Descargar APKs (Aptoide).
ㅤۚ𑁯ׂᰍ ☕ ᳴ ׅ ׄʚ ̶ *#tiktokrandom • #ttrandom*
> ✦ Descargar video aleatorio de TikTok.
ㅤۚ𑁯ׂᰍ ☕ ᳴ ׅ ׄʚ ̶ *#npmdl • #npmdownloader*
> ✦ Descargar paquetes desde NPMJs.
ㅤۚ𑁯ׂᰍ ☕ ᳴ ׅ ׄʚ ̶ *#animelinks • #animedl*
> ✦ Descargar enlaces disponibles de anime.
╰──── ੈ₊˚༅༴╰────︶.︶ ⸙ ͛ ͎ ͛ ︶.︶ ੈ₊˚༅

֪  ᷼⏜۪۪۪۪۪۪۪۪᷼ᩘ͡⏜᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼︵۪۪۪۪֟፝᷼︵᷼⡼🌑 𑂳᮫ִ͛⢧ ᷼︵۪۪۪۪፝֟᷼︵᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼⏜۪۪۪۪۪۪۪۪᷼ᩘ͡⏜᷼ 
╭☁️✿⃟⃢᭄͜═✩═『  𝙴𝚌𝚘𝚗𝚘𝚖𝚒𝚊 』═✩═⃟⃢᭄͜✿☁️
᷼⏝۪۪۪۪۪۪۪۪᷼ᩘ͡⏝᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼︶۪۪۪۪֟፝᷼︶᷼ ⢧᮫ִ𑂳🌑⡼ ᷼︶۪۪۪۪፝֟᷼︶᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼⏝۪۪۪۪۪۪۪۪᷼ᩘ͡⏝᷼

💰🎮⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐝𝐞 𝐞𝐜𝐨𝐧𝐨𝐦𝐢́𝐚 𝐲 𝐑𝐏𝐆 𝐩𝐚𝐫𝐚 𝐠𝐚𝐧𝐚𝐫 𝐝𝐢𝐧𝐞𝐫𝐨 𝐲 𝐨𝐭𝐫𝐨𝐬 𝐫𝐞𝐜𝐮𝐫𝐬𝐨𝐬 🏆💎⊹

ൃ⵿꤬ᩚ̸̷͠ᩘ🍒̷̸ᩚ⃨⢾ ֺ ֢ ᮫  ─ *#w • #work • #trabajar*
> ✦ Trabaja para ganar ${moneda}.
ൃ⵿꤬ᩚ̸̷͠ᩘ🎀̷̸ᩚ⃨⢾ ֺ ֢ ᮫  ─ *#slut • #protituirse*
> ✦ Trabaja como prostituta y gana ${moneda}.
ൃ⵿꤬ᩚ̸̷͠ᩘ🍨̷̸ᩚ⃨⢾ ֺ ֢ ᮫  ─ *#cf • #suerte*
> ✦ Apuesta tus ${moneda} a cara o cruz.
ൃ⵿꤬ᩚ̸̷͠ᩘ🌸̷̸ᩚ⃨⢾ ֺ ֢ ᮫ ⵿ ─ *#crime • #crimen*
> ✦ Trabaja como ladrón para ganar ${moneda}.
ൃ⵿꤬ᩚ̸̷͠ᩘ🪷̷̸ᩚ⃨⢾ ֺ ֢ ᮫  ─ *#ruleta • #roulette • #rt*
> ✦ Apuesta ${moneda} al color rojo o negro.
ൃ⵿꤬ᩚ̸̷͠ᩘ🥡̷̸ᩚ⃨⢾ ֺ ֢ ᮫  ─ *#casino • #apostar*
> ✦ Apuesta tus ${moneda} en el casino.
ൃ⵿꤬ᩚ̸̷͠ᩘ🍒̷̸ᩚ⃨⢾ ֺ ֢ ᮫  ─ *#slot*
> ✦ Apuesta tus ${moneda} en la ruleta y prueba tu suerte.
ൃ⵿꤬ᩚ̸̷͠ᩘ🎀̷̸ᩚ⃨⢾ ֺ ֢ ᮫  ─ *#cartera • #wallet*
> ✦ Ver tus ${moneda} en la cartera.
ൃ⵿꤬ᩚ̸̷͠ᩘ🍨̷̸ᩚ⃨⢾ ֺ ֢ ᮫  ─ *#banco • #bank*
> ✦ Ver tus ${moneda} en el banco.
ൃ⵿꤬ᩚ̸̷͠ᩘ🌸̷̸ᩚ⃨⢾ ֺ ֢ ᮫ ⵿ ─ *#deposit • #depositar • #d*
> ✦ Deposita tus ${moneda} al banco.
ൃ⵿꤬ᩚ̸̷͠ᩘ🪷̷̸ᩚ⃨⢾ ֺ ֢ ᮫  ─ *#with • #retirar • #withdraw*
> ✦ Retira tus ${moneda} del banco.
ൃ⵿꤬ᩚ̸̷͠ᩘ🥡̷̸ᩚ⃨⢾ ֺ ֢ ᮫  ─ *#transfer • #pay*
> ✦ Transfiere ${moneda} o XP a otros usuarios.
ൃ⵿꤬ᩚ̸̷͠ᩘ🍒̷̸ᩚ⃨⢾ ֺ ֢ ᮫  ─ *#miming • #minar • #mine*
> ✦ Trabaja como minero y recolecta recursos.
ൃ⵿꤬ᩚ̸̷͠ᩘ🎀̷̸ᩚ⃨⢾ ֺ ֢ ᮫  ─ *#buyall • #buy*
> ✦ Compra ${moneda} con tu XP.
ൃ⵿꤬ᩚ̸̷͠ᩘ🍨̷̸ᩚ⃨⢾ ֺ ֢ ᮫  ─ *#daily • #diario*
> ✦ Reclama tu recompensa diaria.
ൃ⵿꤬ᩚ̸̷͠ᩘ🌸̷̸ᩚ⃨⢾ ֺ ֢ ᮫ ⵿ ─  *#cofre*
> ✦ Reclama un cofre diario lleno de recursos.
ൃ⵿꤬ᩚ̸̷͠ᩘ🪷̷̸ᩚ⃨⢾ ֺ ֢ ᮫  ─ *#weekly • #semanal*
> ✦ Reclama tu regalo semanal.
ൃ⵿꤬ᩚ̸̷͠ᩘ🥡̷̸ᩚ⃨⢾ ֺ ֢ ᮫  ─ *#monthly • #mensual*
> ✦ Reclama tu recompensa mensual.
ൃ⵿꤬ᩚ̸̷͠ᩘ🍒̷̸ᩚ⃨⢾ ֺ ֢ ᮫  ─ *#steal • #robar • #rob*
> ✦ Intenta robarle ${moneda} a alguien.
ൃ⵿꤬ᩚ̸̷͠ᩘ🎀̷̸ᩚ⃨⢾ ֺ ֢ ᮫  ─ *#robarxp • #robxp*
> ✦ Intenta robar XP a un usuario.
ൃ⵿꤬ᩚ̸̷͠ᩘ🍨̷̸ᩚ⃨⢾ ֺ ֢ ᮫  ─ *#eboard • #baltop*
> ✦ Ver el ranking de usuarios con más ${moneda}.
ൃ⵿꤬ᩚ̸̷͠ᩘ🌸̷̸ᩚ⃨⢾ ֺ ֢ ᮫ ⵿ ─ *#aventura • #adventure*
> ✦ Aventúrate en un nuevo reino y recolecta recursos.
ൃ⵿꤬ᩚ̸̷͠ᩘ🪷̷̸ᩚ⃨⢾ ֺ ֢ ᮫  ─ *#curar • #heal*
> ✦ Cura tu salud para volverte aventurero.
ൃ⵿꤬ᩚ̸̷͠ᩘ🥡̷̸ᩚ⃨⢾ ֺ ֢ ᮫  ─ *#cazar • #hunt • #berburu*
> ✦ Aventúrate en una caza de animales.
ൃ⵿꤬ᩚ̸̷͠ᩘ🍒̷̸ᩚ⃨⢾ ֺ ֢ ᮫  ─ *#inv • #inventario*
> ✦ Ver tu inventario con todos tus ítems.
ൃ⵿꤬ᩚ̸̷͠ᩘ🎀̷̸ᩚ⃨⢾ ֺ ֢ ᮫  ─ *#mazmorra • #explorar*
> ✦ Explorar mazmorras para ganar ${moneda}.
ൃ⵿꤬ᩚ̸̷͠ᩘ🍨̷̸ᩚ⃨⢾ ֺ ֢ ᮫  ─ *#halloween*
> ✦ Reclama tu dulce o truco (Solo en Halloween).
ൃ⵿꤬ᩚ̸̷͠ᩘ🌸̷̸ᩚ⃨⢾ ֺ ֢ ᮫ ⵿ ─ *#christmas • #navidad*
> ✦ Reclama tu regalo navideño (Solo en Navidad).
╰────︶.︶ ⸙ ͛ ͎ ͛  ︶.︶ ੈ₊˚༅,

֪  ᷼⏜۪۪۪۪۪۪۪۪᷼ᩘ͡⏜᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼︵۪۪۪۪֟፝᷼︵᷼⡼🌑 𑂳᮫ִ͛⢧ ᷼︵۪۪۪۪፝֟᷼︵᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼⏜۪۪۪۪۪۪۪۪᷼ᩘ͡⏜᷼ 
╭☁️✿⃟⃢᭄͜═✩═『  𝙶𝚊𝚌𝚑𝚊 』═✩═⃟⃢᭄͜✿☁️
᷼⏝۪۪۪۪۪۪۪۪᷼ᩘ͡⏝᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼︶۪۪۪۪֟፝᷼︶᷼ ⢧᮫ִ𑂳🌑⡼ ᷼︶۪۪۪۪፝֟᷼︶᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼⏝۪۪۪۪۪۪۪۪᷼ᩘ͡⏝᷼

✨⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐝𝐞 𝐠𝐚𝐜𝐡𝐚 𝐩𝐚𝐫𝐚 𝐫𝐞𝐜𝐥𝐚𝐦𝐚𝐫 𝐲 𝐜𝐨𝐥𝐞𝐜𝐜𝐢𝐨𝐧𝐚𝐫 𝐩𝐞𝐫𝐬𝐨𝐧𝐚𝐣𝐞𝐬 🎭🌟⊹

̟ׄ🐟▒⃝᪶ᩙ᷼͠꜇ָ——  *#rollwaifu • #rw • #roll*
> ✦ Waifu o husbando aleatorio.
̟ׄ🐟▒⃝᪶ᩙ᷼͠꜇ָ——  *#claim • #c • #reclamar*
> ✦ Reclamar un personaje.
̟ׄ🐟▒⃝᪶ᩙ᷼͠꜇ָ——  *#harem • #waifus • #claims*
> ✦ Ver tus personajes reclamados.
̟ׄ🐟▒⃝᪶ᩙ᷼͠꜇ָ——  *#charimage • #waifuimage • #wimage*
> ✦ Ver una imagen aleatoria de un personaje.
̟ׄ🐟▒⃝᪶ᩙ᷼͠꜇ָ——  *#charinfo • #winfo • #waifuinfo*
> ✦ Ver información de un personaje.
̟ׄ🐟▒⃝᪶ᩙ᷼͠꜇ָ——  *#givechar • #givewaifu • #regalar*
> ✦ Regalar un personaje a otro usuario.
̟ׄ🐟▒⃝᪶ᩙ᷼͠꜇ָ——   ੈ₊˚༅༴│.ᰔᩚ *#vote • #votar*
> ✦ Votar por un personaje para subir su valor.
̟ׄ🐟▒⃝᪶ᩙ᷼͠꜇ָ——  *#waifusboard • #waifustop • #topwaifus*
> ✦ Ver el top de personajes con mayor valor.
ੈ₊˚༅༴╰────︶.︶ ⸙ ͛ ͎ ͛  ︶.︶ ੈ₊˚༅,

֪  ᷼⏜۪۪۪۪۪۪۪۪᷼ᩘ͡⏜᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼︵۪۪۪۪֟፝᷼︵᷼⡼🌑 𑂳᮫ִ͛⢧ ᷼︵۪۪۪۪፝֟᷼︵᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼⏜۪۪۪۪۪۪۪۪᷼ᩘ͡⏜᷼ 
╭☁️✿⃟⃢᭄͜═✩═『 𝚂𝚝𝚒𝚌𝚔𝚎𝚛𝚜 』═✩═⃟⃢᭄͜✿☁️
᷼⏝۪۪۪۪۪۪۪۪᷼ᩘ͡⏝᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼︶۪۪۪۪֟፝᷼︶᷼ ⢧᮫ִ𑂳🌑⡼ ᷼︶۪۪۪۪፝֟᷼︶᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼⏝۪۪۪۪۪۪۪۪᷼ᩘ͡⏝᷼

🖼️✨⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐩𝐚𝐫𝐚 𝐜𝐫𝐞𝐚𝐜𝐢𝐨𝐧𝐞𝐬 𝐝𝐞 𝐬𝐭𝐢𝐜𝐤𝐞𝐫𝐬, 𝐞𝐭𝐜. 🎨🔖

🏮 ⃞ּㅤ ᰩ 𑂳  ▢꯭֟፝▢   ׅ ੭ *#sticker • #s*
> ✦ Crea stickers de (imagen/video).
🏮 ⃞ּㅤ ᰩ 𑂳  ▢꯭֟፝▢   ׅ ੭ *#setmeta*
> ✦ Establece un pack y autor para los stickers.
🏮 ⃞ּㅤ ᰩ 𑂳  ▢꯭֟፝▢   ׅ ੭ *#delmeta*
> ✦ Elimina tu pack de stickers.
🏮 ⃞ּㅤ ᰩ 𑂳  ▢꯭֟፝▢   ׅ ੭ *#pfp • #getpic*
> ✦ Obtén la foto de perfil de un usuario.
🏮 ⃞ּㅤ ᰩ 𑂳  ▢꯭֟፝▢   ׅ ੭ *#stickergen#*
> ✦ te genera un sticker con ia con un promt.
🏮 ⃞ּㅤ ᰩ 𑂳  ▢꯭֟፝▢   ׅ ੭ *#qc*
> ✦ Crea stickers con texto o de un usuario.
🏮 ⃞ּㅤ ᰩ 𑂳  ▢꯭֟፝▢   ׅ ੭ *#toimg • #img*
> ✦ Convierte stickers en imagen.
🏮 ⃞ּㅤ ᰩ 𑂳  ▢꯭֟፝▢   ׅ ੭ *#brat • #ttp • #attp*︎
> ✦ Crea stickers con texto.
🏮 ⃞ּㅤ ᰩ 𑂳  ▢꯭֟፝▢   ׅ ੭ *#emojimix*
> ✦ Funciona 2 emojis para crear un sticker.
🏮 ⃞ּㅤ ᰩ 𑂳  ▢꯭֟፝▢   ׅ ੭ *#wm*
> ✦ Cambia el nombre de los stickers.
╰────︶.︶ ⸙ ͛ ͎ ͛  ︶.︶ ੈ₊˚༅,

֪  ᷼⏜۪۪۪۪۪۪۪۪᷼ᩘ͡⏜᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼︵۪۪۪۪֟፝᷼︵᷼⡼🌑 𑂳᮫ִ͛⢧ ᷼︵۪۪۪۪፝֟᷼︵᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼⏜۪۪۪۪۪۪۪۪᷼ᩘ͡⏜᷼ 
╭☁️✿⃟⃢᭄͜═✩═『  𝙷𝚎𝚛𝚛𝚊𝚖𝚒𝚎𝚗𝚝𝚊𝚜 』═✩═⃟⃢᭄͜✿☁️
᷼⏝۪۪۪۪۪۪۪۪᷼ᩘ͡⏝᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼︶۪۪۪۪֟፝᷼︶᷼ ⢧᮫ִ𑂳🌑⡼ ᷼︶۪۪۪۪፝֟᷼︶᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼⏝۪۪۪۪۪۪۪۪᷼ᩘ͡⏝᷼

🛠️✨⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐝𝐞 𝐡𝐞𝐫𝐫𝐚𝐦𝐢𝐞𝐧𝐭𝐚𝐬 𝐜𝐨𝐧 𝐦𝐮𝐜𝐡𝐚𝐬 𝐟𝐮𝐧𝐜𝐢𝐨𝐧𝐞𝐬 ⚙️

⢷ ꉹᩙ  ִ ▒🎠ᩬ᷒ᰰ⃞  ˄᪲ *#calcular • #calcular • #cal*  
> ✦ Calcular todo tipo de ecuaciones.
⢷ ꉹᩙ  ִ ▒🎡ᩬ᷒ᰰ⃞  ˄᪲ *#tiempo • #clima*  
> ✦ Ver el clima de un país.
⢷ ꉹᩙ  ִ ▒🎠ᩬ᷒ᰰ⃞  ˄᪲ *#horario*  
> ✦ Ver el horario global de los países.
⢷ ꉹᩙ  ִ ▒🎡ᩬ᷒ᰰ⃞  ˄᪲ *#fake • #fakereply*  
> ✦ Crea un mensaje falso de un usuario.
⢷ ꉹᩙ  ִ ▒🎡ᩬ᷒ᰰ⃞  ˄᪲ *#qrcode*  
> ✦ crea un QR al enlace o texto que escribas.
⢷ ꉹᩙ  ִ ▒🎡ᩬ᷒ᰰ⃞  ˄᪲ *#compress • comprimir*  
> ✦ comprime una imagen reduciendo su peso.
⢷ ꉹᩙ  ִ ▒🎠ᩬ᷒ᰰ⃞  ˄᪲ *#enhance • #remini • #hd*  
> ✦ Mejora la calidad de una imagen.
⢷ ꉹᩙ  ִ ▒🎡ᩬ᷒ᰰ⃞  ˄᪲ *#letra*  
> ✦ Cambia la fuente de las letras.
⢷ ꉹᩙ  ִ ▒🎠ᩬ᷒ᰰ⃞  ˄᪲ *#read • #readviewonce • #ver*  
> ✦ Ver imágenes de una sola vista.
⢷ ꉹᩙ  ִ ▒🎡ᩬ᷒ᰰ⃞  ˄᪲ *#whatmusic • #shazam*  
> ✦ Descubre el nombre de canciones o vídeos.
⢷ ꉹᩙ  ִ ▒🎠ᩬ᷒ᰰ⃞  ˄᪲ *#spamwa • #spam*  
> ✦ Envía spam a un usuario.
⢷ ꉹᩙ  ִ ▒🎡ᩬ᷒ᰰ⃞  ˄᪲ *#ss • #ssweb*  
> ✦ Ver el estado de una página web.
⢷ ꉹᩙ  ִ ▒🎠ᩬ᷒ᰰ⃞  ˄᪲ *#length • #tamaño*  
> ✦ Cambia el tamaño de imágenes y vídeos.
⢷ ꉹᩙ  ִ ▒🎡ᩬ᷒ᰰ⃞  ˄᪲ *#say • #decir* + [texto]  
> ✦ Repetir un mensaje.
⢷ ꉹᩙ  ִ ▒🎠ᩬ᷒ᰰ⃞  ˄᪲ *#todoc • #toducument*  
> ✦ Crea documentos de (audio, imágenes y vídeos).
⢷ ꉹᩙ  ִ ▒🎡ᩬ᷒ᰰ⃞  ˄᪲ *#translate • #traducir • #trad*  
> ✦ Traduce palabras en otros idiomas.
╰────︶.︶ ⸙ ͛ ͎ ͛  ︶.︶ ੈ₊˚༅,

֪  ᷼⏜۪۪۪۪۪۪۪۪᷼ᩘ͡⏜᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼︵۪۪۪۪֟፝᷼︵᷼⡼🌑 𑂳᮫ִ͛⢧ ᷼︵۪۪۪۪፝֟᷼︵᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼⏜۪۪۪۪۪۪۪۪᷼ᩘ͡⏜᷼ 
╭☁️✿⃟⃢᭄͜═✩═『 𝙿𝚎𝚛𝚏𝚒𝚕 』═✩═⃟⃢᭄͜✿☁️
᷼⏝۪۪۪۪۪۪۪۪᷼ᩘ͡⏝᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼︶۪۪۪۪֟፝᷼︶᷼ ⢧᮫ִ𑂳🌑⡼ ᷼︶۪۪۪۪፝֟᷼︶᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼⏝۪۪۪۪۪۪۪۪᷼ᩘ͡⏝᷼

🆔✨⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐝𝐞 𝐩𝐞𝐫𝐟𝐢𝐥 𝐩𝐚𝐫𝐚 𝐯𝐞𝐫, 𝐜𝐨𝐧𝐟𝐢𝐠𝐮𝐫𝐚𝐫 𝐲 𝐜𝐨𝐦𝐩𝐫𝐨𝐛𝐚𝐫 𝐞𝐬𝐭𝐚𝐝𝐨𝐬 𝐝𝐞 𝐭𝐮 𝐩𝐞𝐫𝐟𝐢𝐥 📇🔍

░ ⃝🌀ᩧ᳕ᬵ *#reg • #verificar • #register*
> ✦ Registra tu nombre y edad en el bot.
░ ⃝🌀ᩧ᳕ᬵ *#unreg*
> ✦ Elimina tu registro del bot.
░ ⃝🌀ᩧ᳕ᬵ *#profile*
> ✦ Muestra tu perfil de usuario.
░ ⃝🌀ᩧ᳕ᬵ *#marry* [mension / etiquetar]
> ✦ Propón matrimonio a otro usuario.
░ ⃝🌀ᩧ᳕ᬵ *#divorce*
> ✦ Divorciarte de tu pareja.
░ ⃝🌀ᩧ᳕ᬵ *#setgenre • #setgenero*
> ✦ Establece tu género en el perfil del bot.
░ ⃝🌀ᩧ᳕ᬵ *#delgenre • #delgenero*
> ✦ Elimina tu género del perfil del bot.
░ ⃝🌀ᩧ᳕ᬵ *#setbirth • #setnacimiento*
> ✦ Establece tu fecha de nacimiento en el perfil del bot.
░ ⃝🌀ᩧ᳕ᬵ *#delbirth • #delnacimiento*
> ✦ Elimina tu fecha de nacimiento del perfil del bot.
░ ⃝🌀ᩧ᳕ᬵ *#setdescription • #setdesc*
> ✦ Establece una descripción en tu perfil del bot.
░ ⃝🌀ᩧ᳕ᬵ *#deldescription • #deldesc*
> ✦ Elimina la descripción de tu perfil del bot.
░ ⃝🌀ᩧ᳕ᬵ *#lb • #lboard* + <Paginá>
> ✦ Top de usuarios con más (experiencia y nivel).
░ ⃝🌀ᩧ᳕ᬵ *#level • #lvl* + <@Mencion>
> ✦ Ver tu nivel y experiencia actual.
░ ⃝🌀ᩧ᳕ᬵ *#comprarpremium • #premium*
> ✦ Compra un pase premium para usar el bot sin límites.
░ ⃝🌀ᩧ᳕ᬵ *#confesiones • #confesar*
> ✦ Confiesa tus sentimientos a alguien de manera anonima.
╰────︶.︶ ⸙ ͛ ͎ ͛  ︶.︶ ੈ₊˚༅,

֪  ᷼⏜۪۪۪۪۪۪۪۪᷼ᩘ͡⏜᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼︵۪۪۪۪֟፝᷼︵᷼⡼🌑 𑂳᮫ִ͛⢧ ᷼︵۪۪۪۪፝֟᷼︵᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼⏜۪۪۪۪۪۪۪۪᷼ᩘ͡⏜᷼ 
╭☁️✿⃟⃢᭄͜═✩═『  𝙶𝚛𝚞𝚙𝚘𝚜 』═✩═⃟⃢᭄͜✿☁️
᷼⏝۪۪۪۪۪۪۪۪᷼ᩘ͡⏝᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼︶۪۪۪۪֟፝᷼︶᷼ ⢧᮫ִ𑂳🌑⡼ ᷼︶۪۪۪۪፝֟᷼︶᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼⏝۪۪۪۪۪۪۪۪᷼ᩘ͡⏝᷼

👥✨⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐝𝐞 𝐠𝐫𝐮𝐩𝐨𝐬 𝐩𝐚𝐫𝐚 𝐮𝐧𝐚 𝐦𝐞𝐣𝐨𝐫 𝐠𝐞𝐬𝐭𝐢𝐨́𝐧 𝐝𝐞 𝐞𝐥𝐥𝐨𝐬 🔧📢⊹

᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#config • #on*
> ✦ Ver opciones de configuración de grupos.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#hidetag*
> ✦ Envía un mensaje mencionando a todos los usuarios.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#gp • #infogrupo*
> ✦ Ver la información del grupo.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#linea • #listonline*
> ✦ Ver la lista de los usuarios en línea.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#setwelcome*
> ✦ Establecer un mensaje de bienvenida personalizado.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#setbye*
> ✦ Establecer un mensaje de despedida personalizado.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#link*
> ✦ El Bot envía el link del grupo.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#admins • #admin*
> ✦ Mencionar a los admins para solicitar ayuda.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#restablecer • #revoke*
> ✦ Restablecer el enlace del grupo.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#grupo • #group* [open / abrir]
> ✦ Cambia ajustes del grupo para que todos los usuarios envíen mensaje.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#grupo • #gruop* [close / cerrar]
> ✦ Cambia ajustes del grupo para que solo los administradores envíen mensaje.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#kick* [número / mención]
> ✦ Elimina un usuario de un grupo.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#add • #añadir • #agregar* [número]
> ✦ Invita a un usuario a tu grupo.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#promote* [mención / etiquetar]
> ✦ El Bot dará administrador al usuario mencionado.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#demote* [mención / etiquetar]
> ✦ El Bot quitará el rol de administrador al usuario mencionado.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#gpbanner • #groupimg*
> ✦ Cambiar la imagen del grupo.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#gpname • #groupname*
> ✦ Cambiar el nombre del grupo.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#gpdesc • #groupdesc*
> ✦ Cambiar la descripción del grupo.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#advertir • #warn • #warning*
> ✦ Dar una advertencia a un usuario.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#unwarn • #delwarn*
> ✦ Quitar advertencias.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#advlist • #listadv*
> ✦ Ver lista de usuarios advertidos.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#banchat*
> ✦ Banear al Bot en un chat o grupo.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#unbanchat*
> ✦ Desbanear al Bot del chat o grupo.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#mute* [mención / etiquetar]
> ✦ El Bot elimina los mensajes del usuario.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#unmute* [mención / etiquetar]
> ✦ El Bot deja de eliminar los mensajes del usuario.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#encuesta • #poll*
> ✦ Crea una encuesta.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#delete • #del*
> ✦ Elimina mensajes de otros usuarios.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#fantasmas*
> ✦ Ver lista de inactivos del grupo.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#kickfantasmas*
> ✦ Elimina a los inactivos del grupo.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#invocar • #tagall • #todos*
> ✦ Invoca a todos los usuarios del grupo.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#setemoji • #setemo*
> ✦ Cambia el emoji que se usa en la invitación de usuarios.
᪄🧛🏼‍♀️᮫ᮣᮭᮡᩪᩬᩧᩦᩥ᪃ ؉ ᩡᩡ *#listnum • #kicknum*
> ✦ Elimina a usuarios por el prefijo de país.
╰────︶.︶ ⸙ ͛ ͎ ͛  ︶.︶ ੈ₊˚༅,

֪  ᷼⏜۪۪۪۪۪۪۪۪᷼ᩘ͡⏜᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼︵۪۪۪۪֟፝᷼︵᷼⡼🌑 𑂳᮫ִ͛⢧ ᷼︵۪۪۪۪፝֟᷼︵᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼⏜۪۪۪۪۪۪۪۪᷼ᩘ͡⏜᷼ 
╭☁️✿⃟⃢᭄͜═✩═『  𝙰𝚗𝚒𝚖𝚎 』═✩═⃟⃢᭄͜✿☁️
᷼⏝۪۪۪۪۪۪۪۪᷼ᩘ͡⏝᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼︶۪۪۪۪֟፝᷼︶᷼ ⢧᮫ִ𑂳🌑⡼ ᷼︶۪۪۪۪፝֟᷼︶᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼⏝۪۪۪۪۪۪۪۪᷼ᩘ͡⏝᷼

🎌✨⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐝𝐞 𝐫𝐞𝐚𝐜𝐜𝐢𝐨𝐧𝐞𝐬 𝐝𝐞 𝐚𝐧𝐢𝐦𝐞 💢🎭⊹

𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#angry • #enojado* + <mencion>
> ✦ Estar enojado
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#bite* + <mencion>
> ✦ Muerde a alguien
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#bleh* + <mencion>
> ✦ Sacar la lengua
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#blush* + <mencion>
> ✦ Sonrojarte
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#bored • #aburrido* + <mencion>
> ✦ Estar aburrido
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#cry* + <mencion>
> ✦ Llorar por algo o alguien
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#cuddle* + <mencion>
> ✦ Acurrucarse
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#dance* + <mencion>
> ✦ Sacate los pasitos prohibidos
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#drunk* + <mencion>
> ✦ Estar borracho
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#eat • #comer* + <mencion>
> ✦ Comer algo delicioso
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#facepalm* + <mencion>
> ✦ Darte una palmada en la cara
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#happy • #feliz* + <mencion>
> ✦ Salta de felicidad
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#hug* + <mencion>
> ✦ Dar un abrazo
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#impregnate • #preg* + <mencion>
> ✦ Embarazar a alguien
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#kill* + <mencion>
> ✦ Toma tu arma y mata a alguien
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#kiss • #besar* • #kiss2 + <mencion>
> ✦ Dar un beso
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#laugh* + <mencion>
> ✦ Reírte de algo o alguien
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#lick* + <mencion>
> ✦ Lamer a alguien
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#love • #amor* + <mencion>
> ✦ Sentirse enamorado
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#pat* + <mencion>
> ✦ Acaricia a alguien
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#poke* + <mencion>
> ✦ Picar a alguien
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#pout* + <mencion>
> ✦ Hacer pucheros
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#punch* + <mencion>
> ✦ Dar un puñetazo
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#run* + <mencion>
> ✦ Correr
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#sad • #triste* + <mencion>
> ✦ Expresar tristeza
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#scared* + <mencion>
> ✦ Estar asustado
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#seduce* + <mencion>
> ✦ Seducir a alguien
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#shy • #timido* + <mencion>
> ✦ Sentir timidez
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#slap* + <mencion>
> ✦ Dar una bofetada
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#dias • #days*
> ✦ Darle los buenos días a alguien
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#fraseanime • #phraseanime*
> ✦ envía una frase aleatorio de un anime
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#noches • #nights*
> ✦ Darle las buenas noches a alguien
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#sleep* + <mencion>
> ✦ Tumbarte a dormir
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ *#smoke* + <mencion>
> ✦ Fumar
𓂃˛ׁ⁠  ✿𝆬ᩙ⃞𓈒࣭⛸️ᩚ *#think* + <mencion>
> ✦ Pensar en algo
╰────︶.︶ ⸙ ͛ ͎ ͛  ︶.︶ ੈ₊˚༅,

֪  ᷼⏜۪۪۪۪۪۪۪۪᷼ᩘ͡⏜᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼︵۪۪۪۪֟፝᷼︵᷼⡼🌑 𑂳᮫ִ͛⢧ ᷼︵۪۪۪۪፝֟᷼︵᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼⏜۪۪۪۪۪۪۪۪᷼ᩘ͡⏜᷼ 
╭☁️✿⃟⃢᭄͜═✩═『  𝙹𝚞𝚎𝚐𝚘𝚜 』═✩═⃟⃢᭄͜✿☁️
᷼⏝۪۪۪۪۪۪۪۪᷼ᩘ͡⏝᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼︶۪۪۪۪֟፝᷼︶᷼ ⢧᮫ִ𑂳🌑⡼ ᷼︶۪۪۪۪፝֟᷼︶᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼⏝۪۪۪۪۪۪۪۪᷼ᩘ͡⏝᷼

🎮✨⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐝𝐞 𝐣𝐮𝐞𝐠𝐨𝐬 𝐩𝐚𝐫𝐚 𝐣𝐮𝐠𝐚𝐫 𝐜𝐨𝐧 𝐭𝐮𝐬 𝐚𝐦𝐢𝐠𝐨𝐬 🕹️🎲⊹

ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#amistad • #amigorandom* 
> ✦ Hacer amigos con un juego.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#chaqueta • #jalamela*  
> ✦ Hacerte una chaqueta.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#chiste*  
> ✦ La bot te cuenta un chiste.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#consejo*  
> ✦ La bot te da un consejo.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#doxeo • #doxear* + <mención>  
> ✦ Simular un doxeo falso.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#facto*  
> ✦ La bot te lanza un facto.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#formarpareja*  
> ✦ Forma una pareja.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#formarpareja5*  
> ✦ Forma 5 parejas diferentes.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#frase*  
> ✦ La bot te da una frase.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#huevo*  
> ✦ Agárrale el huevo a alguien.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#chupalo* + <mención>  
> ✦ Hacer que un usuario te la chupe.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#aplauso* + <mención>  
> ✦ Aplaudirle a alguien.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#marron* + <mención>  
> ✦ Burlarte del color de piel de un usuario.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#suicidar*  
> ✦ Suicídate.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#iq • #iqtest* + <mención>  
> ✦ Calcular el IQ de alguna persona.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#meme*  
> ✦ La bot te envía un meme aleatorio.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#morse*  
> ✦ Convierte un texto a código morse.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#nombreninja*  
> ✦ Busca un nombre ninja aleatorio.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#paja • #pajeame*  
> ✦ La bot te hace una paja.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#personalidad* + <mención>  
> ✦ La bot busca tu personalidad.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#piropo*  
> ✦ Lanza un piropo.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#pregunta*  
> ✦ Hazle una pregunta a la bot.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#ship • #pareja*  
> ✦ La bot te da la probabilidad de enamorarte de una persona.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#sorteo*  
> ✦ Empieza un sorteo.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#top*  
> ✦ Empieza un top de personas.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#formartrio* + <mención>  
> ✦ Forma un trío.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#ahorcado*  
> ✦ Diviértete jugando al ahorcado con la bot.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#genio*  
> ✦ Comienza una ronda de preguntas con el genio.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#mates • #matematicas*  
> ✦ Responde preguntas de matemáticas para ganar recompensas.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#ppt*  
> ✦ Juega piedra, papel o tijeras con la bot.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#sopa • #buscarpalabra*  
> ✦ Juega al famoso juego de sopa de letras.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#pvp • #suit* + <mención>  
> ✦ Juega un PVP contra otro usuario.  
ᰵ𐇽𑂘⃘ׂ◌࠭᷼🪷⃝⃦̸̷᪶᪶ᩘ★ *#ttt*  
> ✦ Crea una sala de juego.  
╰────︶.︶ ⸙ ͛ ͎ ͛  ︶.︶ ੈ₊˚༅,

֪  ᷼⏜۪۪۪۪۪۪۪۪᷼ᩘ͡⏜᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼︵۪۪۪۪֟፝᷼︵᷼⡼🌑 𑂳᮫ִ͛⢧ ᷼︵۪۪۪۪፝֟᷼︵᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼⏜۪۪۪۪۪۪۪۪᷼ᩘ͡⏜᷼ 
╭☁️✿⃟⃢᭄͜═✩═『  𝙽𝚂𝙵𝚆 』═✩═⃟⃢᭄͜✿☁️
᷼⏝۪۪۪۪۪۪۪۪᷼ᩘ͡⏝᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼︶۪۪۪۪֟፝᷼︶᷼ ⢧᮫ִ𑂳🌑⡼ ᷼︶۪۪۪۪፝֟᷼︶᷼ ᗣּ𝅼ᜓ᮫ְֺ๋ᨘ̤̤ᨗ݃ٚ۫ ᷼⏝۪۪۪۪۪۪۪۪᷼ᩘ͡⏝᷼

🔞✨⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐍𝐒𝐅𝐖 (𝐂𝐨𝐧𝐭𝐞𝐧𝐢𝐝𝐨 𝐩𝐚𝐫𝐚 𝐚𝐝𝐮𝐥𝐭𝐨𝐬) 🍑🔥⊹

★꙲⃝͟🔞 *#anal* + <mencion>
> ✦ Hacer un anal
★꙲⃝͟🔞 *#waifu*
> ✦ Buscá una waifu aleatorio.
★꙲⃝͟🔞 *#bath* + <mencion>
> ✦ Bañarse
★꙲⃝͟🔞 *#blowjob • #mamada • #bj* + <mencion>
> ✦ Dar una mamada
★꙲⃝͟🔞 *#boobjob* + <mencion>
> ✦ Hacer una rusa
★꙲⃝͟🔞 *#cum* + <mencion>
> ✦ Venirse en alguien.
★꙲⃝͟🔞 *#fap* + <mencion>
> ✦ Hacerse una paja
★꙲⃝͟🔞 *#ppcouple • #ppcp*
> ✦ Genera imágenes para amistades o parejas.
★꙲⃝͟🔞 *#footjob* + <mencion>
> ✦ Hacer una paja con los pies
★꙲⃝͟🔞 *#fuck • #coger • #fuck2* + <mencion>
> ✦ Follarte a alguien
★꙲⃝͟🔞 *#hentaivideo • #hentaivid*
> ✦ envía un vídeo hentai aleatorio
★꙲⃝͟🔞 *#cafe • #coffe*
> ✦ Tomate un cafecito con alguien
★꙲⃝͟🔞 *#violar • #perra* + <mencion>
> ✦ Viola a alguien
★꙲⃝͟🔞 *#grabboobs* + <mencion>
> ✦ Agarrar tetas
★꙲⃝͟🔞 *#grop* + <mencion>
> ✦ Manosear a alguien
★꙲⃝͟🔞 *#lickpussy* + <mencion>
> ✦ Lamer un coño
★꙲⃝͟🔞 *#rule34 • #r34* + [Tags]
> ✦ Buscar imágenes en Rule34
★꙲⃝͟🔞 *#sixnine • #69* + <mencion>
> ✦ Haz un 69 con alguien
★꙲⃝͟🔞 *#spank • #nalgada* + <mencion>
> ✦ Dar una nalgada
★꙲⃝͟🔞 *#suckboobs* + <mencion>
> ✦ Chupar tetas
★꙲⃝͟🔞 *#undress • #encuerar* + <mencion>
> ✦ Desnudar a alguien
★꙲⃝͟🔞 *#yuri • #tijeras* + <mencion>
> ✦ Hacer tijeras.
╰────︶.︶ ⸙ ͛ ͎ ͛  ︶.︶ ੈ₊˚༅,
  `.trim();

    // Mensaje de inicio de envío del menú
    await conn.reply(m.chat, '*ꪹ͜𓂃⌛͡𝗘𝗻𝘃𝗶𝗮𝗻𝗱𝗼 𝗠𝗲𝗻𝘂 𝗱𝗲𝗹 𝗕𝗼𝘁....𓏲੭*', fkontak, { 
        contextInfo: { 
            forwardingScore: 2022, 
            isForwarded: true, 
            externalAdReply: {
                title: packname,
                body: '¡explora la gran variedad de comandos!',
                sourceUrl: redes,
                thumbnail: icons 
            }
        }
    });

    await m.react('💖');

    // Enviar el video GIF con el texto en un solo mensaje
    await conn.sendMessage(m.chat, { 
        video: { url: randomGif },
        caption: txt,
        gifPlayback: true, // Hace que el video se vea como GIF
        contextInfo: {
            mentionedJid: [m.sender, userId],
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363335626706839@newsletter',
                newsletterName: '⏤͟͞ू⃪፝͜⁞⟡『 𝐓͢ᴇ𝙖፝ᴍ⃨ 𝘾𝒉꯭𝐚𝑛𝑛𝒆𝑙: 𝑹ᴜ⃜ɓ𝑦-𝑯ᴏ𝒔𝑯𝙞꯭𝑛𝒐 』࿐⟡',
                serverMessageId: -1,
            },
            externalAdReply: {
                title: 'ׄ❀ׅᮢ໋۬۟   ׁ ᮫᩠𝗥ᥙ᜔᪲𝖻ֹ𝘺 𝐇֢ᩚᨵ̷̸ׁׅׅ𝗌𝗁𝗂ᮬ𝗇֟፝͡𝗈̷̸  ꫶֡ᰵ࡙🌸̵໋ׄᮬ͜✿֪',
                body: dev,
                thumbnail: icons,
                sourceUrl: redes,
                mediaType: 1,
                renderLargerThumbnail: false,
            }
        }
    }, { quoted: m });

};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = ['menu', 'menú', 'help'];

export default handler;

function clockString(ms) {
    let seconds = Math.floor((ms / 1000) % 60);
    let minutes = Math.floor((ms / (1000 * 60)) % 60);
    let hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    return `${hours}h ${minutes}m ${seconds}s`;
}