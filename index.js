// requires 🚀
const fs = require("fs");
const got = require("got");
const dotenv = require("dotenv").config();
const { get_state, set_state } = require("./utils/state");
const { start_heroku_bot } = require("./utils/heroku_hack");

// bot requires
const { checkContract } = require("./contract_bot");

// -----------------------
// import telegram-specific things
// -----------------------

const {
    // defs
    TELEGRAM_GROUPS,
    TELEGRAM_PRESET_MESSAGES,

    // methods
    telegramSendTo,
    createTelegramBot,
    addTelegramBlockingCondition,
} = require("./telegram");

const { registerAllCommands } = require("./telegram_commands");

// -----------------------
// Website Checker Bot Methods
// -----------------------

const checkWebsite = async ({ id, url, onChange }) => {
    const fileName = `${id}.dat`;
    const filePath = `./websites/${fileName}`;

    let currentContent = "";

    if (fs.existsSync(filePath)) {
        currentContent = fs.readFileSync(filePath);
    } else {
        fs.writeFileSync(filePath, "");
    }

    let newContent = "";

    try {
        const res = await got.default.get(url);
        newContent = res.body;
    } catch (e) {
        console.warn(`[checkWebsite] ${url} couldn't fetch website`);
        // console.error(e);
    }

    if (newContent != currentContent) {
        fs.writeFileSync(filePath, newContent);
        onChange && onChange(newContent);
    }
};

// -----------------------
// Timeout Methods
// -----------------------

const timeouts = {};
const timeoutFnRunner = (id, fn, timeout = 10 * 1000) => {
    console.log(`[timeout-runner] calling ${id}...`);

    // using try-catch in order to not interrupt on errors
    try {
        // on `CANCEL` return value break the timeout
        if (fn() === "CANCEL") {
            return;
        }
    } catch (e) {}

    timeouts[id] = setTimeout(() => timeoutFnRunner(id, fn, timeout), timeout);
};

// -----------------------
// Start
// -----------------------

const createWebsiteBots = () => {
    const default_duration = 30 * 1000;

    // alert for https://app.cryptozoo.co/
    timeoutFnRunner(
        "cryptozoo/app",
        () =>
            checkWebsite({
                id: "cryptozooco_app",
                url: "https://app.cryptozoo.co/",
                onChange: () =>
                    telegramSendTo(
                        [
                            TELEGRAM_GROUPS.MY_PRIVATE_CHAT,
                            TELEGRAM_GROUPS.MY_GROUP_CHAT,
                        ],
                        TELEGRAM_PRESET_MESSAGES.WEBSITE_NAME_AND_URL_UPDATED(
                            `CryptoZoo App`,
                            `https://app.cryptozoo.co/`
                        )
                    ),
            }),
        default_duration
    );

    // alert for https://cryptozoo.co/
    timeoutFnRunner(
        "cryptozoo/home",
        () =>
            checkWebsite({
                id: "cryptozooco_home",
                url: "https://cryptozoo.co/",
                onChange: () =>
                    telegramSendTo(
                        [
                            TELEGRAM_GROUPS.MY_PRIVATE_CHAT,
                            TELEGRAM_GROUPS.MY_GROUP_CHAT,
                        ],
                        TELEGRAM_PRESET_MESSAGES.WEBSITE_NAME_AND_URL_UPDATED(
                            `CryptoZoo Home`,
                            `https://cryptozoo.co/`
                        )
                    ),
            }),
        default_duration
    );
};

const createContractBot = () => {
    const id = `bscscan_smartcontract-changed`;
    const duration = 30 * 1000; //every 30 seconds

    timeoutFnRunner(id, () => checkContract(id), duration);
};

const start = () => {
    console.log(`🚀 starting telegram-zoo bot :)`);
    start_heroku_bot();

    // i don't want to send message to anyone else
    // besides me & my registered group chat
    addTelegramBlockingCondition(
        ({ chatId }) =>
            chatId != TELEGRAM_GROUPS.MY_GROUP_CHAT &&
            chatId != TELEGRAM_GROUPS.MY_PRIVATE_CHAT
    );

    // create telegram bot
    const bot = createTelegramBot();

    console.log(`[telegram-bot] registering commands...`);
    registerAllCommands(bot);

    // create my bots
    createWebsiteBots();
    createContractBot();
};

start();
