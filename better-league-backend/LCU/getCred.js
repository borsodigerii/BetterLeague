const lc = require('league-connect');

exports.getCred = async () => {
    let cred = await lc.authenticate();
    //cred.password = cred.password.replace("--app-port", "")
    return cred;
}