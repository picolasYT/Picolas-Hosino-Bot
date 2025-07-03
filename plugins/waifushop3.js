let handler = async (m, { args }) => {
    const id = args[0];
    if (!id) return m.reply('✿ Debes ingresar el ID de la waifu que deseas remover del mercado.');

    const market = await loadMarket();
    const venta = market.find(e => e.characterId === id);
    if (!venta) return m.reply('✿ Esa waifu no está en venta.');

    if (venta.seller !== m.sender) return m.reply('✿ Solo el dueño puede cancelar la venta.');

    const index = market.indexOf(venta);
    market.splice(index, 1);
    await saveMarket(market);

    return m.reply('✿ Has removido la waifu del mercado exitosamente.');
};

handler.help = ['cancelarventa <id>'];
handler.command = ['cancelarventa'];
handler.group = true;
export default handler;
