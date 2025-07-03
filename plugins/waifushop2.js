import { promises as fs } from 'fs'

const waifusEnVentaFile = './src/database/waifusVenta.json'

async function loadVentas() {
    try {
        const data = await fs.readFile(waifusEnVentaFile, 'utf-8')
        return JSON.parse(data)
    } catch {
        return []
    }
}

let handler = async (m, { conn, args }) => {
    const ventas = await loadVentas()
    if (!ventas.length) {
        return m.reply('✧ No hay waifus en venta actualmente.')
    }

    // Paginación
    const page = args[0] ? parseInt(args[0]) : 1
    const pageSize = 10
    const totalPages = Math.ceil(ventas.length / pageSize)
    if (page < 1 || page > totalPages) {
        return m.reply(`✧ Página inválida. Solo hay *${totalPages}* página(s).`)
    }

    const inicio = (page - 1) * pageSize
    const fin = inicio + pageSize
    const waifusPagina = ventas.slice(inicio, fin)

    let texto = `◢✿ *Waifus en venta* ✿◤\n\n`
    waifusPagina.forEach((waifu, index) => {
        const i = inicio + index + 1
        texto += `✰ ${i} » *${waifu.name}*\n`
        texto += `  🛒 Precio: *¥${waifu.precio.toLocaleString()} ᴅᴀʀᴋᴏs*\n`
        texto += `  👤 Vendedor: @${waifu.vendedor.split('@')[0]}\n\n`
    })

    texto += `> Página *${page}* de *${totalPages}*\n`
    texto += `> Para ver otra página usa: *#waifusventa 2*`

    conn.reply(m.chat, texto.trim(), m, {
        mentions: waifusPagina.map(w => w.vendedor)
    })
}

handler.help = ['waifusventa [página]']
handler.tags = ['waifus']
handler.command = ['waifusenventa', 'waifusventa', 'ventasw]()
