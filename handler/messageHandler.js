const { commands } = require("./commandLoader");
const config = require("../config.json");
const chalk = require("chalk");

async function messageHandler(sock, msg) {
  try {
    if (!msg.message) return;
    if (msg.key && msg.key.fromMe) return; // Ignore own messages
    
    const from = msg.key.remoteJid;
    const content =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      "";
    
    if (!content.startsWith(config.prefix)) return;
    
    const args = content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    if (!commands.has(commandName)) {
      await sock.sendMessage(from, { text: `❌ Command not found: ${commandName}` }, { quoted: msg });
      return;
    }
    
    const command = commands.get(commandName);
    await command.execute(sock, msg, args);
  } catch (error) {
    console.error(chalk.red("❌ Error in messageHandler:"), error);
  }
}

module.exports = { messageHandler };