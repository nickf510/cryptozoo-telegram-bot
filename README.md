<p align="center">
  <h3 align="center">cryptozoo telegram bot</h3>
  <p align="center">A telegram bot built to alert when certain things happen<p>
</p>

## Setup Notes

### How to create the instagram bot
- start a conversation with @BotFather on Telegram
- send /newbot to @BotFather & complete the setup
- add the token api provided by @BotFather into `.env` or by replacing `process.env.TELEGRAM_API_KEY` in telegram.js file

### How to set bot commands
- send /mybots to @BotFather and press on edit commands

### How to find chat_ids
- send "/my_id @YOUR_BOT_USERNAME"
- visit https://api.telegram.org/bot\<YOUR_BOT_API_KEY\>/getUpdates
- extract chatid from the returned json
- if it doesn't work, try again

## Other Things

This bot also has a simple example of querying the GraphQL of the BitQuery service in order to find the latest transaction of a smart contract.
