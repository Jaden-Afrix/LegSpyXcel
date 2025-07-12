const path = require("path");

// Format milliseconds uptime to HH:MM:SS
function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / 60000) % 60;
  const hours = Math.floor(ms / 3600000);
  
  return [hours, minutes, seconds]
    .map(v => (v < 10 ? "0" + v : v))
    .join(":");
}

const mediaPaths = {
  banner: path.join(__dirname, "..", "media", "banner.png"),
  notifyAudio: path.join(__dirname, "..", "media", "notify.mp3"),
};

module.exports = { formatUptime, mediaPaths };