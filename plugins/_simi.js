import fs from 'fs'
import path from 'path'
import vm from 'vm'

let handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) return m.reply(`✐ Debes especificar el nombre del archivo (sin .js)\n\nEjemplo:\n${usedPrefix + command} main-menu`)
  let fileName = args[0].replace(/\.js$/i, '') + '.js'
  let filePath = path.join('plugins', fileName)
  if (!fs.existsSync(filePath)) return m.reply(`✐ No existe el archivo plugins/${fileName}`)
  let code = fs.readFileSync(filePath, 'utf-8')
  try {
    // Verifica sintaxis sin ejecutar (usa vm.Script)
    new vm.Script(code, { filename: filePath })
    m.reply(`✅ El archivo plugins/${fileName} **NO tiene errores de sintaxis.**`)
  } catch (e) {
    m.reply(`❌ Error de sintaxis en plugins/${fileName}:\n\n${e.name}: ${e.message}\n\nLínea: ${e.lineNumber || e.stack}`)
  }
}
handler.help = ['sintaxis <archivo>']
handler.tags = ['herramientas']
handler.command = ['sintaxis']
handler.register = true

export default handler