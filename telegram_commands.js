const {
    TELEGRAM_GROUPS,
    TELEGRAM_PRESET_MESSAGES,
    telegramSendTo,
    shouldNotSendMessage,
} = require("./telegram");
const { set_state, get_state } = require("./utils/state");

const sendToAll = (message) => {
    telegramSendTo(
        [TELEGRAM_GROUPS.MY_PRIVATE_CHAT, TELEGRAM_GROUPS.MY_GROUP_CHAT],
        message
    );
};

const registerStartCommand = (bot) => {
    bot.onText(/\/start/, (msg, match) => {
        telegramSendTo(
            [msg.chat.id],
            `Hi there, I will tell you when:
    
    - Crypto Zoo Contract is resumed
    - Crypto Zoo Sale has started (or the website got updated)
    
    This is done via querying a GraphQL service that gives me the information when the contract is back online & also querying cryptozoo.co website for any change. Every 1 minute a new query is being executed.`
        );
    });
};

const registerResetCommands = (bot) => {
    bot.onText(/\/resetsale/, (msg, match) => {
        const chatId = msg.chat.id;

        if (shouldNotSendMessage({ chatId })) {
            return;
        }

        // set state
        set_state(`cryptozoo_status`, { sale: false });

        telegramSendTo([msg.chat.id], `sale status changed to 🔴`);
    });
};

const registerStatusCommand = (bot) => {
    bot.onText(/\/status/, (msg, match) => {
        const chatId = msg.chat.id;
        const sale_state = get_state(`cryptozoo_status`);
        const contract_state = get_state(`bscscan_smartcontract-changed`);

        telegramSendTo(
            [msg.chat.id],
            `Status\n\n` +
                `Contract: ${
                    contract_state.status == "unpaused" ? "🟢" : "🔴"
                }\n` +
                `Sale: ${sale_state.sale ? "🟢" : "🔴"}\n`
        );
    });
};

const registerAllCommands = (bot) => {
    registerStartCommand(bot);
    registerStatusCommand(bot);
    registerResetCommands(bot);
};

module.exports = { registerAllCommands };
