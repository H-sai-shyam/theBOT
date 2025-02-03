const mineflayer = require('mineflayer');
const express = require('express');

const config = require('./settings.json');

const app = express();
let bot = null;

app.get('/', (req, res) => {
  res.send('Bot is running');
});

app.listen(8000, () => {
  console.log('Server started');
});

// Function to create and manage the bot
function createBot() {
  bot = mineflayer.createBot({
    username: config['bot-account']['username'],
    password: config['bot-account']['password'],
    auth: config['bot-account']['type'],
    host: config.server.ip,
    port: config.server.port,
    version: config.server.version,
  });

  bot.on('spawn', () => {
    console.log('[INFO] Bot joined the server');
    checkPlayerCount();
  });

  bot.on('playerJoined', (player) => {
    console.log(`[INFO] ${player.username} joined the server`);
    checkPlayerCount();
  });

  bot.on('playerLeft', (player) => {
    console.log(`[INFO] ${player.username} left the server`);
    checkPlayerCount();
  });

  bot.on('error', (err) => {
    console.log('[ERROR]', err);
  });

  bot.on('end', () => {
    console.log('[INFO] Bot disconnected');
    setTimeout(() => {
      createBot();  // Reconnect the bot when it disconnects
    }, config.utils['auto-recconect-delay']);
  });
}

// Function to check the number of players and decide whether to leave or join
function checkPlayerCount() {
  const players = Object.keys(bot.players);  // Get all players on the server

  if (players.length === 0 && !bot.isConnected) {
    console.log('[INFO] No players online. Bot joining...');
    bot.connect();  // Connect the bot if no one else is online
  } else if (players.length > 0 && bot.isConnected) {
    console.log('[INFO] Player(s) online. Bot leaving...');
    bot.quit();  // Quit the server if any player is online
  }
}

// Create the bot when the script is run
createBot();
