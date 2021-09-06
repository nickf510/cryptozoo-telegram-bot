//
const TelegramBot = require("node-telegram-bot-api");
let global_bot = null;

// -----------------------
// Telegram Definitions
// -----------------------

const BLOCKING_CONDITIONS = [];

const TELEGRAM_GROUPS = {
    MY_PRIVATE_CHAT: 675993157,
    MY_GROUP_CHAT: 675993157, //-1001544198049,
};

const TELEGRAM_PRESET_MESSAGES = {
    WEBSITE_NAME_AND_URL_UPDATED: (name, url) =>
        `${name} page just got updated.` + `\n` + `\nVisit at ${url}`,
    CONTRACT_UNPAUSED: `CryptoZoo's contract just has been unpaused.`,
};

// -----------------------
// Telegram Utils
// -----------------------

const addBlockingCondition = (condition) => {
    BLOCKING_CONDITIONS.push(condition);

    return () => {
        const idx = BLOCKING_CONDITIONS.indexOf(condition);
        if (idx !== -1) {
            BLOCKING_CONDITIONS.splice(idx, 1);
        }
    };
};

// -----------------------
// Telegram Messaging methods
// -----------------------

/**
 * This utility fn iterates through BLOCKING_CONDITIONS
 * and if returns true whenever a truthy condition is found.
 *
 * This is going to be used in the functions where you want
 * to send replies in order to not reply to everyone.
 *
 * Example: implementing a minimum reply wait time and let
 * the bot skip the same command until the minimum time has
 * passed.
 */
const shouldNotSendMessage = ({ chatId, senderId }) => {
    for (let condition of BLOCKING_CONDITIONS) {
        if (condition({ chatId, senderId })) {
            return true;
        }
    }

    return false;
};

const telegramSendTo = (ids, message) => {
    ids = Array.isArray(ids) ? ids : [ids];

    for (let id of ids) {
        //
        if (shouldNotSendMessage({ chatId: id })) {
            continue;
        }

        global_bot.sendMessage(id, message);

        // console.log(`sending message to ${id}\n`);
    }
};

const createTelegramBot = () => {
    console.log(`[telegram-bot] starting bot...`);

    global_bot = new TelegramBot(process.env.TELEGRAM_API_KEY, {
        polling: true,
    });

    global_bot.on("polling_error", console.log);

    return global_bot;
};

// -----------------------
// export
// -----------------------

module.exports = {
    TELEGRAM_GROUPS,
    TELEGRAM_PRESET_MESSAGES,
    telegramSendTo,
    createTelegramBot,
    shouldNotSendMessage,
    addTelegramBlockingCondition: addBlockingCondition,
};
