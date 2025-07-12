const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  makeInMemoryStore,
} = require("@whiskeysockets/baileys");

const fs = require("fs").promises;
const path = require("path");
const chalk = require("chalk");
const pino = require("pino");
const { Boom } = require("@hapi/boom");

const { loadCommands } = require("./handler/commandLoader");
const { messageHandler } = require("./handler/messageHandler");

const store = makeInMemoryStore({ logger: pino({ level: "silent" }) });
const SESSION_DIR = path.join(__dirname, "session");

let reconnectAttempts = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;

async function ensureSessionFolder() {
  try {
    await fs.mkdir(SESSION_DIR, { recursive: true });
  } catch (err) {
    console.error(chalk.red("❌ Could not create session folder!"), err);
    process.exit(1);
  }
}

async function startLegSpyXcel() {
  await ensureSessionFolder();
  
  try {
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
      version,
      logger: pino({ level: "silent" }),
      printQRInTerminal: true,
      auth: state,
      browser: ["LegSpyXcel", "Chrome", "1.0"],
    });
    
    store.bind(sock.ev);
    
    await loadCommands();
    
    sock.ev.on("messages.upsert", async ({ messages }) => {
      if (!messages || !messages[0]) return;
      await messageHandler(sock, messages[0]);
    });
    
    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;
      
      if (connection === "close") {
        const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
        if (code === DisconnectReason.loggedOut) {
          console.log(chalk.red("🔌 Logged out. Delete session and restart."));
          await fs.rm(SESSION_DIR, { recursive: true, force: true });
          process.exit(0);
        } else {
          if (reconnectAttempts < MAX_RETRIES) {
            reconnectAttempts++;
            console.log(chalk.yellow(`⚠️ Disconnected. Retrying in ${RETRY_DELAY / 1000}s...`));
            setTimeout(startLegSpyXcel, RETRY_DELAY);
          } else {
            console.error(chalk.red("❌ Max reconnect attempts reached. Exiting."));
            process.exit(1);
          }
        }
      } else if (connection === "open") {
        console.log(chalk.green("✅ LegSpyXcel is connected to WhatsApp."));
        reconnectAttempts = 0;
      }
    });
    
    sock.ev.on("creds.update", saveCreds);
    
    process.on("SIGINT", async () => {
      console.log(chalk.red("\n🛑 Shutting down LegSpyXcel..."));
      await sock.logout();
      process.exit(0);
    });
    
  } catch (err) {
    console.error(chalk.red("❌ Error starting LegSpyXcel:"), err);
    process.exit(1);
  }
}

startLegSpyXcel();