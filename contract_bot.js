// requires 🚀
const { GraphQLClient, gql } = require("graphql-request");
const { get_state, set_state } = require("./utils/state");
const {
    TELEGRAM_GROUPS,
    TELEGRAM_PRESET_MESSAGES,
    telegramSendTo,
} = require("./telegram");

const TX_QUERY = gql`
    {
        ethereum(network: bsc) {
            arguments(
                smartContractAddress: {
                    is: "0x19263F2b4693da0991c4Df046E4bAA5386F5735E"
                }
                options: { limit: 10, desc: "date.date" }
            ) {
                date {
                    date
                }
                transaction {
                    hash
                }
            }
        }
    }
`;

const getLatestTransaction = async () => {
    try {
        const client = new GraphQLClient("https://graphql.bitquery.io");
        client.setHeader("X-API-KEY", process.env.BITQUERY_API_KEY);

        const data = await client.request(TX_QUERY);
        const latestTr = data.ethereum.arguments[0];

        return latestTr?.transaction?.hash;
    } catch (e) {
        console.warn(`[contract_bot] error occured on fetching latest tx`);
        console.error(e);
    }

    return "";
};

const checkContract = async (id) => {
    const state_id = id;
    const state = get_state(state_id);

    if (state.status === "unpaused") {
        return "CANCEL";
    }

    const latest_tx_hash = await getLatestTransaction();

    if (state.latest_tx_hash === latest_tx_hash) {
        return;
    }

    set_state(state_id, {
        latest_tx_hash,
        status: "unpaused",
    });

    telegramSendTo(
        [TELEGRAM_GROUPS.MY_PRIVATE_CHAT, TELEGRAM_GROUPS.MY_GROUP_CHAT],
        TELEGRAM_PRESET_MESSAGES.CONTRACT_UNPAUSED
    );
};

module.exports = { checkContract };
