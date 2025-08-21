const handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender];
    text = text.toLowerCase().trim();

    const plans = {
        'dia': { duration: 1, cost: 50000 },
        'semana': { duration: 7, cost: 250000 }, // Ahorro del 28%
        'mes': { duration: 30, cost: 750000 }, // Ahorro del 50%
    };

    if (!text || !plans[text]) {
        let response = `🎟️ *Planes Premium Disponibles* 🎟️\n\n`;
        for (const plan in plans) {
            response += `› *${plan.charAt(0).toUpperCase() + plan.slice(1)}* (${plans[plan].duration} día(s))\n`;
            response += `  Costo: *¥${plans[plan].cost.toLocaleString()} ${moneda}*\n\n`;
        }
        response += `*Ejemplo de uso:*\n${usedPrefix + command} semana`;
        return conn.reply(m.chat, response, m);
    }

    const selectedPlan = plans[text];

    if (user.coin < selectedPlan.cost) {
        return conn.reply(m.chat, `❌ No tienes suficiente ${moneda} para este plan. Necesitas *¥${selectedPlan.cost.toLocaleString()}* y solo tienes *¥${user.coin.toLocaleString()}*.`, m);
    }

    user.coin -= selectedPlan.cost;
    user.premium = true;
    
    const newPremiumTime = (user.premiumTime > 0 ? user.premiumTime : Date.now()) + (selectedPlan.duration * 24 * 60 * 60 * 1000);
    user.premiumTime = newPremiumTime;

    const remainingTime = newPremiumTime - Date.now();
    const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    conn.reply(m.chat, `✅ ¡Felicidades! Has comprado el plan *Premium ${text}*.\n\nDisfrutarás de beneficios exclusivos.\n*Tiempo total restante:* ${days} días y ${hours} horas.`, m);
};

handler.help = ['comprarpremium [plan]'];
handler.tags = ['premium'];
handler.command = ['comprarpremium', 'premium', 'vip'];
handler.register = true;

export default handler;
