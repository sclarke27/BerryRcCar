const swim = require('swim-client-js');

const Log = {

    info: (msg) => {
        Log._logMsg(`[JS][info] ${msg}`);
    },

    log: (msg) => {
        Log._logMsg(`[JS][info] ${msg}`);
    },

    error: (msg) => {
        Log._logMsg(`[JS][info] ${msg}`);
    },

    _logMsg: (msg) => {
        console.info(msg);
        Log._logToSwim(msg);
    },

    _logToSwim: (msg) => {
        swim.command(`ws://127.0.0.1:5620`, `botState`, 'addJavascriptLog', msg);
    }
}

module.exports = Log;