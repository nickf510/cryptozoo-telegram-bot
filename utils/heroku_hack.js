const got = require("got");
const express = require("express");

const PORT = process.env.PORT || 5000;

/**
 * If you deploy this bot to heroku,
 * it will be turned off if there's no
 * http server created and no requests
 * to the server every now and then.
 *
 * This can be turned into web hooks instead
 * of keeping this bot alive permanently
 */

const start_heroku_bot = (duration = 30 * 1000) => {
    express()
        .get("/", (req, res) => res.send({ status: "ok" }))
        .listen(PORT, () =>
            console.log(`[heroku_hack] Listening on ${PORT}...`)
        );

    setInterval(async () => {
        try {
            console.log(`[heroku_hack] de-idling by requesting own address...`);
            await got(process.env.SERVER_URL);
        } catch (e) {}
    }, duration);
};

module.exports = { start_heroku_bot };
