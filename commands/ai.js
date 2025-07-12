const axios = require("axios");
const config = require("../config.json");
const path = require("path");
const { mediaPaths } = require("../handler/utils");

module.exports = {
  name: "ai",
  description: "Responds to prompts using AI",

  async execute(sock, msg, args) {
    const senderId = msg.key.remoteJid;
    const prefix = config.prefix;

    // If the user didn't include a prompt after the command
    const userInput = args.join(" ").trim();
    if (!userInput) {
      return sock.sendMessage(
        senderId,
        {
          image: { url: mediaPaths.banner },
          caption: `*${config.botName}*\n\n🗨️ Please enter a message after the command.\n\nExample:\n${prefix}ai What is the capital of Japan?`,
          footer: "Powered by LegSpyXcel",
          audio: { url: mediaPaths.notifyAudio }
        },
        { quoted: msg }
      );
    }

    try {
      // Call the AI backend with the user's prompt
      const response = await axios.get("https://api.nexoracle.com/ai/meta-llama", {
        params: {
          apikey: "7902cbef76b269e176", // 
          prompt: userInput
        }
      });

      const aiText = response.data?.response;

      if (!aiText) {
        return sock.sendMessage(
          senderId,
          {
            text: `*${config.botName}*\n\n⚠️ Hmm... I couldn’t come up with anything. Maybe try again with a simpler question?`
          },
          { quoted: msg }
        );
      }

      // Send the AI response to the user
      await sock.sendMessage(
        senderId,
        {
          image: { url: mediaPaths.banner },
          caption: `*${config.botName}*\n\n🧠 ${aiText}`,
          footer: "Powered by LegSpyXcel",
          audio: { url: mediaPaths.notifyAudio }
        },
        { quoted: msg }
      );

    } catch (error) {
      console.error("[AI Command Error]", error);

      return sock.sendMessage(
        senderId,
        {
          text: `*${config.botName}*\n\n❌ Sorry, I had trouble thinking just now. Please try again shortly.`
        },
        { quoted: msg }
      );
    }
  }
};