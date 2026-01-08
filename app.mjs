/**
 * Passenger Entry Point за BGFreak Node.js App
 * 
 * Този файл е алтернативен entry point за Phusion Passenger.
 * Passenger може да използва директно .output/server/index.mjs,
 * но този файл осигурява по-добра съвместимост и error handling.
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  // Импортирай Nitro сървъра
  const serverPath = join(__dirname, '.output/server/index.mjs');
  const { default: handler } = await import(serverPath);
  
  console.log('✅ BGFreak Node.js app loaded successfully via Passenger');
  console.log('📍 Server path:', serverPath);
  
  export default handler;
} catch (error) {
  console.error('❌ Failed to load BGFreak app:', error);
  throw error;
}

