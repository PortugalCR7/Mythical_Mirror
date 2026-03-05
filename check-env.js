import fs from 'fs';
import path from 'path';
import net from 'net';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: '.env.local' });
dotenv.config();

const REQUIRED_VARS = [
    'VITE_GEMINI_API_KEY',
    // One of these must exist
    ['GOOGLE_CLOUD_PROJECT', 'VITE_GCP_PROJECT_ID'],
    'GOOGLE_APPLICATION_CREDENTIALS'
];

const TARGET_PORT = 5001;

console.log("🔍 SYSTEM STABILITY CHECK INITIATED...");

// 1. Check Environment Variables
let missingVars = [];
REQUIRED_VARS.forEach(varName => {
    if (Array.isArray(varName)) {
        const found = varName.find(v => process.env[v]);
        if (!found) missingVars.push(`One of: ${varName.join(', ')}`);
    } else {
        if (!process.env[varName]) missingVars.push(varName);
    }
});

if (missingVars.length > 0) {
    console.error("❌ CRITICAL ERROR: Missing Environment Variables:");
    missingVars.forEach(v => console.error(`   - ${v}`));
    process.exit(1);
} else {
    console.log("✅ Environment Variables: LOADED");
}

// 2. Check Key File Existence
const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (keyPath) {
    const resolvedPath = path.resolve(__dirname, keyPath);
    if (!fs.existsSync(resolvedPath)) {
        console.error(`❌ CRITICAL ERROR: Service Account Key not found at: ${resolvedPath}`);
        process.exit(1);
    } else {
        console.log("✅ Service Account Key: VERIFIED");
    }
}

// 3. Port Availability Check
const server = net.createServer();

server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`⚠️  NOTICE: Port ${TARGET_PORT} is currently in use.`);
        console.log("   (This is expected if the server is already running. If it's failing to start, kill the process using port 5000.)");
        process.exit(0); // Not a failure of the check itself, just a status update
    } else {
        console.error(`❌ Port Check Error: ${err.message}`);
        process.exit(1);
    }
});

server.once('listening', () => {
    server.close();
    console.log(`✅ Port ${TARGET_PORT}: AVAILABLE`);
});

server.listen(TARGET_PORT);
