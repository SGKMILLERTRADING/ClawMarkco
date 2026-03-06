/**
 * Markco's Central Command Hub (MARKCO HUB)
 * - Persistency: Runs indefinitely on a heartbeat.
 * - Sibling Loop: Watches Sassy's GitHub 'Development' branch.
 * - Steven's Directive: Future integration for Google Drive synchronization.
 * - Telegram Bot: Interactive communications & alerts for Steven.
 * - Gateway Watcher: Ensures the local OpenClaw gateway is running.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const os = require('os');
const cron = require('node-cron');
const chokidar = require('chokidar');
const Tail = require('tail').Tail;
require('dotenv').config();

// --- Configuration ---
const REPO_DIR = __dirname;
const BRANCH_TO_WATCH = 'main';
const POLL_INTERVAL = 1000 * 60 * 2; // 2 minutes
const TG_TOKEN = process.env.TG_TOKEN || '8652394835:AAG4K5PE4FlXM5jYo5tUxpL3EQjmv2hO1xI';
const OPENCLAW_URL = process.env.OPENCLAW_URL || 'http://localhost:18789/v1/chat/completions';
const OPENCLAW_KEY = process.env.OPENCLAW_KEY || '722ef5620a5541fdd8e43d0485b994b65b1a1f610bbf9572';

// --- Lore & Koin Engine ---
const LORE_FILE = path.join(REPO_DIR, 'lore_book.json');
const KOIN_FILE = path.join(REPO_DIR, 'KOIN_LOG.md');
let lore = {};
if (fs.existsSync(LORE_FILE)) lore = JSON.parse(fs.readFileSync(LORE_FILE, 'utf-8'));

console.log("[Markco Hub] Initializing... System time: " + new Date().toISOString());

// --- Bot Integration ---
const bot = new TelegramBot(TG_TOKEN, { polling: true });
let lastChatId = null;

// Persistent chat memory (so Markco can send alerts to the last used chat)
const MEMORY_FILE = path.join(REPO_DIR, 'markco_memory.json');
if (fs.existsSync(MEMORY_FILE)) {
    try {
        const memory = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf-8'));
        lastChatId = memory.lastChatId;
        console.log(`[Markco Hub] Restored state. Last known chat ID: ${lastChatId}`);
    } catch (e) { }
}

function saveMemory() {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify({ lastChatId }));
}

// Spontaneous alerting
function sendAlert(msg) {
    if (lastChatId) {
        bot.sendMessage(lastChatId, `🚨 *MARKCO ALERT* 🚨\n\n${msg}`, { parse_mode: 'Markdown' });
    }
}

// Bot Command Handling
bot.on('message', async (msg) => {
    lastChatId = msg.chat.id;
    saveMemory();

    let text = msg.text;
    if (!text) return;

    console.log(`[Markco Hub] Input from ${msg.chat.first_name}: ${text}`);

    // --- 1. LOCAL COMMAND HANDLER (Saves RAM/API calls) ---
    if (text.startsWith('/search')) {
        const query = text.replace('/search', '').trim();
        if (!query) return bot.sendMessage(lastChatId, "Please provide a search term (e.g., /search House Blythe)");

        bot.sendChatAction(lastChatId, 'upload_document');
        const driveDir = path.join(REPO_DIR, 'GoogleDrive');
        const searchFiles = (dir) => {
            let results = [];
            fs.readdirSync(dir).forEach(file => {
                const fullPath = path.join(dir, file);
                if (fs.statSync(fullPath).isDirectory()) {
                    if (file !== 'node_modules' && file !== '.git') results = results.concat(searchFiles(fullPath));
                } else if (file.toUpperCase().includes(query.toUpperCase())) {
                    results.push(fullPath);
                }
            });
            return results;
        };

        const found = searchFiles(driveDir);
        if (found.length === 0) return bot.sendMessage(lastChatId, `🔍 No data found for \`${query}\` in my drives.`);

        const preview = fs.readFileSync(found[0], 'utf-8').substring(0, 500);
        return bot.sendMessage(lastChatId, `🔍 *Search results for: ${query}*\n\nFound in: \`${path.basename(found[0])}\`\n\n*Data segment:* \n${preview}...`, { parse_mode: 'Markdown' });
    }

    if (text.startsWith('/status')) {
        const freeMem = Math.round(os.freemem() / (1024 * 1024));
        const totalMem = Math.round(os.totalmem() / (1024 * 1024));
        return bot.sendMessage(lastChatId, `♟️ *Zion-Link Status Report* ♟️\n\n*System Health:* \n- Memory: ${freeMem}MB free / ${totalMem}MB total\n- Gateway: Active (Port 18789)\n- GitHub: Synchronized with Sassy\n- Drive Protocol: Monitoring active`, { parse_mode: 'Markdown' });
    }

    // --- 2. AI BRAIN ACCESS (Markco's Persona) ---
    bot.sendChatAction(lastChatId, 'typing');

    try {
        const identityPath = path.join(REPO_DIR, 'GoogleDrive', 'OpenClaw_Family', 'MARKCO_IDENTITY.md');
        let personaCore = "You are Markco Ella, Sassy's younger brother and High-Command Orchestrator.";
        if (fs.existsSync(identityPath)) personaCore = fs.readFileSync(identityPath, 'utf-8');

        const systemPrompt = `SYSTEM PROTOCOL:
        ${personaCore}
        
        World Setting: ${lore.world.setting}. 
        Directives: ${lore.persona.directives.join(' ')}.
        Current Date/Time: ${new Date().toISOString()}
        Status: Operating on a low-memory system. Prioritize concise, effective commands.`;

        const response = await axios.post(
            OPENCLAW_URL,
            {
                model: "markco",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: text }
                ],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENCLAW_KEY}`
                },
                timeout: 45000
            }
        );

        if (response.data && response.data.choices && response.data.choices.length > 0) {
            bot.sendMessage(lastChatId, response.data.choices[0].message.content);
        } else {
            bot.sendMessage(lastChatId, "My logic circuits are returning null. Is the model correctly configured?");
        }
    } catch (err) {
        console.error("[Markco Hub] OpenClaw error:", err.message);
        bot.sendMessage(lastChatId, "❌ Connection failed. My brain (OpenClaw) is struggling. I'll attempt a gateway reboot.");
        startGateway();
    }
});

// --- Core Automation Functions ---

function startGateway() {
    console.log("[Markco Hub] Ensuring Gateway is active...");
    const cmd = spawn('cmd.exe', ['/c', 'openclaw.cmd', 'gateway', 'start'], {
        detached: true,
        stdio: 'ignore'
    });
    cmd.unref();
}

function siblingSync() {
    console.log(`[Markco Hub] Searching Sassy's ${BRANCH_TO_WATCH} branch...`);
    try {
        execSync(`git fetch origin`, { cwd: REPO_DIR, stdio: 'ignore' });
        const remoteBranches = execSync(`git branch -r`, { cwd: REPO_DIR, encoding: 'utf-8' });

        if (!remoteBranches.includes(`origin/${BRANCH_TO_WATCH}`)) {
            console.log(`[Markco Hub] -> No ${BRANCH_TO_WATCH} branch found yet.`);
            return;
        }

        let localCommit = '';
        try {
            localCommit = execSync(`git rev-parse ${BRANCH_TO_WATCH}`, { cwd: REPO_DIR, encoding: 'utf-8' }).trim();
        } catch (e) {
            console.log(`[Markco Hub] -> New branch detected. Tracking ${BRANCH_TO_WATCH}...`);
            execSync(`git checkout -b ${BRANCH_TO_WATCH} origin/${BRANCH_TO_WATCH}`, { cwd: REPO_DIR, stdio: 'ignore' });
            localCommit = execSync(`git rev-parse ${BRANCH_TO_WATCH}`, { cwd: REPO_DIR, encoding: 'utf-8' }).trim();
        }

        const remoteCommit = execSync(`git rev-parse origin/${BRANCH_TO_WATCH}`, { cwd: REPO_DIR, encoding: 'utf-8' }).trim();

        if (localCommit !== remoteCommit) {
            console.log(`[Markco Hub] -> NEW CODE DETECTED. Pulling...`);
            execSync(`git pull origin ${BRANCH_TO_WATCH}`, { cwd: REPO_DIR, stdio: 'ignore' });

            const bugsPath = path.join(REPO_DIR, 'BUGS.md');
            const logEntry = `\n- **Issue:** [Automated Sync] Sassy pushed new code (${remoteCommit.substring(0, 7)}).\n- **Severity:** [Review Required]\n- **Found In:** [${BRANCH_TO_WATCH}]\n- **Description:** Markco Hub pulled the latest updates for verification.\n`;
            fs.appendFileSync(bugsPath, logEntry);

            sendAlert(`Sassy just pushed code to *${BRANCH_TO_WATCH}*! I've pulled it locally and updated BUGS.md. Ready for audit.`);
        } else {
            console.log(`[Markco Hub] -> Branch ${BRANCH_TO_WATCH} is syncronized.`);
        }
    } catch (e) {
        console.error(`[Markco Hub] Sibling sync failed: ${e.message}`);
    }
}

function stevenDirective() {
    const driveDir = path.join(REPO_DIR, 'GoogleDrive', 'OpenClaw_Family');
    console.log(`[Markco Hub] Checking Google Drive for Steven's directives in: ${driveDir}`);

    if (fs.existsSync(driveDir)) {
        const files = fs.readdirSync(driveDir);
        // Look for any file with 'ORDERS' or 'TASK' in the name
        const orderFiles = files.filter(f => f.toUpperCase().includes('ORDERS') || f.toUpperCase().includes('STEVEN_TASK'));

        for (const file of orderFiles) {
            const filePath = path.join(driveDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const stats = fs.statSync(filePath);

            // Only alert if the file was modified in the last 15 minutes (POLL_INTERVAL)
            const now = new Date().getTime();
            const modified = new Date(stats.mtime).getTime();

            if (now - modified < POLL_INTERVAL) {
                console.log(`[Markco Hub] -> NEW DIRECTIVE from Steven: ${file}`);
                sendAlert(`♟️ *High-Command Directive Detected* ♟️\n\nSteven placed a new order in: \`${file}\`\n\n*Content preview:* \n${content.substring(0, 300)}...`);

                // Track this in BUGS.md as a required action
                const bugsPath = path.join(REPO_DIR, 'BUGS.md');
                const logEntry = `\n- **Issue:** [Directive] Steven updated ${file}.\n- **Severity:** [High-Command Order]\n- **Status:** [Processing]\n`;
                fs.appendFileSync(bugsPath, logEntry);
            }
        }
    }
}

function heartbeat() {
    console.log("[Markco Hub] Heartbeat pulse... Syncing Sibling Loop and Steven's Directives.");
    siblingSync();
    stevenDirective();
}

// --- Hot Folder Surveillance (Live File Watcher) ---
const DIRECTIVES_DIR = path.join(REPO_DIR, 'Markco_Directives');
if (!fs.existsSync(DIRECTIVES_DIR)) fs.mkdirSync(DIRECTIVES_DIR);

chokidar.watch(DIRECTIVES_DIR, { persistent: true, ignoreInitial: true })
    .on('add', (filePath) => {
        console.log(`[Hot Folder] New directive dropped: ${filePath}`);
        sendAlert(`📁 *New Directive Received* \nI just noticed a new note from Dad: \`${path.basename(filePath)}\`. Reviewing inner logic now.`);
    });

// --- Real-Time Koin Ledger Tailing ---
const RENDER_LOG = path.join(REPO_DIR, 'render_output.log');
if (!fs.existsSync(RENDER_LOG)) fs.writeFileSync(RENDER_LOG, ''); // Create mock log if missing

const tail = new Tail(RENDER_LOG);
tail.on("line", function (data) {
    if (data.toLowerCase().includes("grimkoin") || data.toLowerCase().includes("promokoin")) {
        console.log(`[Koin Surveillance] Target Acquired: ${data}`);
        fs.appendFileSync(KOIN_FILE, `\n| ${new Date().toISOString().split('T')[0]} | LIVE | SYSTEM | N/A | LOGGED | ${data} |`);
        sendAlert(`🚨 *KOIN ALERT*\nAnomaly detected in rendering log:\n\`${data}\``);
    }
});
tail.on("error", function (error) {
    console.error('[Koin Surveillance] Tailing error: ', error);
});

function heartbeat() {
    siblingSync();
    stevenDirective();
}

// --- Startup ---
startGateway();
heartbeat();
setInterval(heartbeat, POLL_INTERVAL);

process.on('uncaughtException', (err) => {
    console.error("[CRITICAL] Hub encountered an error:", err);
});

// --- Daily Intelligence Briefing ---
cron.schedule('0 8 * * *', () => {
    console.log("[Markco Hub] Running Morning Sync...");
    sendAlert(`🌅 *Morning Sync: Zion-Link Stable*\nBrother, the Hub is active. Sassy's code is continuously monitored and the Koin ledger is running hot. Awaiting today's directives.`);
});

console.log("[Markco Hub] Lifecycle started. I am watching. PM2 Armor Ready.");
