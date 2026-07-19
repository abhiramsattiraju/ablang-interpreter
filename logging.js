const fs = require('fs');
const path = require('path');

function writeToLog(message) {
    try {
        fs.appendFileSync(path.join(__dirname, 'ablang_log.txt'),
                          message + '\n');
    } catch (err) {
        console.error("Failed to write to log file:", err);
    }
}

module.exports = { writeToLog: writeToLog };
