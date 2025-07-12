const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

const commands = new Map();

async function loadCommands() {
  commands.clear();
  const commandsPath = path.join(__dirname, "..", "commands");
  const files = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
  
  for (const file of files) {
    try {
      const command = require(path.join(commandsPath, file));
      if (!command.name || !command.execute) {
        console.warn(chalk.yellow(`⚠️ Command file "${file}" is missing name or execute property.`));
        continue;
      }
      commands.set(command.name, command);
      console.log(chalk.green(`✅ Loaded command: ${command.name}`));
    } catch (error) {
      console.error(chalk.red(`❌ Failed to load command "${file}":`), error);
    }
  }
}

module.exports = { commands, loadCommands };