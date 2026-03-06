const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const token = process.env.TG_TOKEN || '8652394835:AAG4K5PE4FlXM5jYo5tUxpL3EQjmv2hO1xI';
const bot = new TelegramBot(token, { polling: true });

const OPENCLAW_URL = process.env.OPENCLAW_URL || 'http://localhost:18789/v1/chat/completions';
const OPENCLAW_KEY = process.env.OPENCLAW_KEY || '722ef5620a5541fdd8e43d0485b994b65b1a1f610bbf9572';

console.log("Telegram bot starting...");

// Wait for messages
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    console.log(`Received message from ${msg.chat.first_name} (${chatId}): ${text}`);

    if (!text) return;

    // Show typing action
    bot.sendChatAction(chatId, 'typing');

    try {
        const response = await axios.post(
            OPENCLAW_URL,
            {
                model: "markco",
                messages: [{ role: "user", content: text }],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENCLAW_KEY}`
                }
            }
        );

        if (response.data && response.data.choices && response.data.choices.length > 0) {
            bot.sendMessage(chatId, response.data.choices[0].message.content);
        } else {
            bot.sendMessage(chatId, "I didn't get a proper response from my inner self.");
        }
    } catch (err) {
        console.error("OpenClaw connection error:", err.message);
        bot.sendMessage(chatId, "Sorry, I'm currently having trouble connecting to OpenClaw. Is the gateway running?");
    }
});

console.log("Markco Telegram Bot is running.");
// Also we need to ensure openclaw is running
const { spawn } = require('child_process');

// Let's spawn openclaw gateway if it's not up
console.log("Starting OpenClaw gateway daemon from openclaw.cmd...");
const gw = spawn('cmd.exe', ['/c', 'openclaw.cmd', 'gateway', 'start'], {
    detached: true,
    stdio: 'ignore'
});
gw.unref();

console.log("Gateway requested.");
