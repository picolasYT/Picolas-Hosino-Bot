let handler = async (m, { conn, args, participants }) => {
    const users = Object.entries(global.db.data.users).map(([key, value]) => {
        return { ...value, jid: key };
    });

    const sortedLim = users.sort((a, b) => {
        const totalA = (a.coin || 0) + (a.bank || 0);
        const totalB = (b.coin || 0) + (b.bank || 0);
        return totalB - totalA;
    });

    const len = args[0] && !isNaN(args[0]) ? Math.min(10, Math.max(parseInt(args[0]), 1)) : Math.min(10, sortedLim.length);

    let text = `「💰」Los usuarios con más *¥${moneda}* son:\n\n`;

    for (let i = 0; i < len; i++) {
        const { jid, coin, bank } = sortedLim[i];
        const total = (coin || 0) + (bank || 0);
        const name = await conn.getName(jid); // Nombre de WhatsApp del usuario

        text += `✰ ${i + 1} » *${name}*\n`;
        text += `   wa.me/${jid.split('@')[0]}\n`;
        text += `   Total → *¥${total} ${moneda}*\n\n`;
    }

    await conn.reply(m.chat, text.trim(), m, {
        mentions: sortedLim.slice(0, len).map(u => u.jid)
    });
};

handler.help = ['baltop'];
handler.tags = ['rpg'];
handler.command = ['baltop', 'eboard'];
handler.group = true;
handler.register = true;
handler.fail = null;
handler.exp = 0;

export default handler;