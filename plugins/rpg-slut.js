let cooldowns = {};

const handler = async (m, { conn }) => {
    const users = global.db.data.users;
    const senderId = m.sender;
    const premiumBenefit = users[senderId].premium ? 1.30 : 1.0;
    const cooldown = 5 * 60 * 1000;

    if (cooldowns[senderId] && Date.now() - cooldowns[senderId] < cooldown) {
        const remaining = segundosAHMS(Math.ceil((cooldowns[senderId] + cooldown - Date.now()) / 1000));
        return m.reply(`🥵 Necesitas recuperar el aliento. Vuelve a la esquina en *${remaining}*.`);
    }

    const winChance = 0.65;
    const didWin = Math.random() < winChance;
    
    let targetId = Object.keys(users).filter(u => u !== senderId && !users[u].banned)[Math.floor(Math.random() * (Object.keys(users).length - 1))];

    if (didWin) {
        const amount = Math.floor((Math.random() * 10000 + 4000) * premiumBenefit);
        users[senderId].coin += amount;
        const phrase = pickRandom(frasesGanancia).replace('@usuario', `@${targetId.split('@')[0]}`);
        await conn.sendMessage(m.chat, {
            text: `✨ ${phrase} y ganaste *¥${amount.toLocaleString()} ${moneda}*.\n> Tu nuevo saldo es *¥${users[senderId].coin.toLocaleString()}*`,
            contextInfo: { mentionedJid: [targetId] }
        }, { quoted: m });
    } else {
        const amount = Math.floor(Math.random() * 18000 + 8000); // Pérdidas altas
        users[senderId].coin = Math.max(0, users[senderId].coin - amount);
        const phrase = pickRandom(frasesPerdida);
        await conn.reply(m.chat, `💔 ${phrase} y perdiste la terrible suma de *¥${amount.toLocaleString()} ${moneda}*.\n> Te quedaste con *¥${users[senderId].coin.toLocaleString()}*.`, m);
    }

    cooldowns[senderId] = Date.now();
};

handler.help = ['slut'];
handler.tags = ['economy'];
handler.command = ['slut', 'prostituirse'];
handler.group = true;
handler.register = true;

export default handler;

function segundosAHMS(segundos) {
    let minutos = Math.floor(segundos / 60);
    let segundosRestantes = segundos % 60;
    return `${minutos}m ${segundosRestantes}s`;
}

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

const frasesGanancia = [
    "Le hiciste un baile erótico a @usuario en Discord",
    "Un viejo millonario te pagó solo por escuchar sus historias tristes",
    "Te contrataron para una fiesta swinger y fuiste la estrella de la noche",
    "Le sobaste el pito a un cliente habitual",
    "Vendiste un frasco con el agua de tu baño",
    "Fuiste el sumiso personal de @usuario por una noche",
    "Te pagaron por gemir como personaje de anime en un audio de WhatsApp",
    "Un grupo de empresarios te usó como cenicero humano",
    "Te vistieron de colegiala y te llevaron a un restaurante de lujo",
    "Grabaste un ASMR lamiendo un micrófono",
    "Hiciste un cosplay de Astolfo y los simps te llenaron de dinero",
    "Te pagaron extra por dejar que te olieran los pies",
    "Participaste en una orgía con temática de superhéroes",
    "Un programador te pagó para que le pisaras los huevos mientras codificaba",
    "Fuiste a una convención y cobraste por abrazos 'con sorpresa'"
];

const frasesPerdida = [
    "Un negro te la metió tan fuerte que tuviste que pagar una reconstrucción anal",
    "Te contagiaste de herpes y gastaste todo en medicamentos",
    "El cliente se fue sin pagar y además te robó el celular",
    "Te arrestaron en una redada y tuviste que pagar una fianza carísima",
    "Te enamoraste del cliente y terminaste pagándole tú a él",
    "Te confundieron con un travesti de la competencia y te dieron una paliza",
    "El cliente resultó ser tu tío y te desheredó",
    "Te quedaste atorado en una posición y tuvieron que llamar a los bomberos; la multa fue enorme",
    "Rompiste la cama del motel y te la cobraron al triple",
    "El cliente te pagó con criptomonedas que se desplomaron al instante",
    "Te dio una reacción alérgica al lubricante barato",
    "Te grabaron sin tu consentimiento y ahora eres un meme en internet; perdiste toda dignidad",
    "Intentaste hacer una pose exótica y te desgarraste un músculo",
    "Te robaron los riñones después de una cita a ciegas",
    "El cliente murió de un infarto en pleno acto y su familia te demandó"
];