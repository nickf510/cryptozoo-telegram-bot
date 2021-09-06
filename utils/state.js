const fs = require("fs");

const get_state = (id) => {
    let state = {};
    const filePath = `./state/${id}.json`;

    // try loading saved state
    try {
        if (fs.existsSync(filePath)) {
            state = JSON.parse(fs.readFileSync(filePath, "utf8"));
        }
    } catch (error) {
        console.warn(error);
    }

    return state;
};

const set_state = (id, newState) => {
    const filePath = `./state/${id}.json`;
    fs.writeFileSync(filePath, JSON.stringify(newState || {}), "utf8");
};

module.exports = { get_state, set_state };
