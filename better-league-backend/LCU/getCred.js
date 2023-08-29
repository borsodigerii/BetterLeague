const lc = require('league-connect');

exports.getCred = async () => {
    let cred = await lc.authenticate();
    return cred;
}