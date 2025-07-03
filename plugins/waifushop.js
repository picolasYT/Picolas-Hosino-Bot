import { promises as fs } from 'fs';

const charactersFile = './src/database/characters.json';
const waifusEnVentaFile = './src/database/waifusVenta.json';

async function loadCharacters() {
    const data = await fs.readFile(charactersFile, 'utf-8');
    return JSON.parse(data);
}
async function saveCharacters(characters) {
    await fs.writeFile(charactersFile, JSON.stringify(characters, null, 2));
}
async function loadVentas() {
    try {
        const data = await fs.readFile(waifusEnVentaFile, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}
async function saveVentas(ventas) {
    await fs.writeFile(waifusEnVentaFile, JSON.stringify(ventas, null, 2));
}

let handler = async (m, { args, conn }) => {
    const userId = m.sender;
    const precio = parseInt(args[1] || args[0]);

    if (!precio || isNaN(precio) || precio < 1) {
        return m.reply('✧ Ingresa un precio válido.\n> Ejemplo: *#venderwaifu 25000* o *#venderwaifu Miku 50000*');
    }

    const characters = await loadCharacters();
    const ventas = await loadVentas();
    let personaje = null;

    if (m.quoted?.text) {
        const idMatch = m.quoted.text.match(/𝙄𝘿:\s*\*([^\*]+)\*/i);
        if (!idMatch) return m.reply('✧ No se pudo encontrar el ID del personaje citado.');
        const id = idMatch[1].trim();
        personaje = characters.find(c => c.id === id);
    } else if (args.length >= 2) {
        const nombre = args.slice(0, -1).join(' ').toLowerCase();
        personaje = characters.find(c => c.name.toLowerCase() === nombre);
    }

    if (!personaje) return m.reply('✧ Personaje no encontrado.');
    if (personaje.user !== userId) return m.reply('✧ Esta waifu no te pertenece.');

    personaje.enVenta = true;
    personaje.precioVenta = precio;

    ventas.push({
        id: personaje.id,
        name: personaje.name,
        precio: precio,
        vendedor: userId,
        fecha: Date.now()
    });

    await saveCharacters(characters);
    await saveVentas(ventas);

    m.reply(`✿ Has puesto en venta a *${personaje.name}* por *¥${precio.toLocaleString()} ᴅᴀʀᴋᴏs*.`);
};

handler.help = ['venderwaifu'];
handler.tags = ['waifus'];
handler.command = ['venderwaifu'];
handler.group = true;
handler.register = true;

export default handler;
