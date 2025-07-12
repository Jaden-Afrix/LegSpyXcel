const axios = require("axios");
const config = require("../config.json");
const path = require("path");
const { mediaPaths } = require("../handler/utils");

module.exports = {
  name: "deepseek",
  description: "Ask ChatGPT-4 anything",

  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const prefix = config.prefix;
    const question = args.join(" ").trim();

    // No question provided
    if (!question) {
      return sock.sendMessage(
        chatId,
        {
          image: { url: mediaPaths.banner },
          caption: `*${config.botName}*\n\n💡 You need to ask something for me to respond.\n\nTry:\n${prefix}deepseek Tell me a fun fact.`,
          footer: "Powered by LegSpyXcel",
          audio: { url: mediaPaths.notifyAudio }
        },
        { quoted: msg }
      );
    }

    try {
      // Request answer from ChatGPT-4 API
      const response = await axios.get("https://api.nexoracle.com/ai/chatgpt-v4", {
        params: {
          apikey: "7902cbef76b269e176", // loaded from env later if needed
          prompt: question
        }
      });

      const chatReply = response.data?.response;

      // API returned nothing useful
      if (!chatReply || typeof chatReply !== "string") {
        return sock.sendMessage(
          chatId,
          {
            text: `*${config.botName}*\n\n⚠️ I couldn’t find a proper reply this time. Maybe rephrase your question?`,
          },
          { quoted: msg }
        );
      }

      // Send AI's response with bot visuals
      await sock.sendMessage(
        chatId,
        {
          image: { url: mediaPaths.banner },
          caption: `*${config.botName}*\n\n💬 ${chatReply}`,
          footer: "Powered by LegSpyXcel",
          audio: { url: mediaPaths.notifyAudio }
        },
        { quoted: msg }
      );

    } catch (err) {
      console.error("[deepseek.js error]", err.message);

      return sock.sendMessage(
        chatId,
        {
          text: `*${config.botName}*\n\n❌ Sorry, something went wrong while thinking. Try again in a moment.`,
        },
        { quoted: msg }
      );
    }
  }
};