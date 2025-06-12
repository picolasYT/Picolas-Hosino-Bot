let handler = async (m, { conn, command, usedPrefix }) => {
let img = './src/catalogo.jpg'
let staff = `ᥫ᭡ *EQUIPO DE AYUDANTES* ❀
✰ *Dueño* Dioneibi-rip
✦ *Bot:* ׄ❀ׅᮢ໋۬۟   ׁ ᮫᩠𝗥ᥙ᜔᪲𝖻ֹ𝘺 𝐇֢ᩚᨵ̷̸ׁׅׅ𝗌𝗁𝗂ᮬ𝗇֟፝͡𝗈̷̸  ꫶֡ᰵ࡙🌸̵໋ׄᮬ͜✿֪
⚘ *Versión:* ${vs}
❖ *Libreria:* ${libreria} ${baileys}
> ✧ GitHub » https://github.com/Dioneibi-rip

✰ *Colaborador 1*: Nevi 
✦ *Rol*: Ayudante y desarrollador. 
> ✧ Github »

✰ *Colaborador 2*: Legna 
✦ *Rol*: Soporte/ayudante,editor.
> ✧ Github »
`
await conn.sendFile(m.chat, img, 'yuki.jpg', staff.trim(), m)
}
  
handler.help = ['staff']
handler.command = ['colaboradores', 'staff']
handler.register = true
handler.tags = ['main']

export default handler
