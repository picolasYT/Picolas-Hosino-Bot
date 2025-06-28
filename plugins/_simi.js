import fs from 'fs'
import path from 'path'
import acorn from 'acorn'
import * as walk from 'acorn-walk'

const PLUGINS_DIR = './plugins'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`✐ Especifica el nombre del archivo (sin .js)\nEjemplo:\n${usedPrefix + command} autoresponder`)
  }
  let fileName = args[0].replace(/\.js$/i, '') + '.js'
  let filePath = path.join(PLUGINS_DIR, fileName)
  if (!fs.existsSync(filePath)) {
    return m.reply(`✐ No existe el archivo plugins/${fileName}`)
  }

  let code = fs.readFileSync(filePath, 'utf-8')
  let response = `📥 *Revisión de Syntax y Dependencias para:* \`${fileName}\`\n\n`
  let hasError = false
  let externalGlobals = new Set()
  let undefinedGlobals = []
  let missingImports = []

  // 1. SINTAXIS
  let ast
  try {
    ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module' })
  } catch (e) {
    return m.reply(`❌ *Error de sintaxis en* \`${fileName}\`:\n\n${e.message}\nLínea: ${e.loc?.line || e.lineNumber || 'desconocida'}`)
  }

  // 2. BUSCA REQUERIMIENTOS EXTERNOS/IMPORTS
  walk.simple(ast, {
    ImportDeclaration(node) {
      // import ... from '...'
      let mod = node.source.value
      if (!mod.startsWith('.') && !mod.startsWith('/')) return // skip node, fs, etc
      let importPath = path.resolve(PLUGINS_DIR, path.dirname(fileName), mod)
      if (!fs.existsSync(importPath) && !fs.existsSync(importPath + '.js')) {
        missingImports.push(mod)
      }
    },
    CallExpression(node) {
      // require('...')
      if (node.callee?.name === 'require' && node.arguments?.length) {
        let mod = node.arguments[0].value
        if (!mod) return
        if (!mod.startsWith('.') && !mod.startsWith('/')) return // skip core modules
        let importPath = path.resolve(PLUGINS_DIR, path.dirname(fileName), mod)
        if (!fs.existsSync(importPath) && !fs.existsSync(importPath + '.js')) {
          missingImports.push(mod)
        }
      }
    }
  })

  // 3. BUSCA VARIABLES/FUNCIONES GLOBALES USADAS (ejemplo: global.foo, m.react, conn.reply, etc)
  walk.simple(ast, {
    MemberExpression(node) {
      // global.foo, conn.reply, etc
      if (
        node.object?.name === 'global' &&
        node.property?.name &&
        typeof node.property.name === 'string'
      ) {
        externalGlobals.add(node.property.name)
      }
    },
    Identifier(node, state, ancestors) {
      // Detecta uso de m, conn, etc fuera de declaración
      if (
        ['m', 'conn', 'global'].includes(node.name) && // puedes agregar más
        !ancestors.some(a => a.type === 'VariableDeclarator' && a.id.name === node.name)
      ) {
        externalGlobals.add(node.name)
      }
    }
  })

  // 4. VERIFICA SI LAS VARIABLES GLOBALES EXISTEN
  // Solo para global.X y los objetos más comunes (esto es estático, no ejecuta nada)
  for (let globalVar of externalGlobals) {
    if (globalVar === 'global') continue // existe siempre
    try {
      // Prueba si existe en el entorno global real
      if (typeof global[globalVar] === 'undefined') {
        undefinedGlobals.push(globalVar)
      }
    } catch { undefinedGlobals.push(globalVar) }
  }

  // 5. ARMA LA RESPUESTA
  if (missingImports.length) {
    response += `🚩 *Imports/requires faltantes:* ${missingImports.map(v => `\`${v}\``).join(', ')}\n`
    hasError = true
  }
  if (undefinedGlobals.length) {
    response += `🚩 *Variables/fun. globales no definidas:* ${undefinedGlobals.map(v => `\`global.${v}\``).join(', ')}\n`
    hasError = true
  }
  if (!hasError) response += '✅ El archivo **NO presenta errores de sintaxis ni dependencias faltantes conocidas.**'
  else response += '\nCorrige los errores y vuelve a probar.'

  m.reply(response)
}
handler.help = ['sintaxis <archivo>']
handler.tags = ['tools']
handler.command = ['sintaxis']
handler.register = true
handler.rowner = true

export default handler