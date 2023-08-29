const lc = require('league-connect');

let wc_instance = null;

exports.getLCUWebSocket = async () => {
    if(wc_instance == null){
        wc_instance = await lc.createWebSocketConnection({authenticationOptions: null});
    }
    return wc_instance;
    //return await lc.createWebSocketConnection();
}