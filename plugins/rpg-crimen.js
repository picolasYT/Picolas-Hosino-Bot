let cooldowns = {};
let jail = {};

const handler = async (m, { conn }) => {
    let users = global.db.data.users;
    let senderId = m.sender;
    const premiumBenefit = users[senderId].premium ? 0.8 : 1.0; // 20% menos de probabilidad de ir a la cárcel si es premium
    const cooldown = 5 * 60 * 1000;
    const jailCooldown = 30 * 60 * 1000; // 30 minutos de cárcel

    if (jail[senderId] && Date.now() < jail[senderId]) {
        const remaining = segundosAHMS(Math.ceil((jail[senderId] - Date.now()) / 1000));
        return m.reply(`🚔 Estás tras las rejas. No dejes caer el jabón. Te quedan *${remaining}*.`);
    }

    if (cooldowns[senderId] && Date.now() - cooldowns[senderId] < cooldown) {
        const remaining = segundosAHMS(Math.ceil((cooldowns[senderId] + cooldown - Date.now()) / 1000));
        return m.reply(`⏱️ La policía todavía está buscando pistas. Espera *${remaining}* para volver a delinquir.`);
    }

    const outcome = Math.random();
    const jailChance = 0.15 * premiumBenefit; // 15% de ir a la cárcel (12% para premium)
    const successChance = 0.60; // 60% de éxito

    if (outcome < jailChance) {
        jail[senderId] = Date.now() + jailCooldown;
        const reason = pickRandom(frasesPolicia);
        return m.reply(`🚓 ${reason}. Estás en la cárcel por 30 minutos.`);
    } else if (outcome < jailChance + successChance) {
        const amount = Math.floor(Math.random() * 15000 + 5000);
        users[senderId].coin += amount;
        const reason = pickRandom(frasesExito);
        await m.reply(`💰 ${reason} y te embolsaste *¥${amount.toLocaleString()} ${moneda}*.\n> Tu saldo: *¥${users[senderId].coin.toLocaleString()}*.`);
    } else {
        const amount = Math.floor(Math.random() * 25000 + 10000); // Pérdidas muy altas
        users[senderId].coin = Math.max(0, users[senderId].coin - amount);
        const reason = pickRandom(frasesFracaso);
        await m.reply(`💀 ${reason} y perdiste *¥${amount.toLocaleString()} ${moneda}* en el proceso.\n> Te quedaste con: *¥${users[senderId].coin.toLocaleString()}*.`);
    }

    cooldowns[senderId] = Date.now();
};

handler.help = ['crimen'];
handler.tags = ['economy'];
handler.command = ['crimen', 'crime'];
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

const frasesExito = [
    "Asaltaste un camión de Brinks con una pistola de agua",
    "Le vendiste un riñón falso a un miembro del cartel",
    "Hackeaste la cuenta de Twitch de un streamer famoso y te donaste todo",
    "Robaste el catalizador de la patrulla de policía del barrio",
    "Creaste un NFT de un mono con pito y un idiota lo compró",
    "Secuestraste al perro de un influencer y pediste rescate en Bitcoin",
    "Le robaste la dentadura de oro a tu abuela mientras dormía",
    "Pusiste un puesto de vacunas falsas contra el COVID",
    "Clonaste la tarjeta de un político y la usaste en un casino online",
    "Vendiste secretos de estado a los rusos a cambio de vodka y dinero",
    "Robaste un cargamento de PlayStation 5 y los revendiste al triple",
    "Te hiciste pasar por un príncipe nigeriano y estafaste a varios gringos",
    "Chantajeaste a un cura con fotos comprometedoras",
    "Robaste una colección de cartas de Pokémon valorada en miles",
    "Descubriste un bug en el sistema bancario y te transferiste fondos"
];

const frasesFracaso = [
    "Descubrieron que hacías evasión de impuestos",
    "Intentaste robar un banco pero era domingo y estaba cerrado",
    "Te tropezaste con tus propios pies mientras huías y te rompiste la cara",
    "Le intentaste robar a una viejita pero te molió a palos con su bastón",
    "Tu cómplice te delató a cambio de una condena reducida",
    "Te quedaste atrapado en la chimenea intentando robar una casa en Navidad",
    "Publicaste tu crimen en tus historias de Instagram por accidente",
    "La policía te rastreó porque usaste tu tarjeta de crédito para comprar el pasamontañas",
    "Intentaste hackear el Pentágono con un tutorial de YouTube",
    "Te explotó la bomba de tinta del dinero en toda la ropa",
    "Te diste a la fuga en un monociclo y no llegaste muy lejos",
    "Te delató el perico de la víctima, que no paraba de repetir tu nombre",
    "Te gastaste todo el botín en skins del Fortnite",
    "Te atraparon porque dejaste tu DNI en la escena del crimen",
    "Te tatuaste el plan del robo en la espalda y tu compañero te tomó una foto"
];

const frasesPolicia = [
    "Te atraparon porque tu mamá le dijo a la policía dónde te escondías",
    "Un dron de la policía te siguió desde el aire hasta tu casa",
    "Te identificaron por el olor a culo que dejaste en la escena",
    "Te quedaste dormido en el coche de la huida",
    "Intentaste sobornar al policía con 10 dólares y se ofendió",
    "Te encontraron escondido en un contenedor de basura porque roncabas muy fuerte",
    "Te delató tu ex-novia, que todavía tenía tu ubicación en tiempo real",
    "La policía analizó el ADN de un moco que dejaste pegado"
];