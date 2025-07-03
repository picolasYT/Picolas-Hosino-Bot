import { promises as fs } from 'fs';
const charPath = './src/database/characters.json';
const marketPath = './src/database/waifu_market.json';

async function loadCharacters() {
    const data = await fs.readFile(charPath, 'utf-8');
    return JSON.parse(data);
}

async function saveCharacters(data) {
    await fs.writeFile(charPath, JSON.stringify(data, null, 2));
}

async function loadMarket() {
    try {
        const data = await fs.readFile(marketPath, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

async function saveMarket(data) {
    await fs.writeFile(marketPath, JSON.stringify(data, null, 2));
}

let handler = async (m, { conn, args }) => {
    if (!m.quoted || !args[0]) return m.reply('✿ Debes citar una waifu y especificar el precio. Ej: *#venderwaifu 20000*');
    const price = parseInt(args[0]);
    if (isNaN(price) || price <= 0) return m.reply('✿ Precio inválido.');

    const chars = await loadCharacters();
    const market = await loadMarket();
    const idMatch = m.quoted.text.match(/ID:\s*\*([^\*]+)\*/i);
    if (!idMatch) return m.reply('✿ No se encontró el ID en el mensaje citado.');

    const id = idMatch[1].trim();
    const waifu = chars.find(c => c.id === id);
    if (!waifu || waifu.user !== m.sender) return m.reply('✿ No puedes vender una waifu que no es tuya.');

    if (market.find(e => e.characterId === id)) return m.reply('✿ Esa waifu ya está en venta.');

    market.push({ characterId: id, seller: m.sender, price });
    await saveMarket(market);

    return m.reply(`✿ Has puesto en venta a *${waifu.name}* por *¥${price.toLocaleString()} ${moneda}*`);
};

handler.help = ['venderwaifu <precio>'];
handler.command = ['venderwaifu'];
handler.group = true;
export default handler;
