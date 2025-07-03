let handler = async (m, { conn, args }) => {
    const id = args[0];
    if (!id) return m.reply('✿ Debes ingresar el ID de la waifu que deseas comprar.');

    const chars = await loadCharacters();
    const market = await loadMarket();
    const user = global.db.data.users[m.sender];

    const waifu = chars.find(c => c.id === id);
    const venta = market.find(e => e.characterId === id);
    if (!waifu || !venta) return m.reply('✿ Waifu no encontrada o no está en venta.');

    if (user.coin < venta.price) return m.reply(`✿ No tienes suficiente dinero. Necesitas *¥${venta.price.toLocaleString()} ${moneda}*.`);

    // Transacción
    user.coin -= venta.price;
    const seller = global.db.data.users[venta.seller];
    seller.coin = (seller.coin || 0) + venta.price;

    // Cambiar dueño
    waifu.user = m.sender;
    await saveCharacters(chars);

    // Eliminar del mercado
    const index = market.indexOf(venta);
    market.splice(index, 1);
    await saveMarket(market);

    // Notificar al vendedor
    await conn.sendMessage(venta.seller, {
        text: `✿ Tu waifu *${waifu.name}* fue vendida por *¥${venta.price.toLocaleString()} ${moneda}*!`
    });

    return m.reply(`✿ Compraste a *${waifu.name}* exitosamente.`);
};

handler.help = ['comprarwaifu <id>'];
handler.command = ['comprarwaifu'];
handler.group = true;
export default handler;
