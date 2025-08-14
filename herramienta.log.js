import fs from 'fs';
import path from 'path';

const logPath = path.join(process.cwd(), 'errores.log');

// Interceptar errores no capturados
process.on('uncaughtException', (err) => {
  const logMsg = `[${new Date().toISOString()}] UncaughtException: ${err.stack || err}\n`;
  fs.appendFileSync(logPath, logMsg);
  console.error('❌ Error no capturado:', err);
});

// Interceptar promesas rechazadas no manejadas
process.on('unhandledRejection', (reason, promise) => {
  const logMsg = `[${new Date().toISOString()}] UnhandledRejection: ${reason}\n`;
  fs.appendFileSync(logPath, logMsg);
  console.error('❌ Promesa rechazada sin manejar:', reason);
});

// Interceptar todos los console.log/error/warn y guardarlos
['log', 'error', 'warn'].forEach((method) => {
  const original = console[method];
  console[method] = (...args) => {
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] [${method.toUpperCase()}] ${args.join(' ')}\n`);
    original.apply(console, args);
  };
});
