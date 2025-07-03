let handler = async (m, { conn }) => {
    const chars = await loadCharacters();
    const market = await loadMarket();

    if (market.length === 0) return m.reply('✿ No hay waifus en venta actualmente.');

    let txt = `◢✿ *Waifus en Venta* ✿◤\n\n`;
    for (let venta of market.slice(0, 10)) {
        const waifu = chars.find(c => c.id === venta.characterId);
        if (!waifu) continue;
        const name = waifu.name;
        const id = waifu.id;
        txt += `✰ *${name}*\n`;
        txt += `  • ID: *${id}*\n`;
        txt += `  • Precio: *¥${venta.price.toLocaleString()} ${moneda}*\n\n`;
    }
    return m.reply(txt.trim());
};

handler.help = ['waifusenventa'];
handler.command = ['waifusenventa', 'waifusmarket'];
handler.group = true;
export default handler;
