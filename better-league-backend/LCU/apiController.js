const NodeCache = require("node-cache");
const apiCache = new NodeCache({ useClones: true });
const lc = require('league-connect');
const log = console.log;
const ConsoleColor = require("cli-color");

apiCache.flushAll();
const { getCred } = require('./getCred');
const { getLCUWebSocket } = require("./websocket");

let socket = null;

function setSocket(sc){
    socket = sc;
}

//const ws = getLCUWebSocket();
async function get_auth_info(req, res){
    const credentials = await get_raw_auth();
    res.json(serializeResponse(credentials));
}
async function user_info(req, res){
    if(apiCache.has("user_info")){
        log(ConsoleColor.cyan("[API][CACHE][USERINFO] Cache hit"));
        let userData = apiCache.get("user_info");
        res.json(serializeResponse(userData));
    }else{
        log(ConsoleColor.cyan("[API][CACHE][USERINFO] Cache miss"));
        const credentials = await get_raw_auth();
        const session = await lc.createHttpSession(credentials)
        const userData = await lc.createHttp2Request({
            method: 'GET',
            url: '/lol-summoner/v1/current-summoner'
        }, session, credentials);
        session.close()
        //console.log(userData.json());
        let data = userData.json();
        const session2 = await lc.createHttpSession(credentials)
        const userData2 = await lc.createHttp2Request({
            method: 'GET',
            url: '/lol-summoner/v1/current-summoner/summoner-profile'
        }, session2, credentials);
        session2.close()
        const session3 = await lc.createHttpSession(credentials)
        const skinData = await lc.createHttp2Request({
            method: 'GET',
            url: '/lol-champions/v1/inventories/' + data.summonerId + '/skins-minimal'
        }, session3, credentials);
        session3.close()
        let skins = []
        skinData.json().forEach((skin) => {
            if(skin.ownership.owned == true){
                skins.push(skin)
            }
        })
        data.backgroundSkinId = userData2.json().backgroundSkinId;
        data.skins = skins
        if(apiCache.set("user_info", data)){
            log(ConsoleColor.cyan("[API][CACHE][USERINFO] Setted cache"));
        }else{
            log(ConsoleColor.red("[API][CACHE][USERINFO][ERROR] Could not set cache"));
        }
        res.json(serializeResponse(data));
    }
    
}
async function isInLobby(req, res){
    const credentials = await get_raw_auth();
    const session = await lc.createHttpSession(credentials)
    const isInLobbyData = await lc.createHttp2Request({
        method: 'GET',
        url: '/lol-lobby/v2/party-active'
    }, session, credentials);
    session.close()
    //console.log(userData.json());
    res.json(serializeResponse(isInLobbyData.json()));
}
async function _isInLobby(req, res){
    const credentials = await get_raw_auth();
    const session = await lc.createHttpSession(credentials)
    const isInLobbyData = await lc.createHttp2Request({
        method: 'GET',
        url: '/lol-lobby/v2/party-active'
    }, session, credentials);
    session.close()
    //console.log(userData.json());
    return isInLobbyData.json();
}
async function queues(req, res){
    if(apiCache.has("queues")){
        log(ConsoleColor.greenBright("[API][CACHE][QUEUES] Cache hit"));
        let queueData = apiCache.get("queues");
        res.json(serializeResponse(queueData));
    }else{
        log(ConsoleColor.greenBright("[API][CACHE][QUEUES] Cache miss"));
        const credentials = await get_raw_auth();
        const session = await lc.createHttpSession(credentials)
        const queueData = await lc.createHttp2Request({
            method: 'GET',
            url: '/lol-game-queues/v1/queues'
        }, session, credentials);
        session.close()
        //console.log(userData.json());
        if(apiCache.set("queues", queueData.json())){
            log(ConsoleColor.greenBright("[API][CACHE][QUEUES] Setted cache"));
        }else{
            log(ConsoleColor.greenBright("[API][CACHE][QUEUES][ERROR] Could not set cache"));
        }
        res.json(serializeResponse(queueData.json()));
    }
}
async function createLobby(req, res){
    log(ConsoleColor.green("[API][CREATE-LOBBY] Checking if provided queueId is valid..."));
    const queueId = req.body.qId;
    if(queueId){
        const credentials = await get_raw_auth();
        const session = await lc.createHttpSession(credentials)
        const queueData = await lc.createHttp2Request({
            method: 'GET',
            url: '/lol-game-queues/v1/queues/' + queueId
        }, session, credentials);
        session.close()
        if(!queueData.ok){
            log(ConsoleColor.red("[API][CREATE-LOBBY][ERROR] The provided queueId is invalid."))
            res.json(serializeResponse(null, 400, "The provided queueId is invalid."));
            return;
        }
    }else{
        log(ConsoleColor.red("[API][CREATE-LOBBY][ERROR] No queueId provided."))
        res.json(serializeResponse(null, 400, "No queueId provided in the body of the request."));
        return;
    }
    log(ConsoleColor.green("[API][CREATE-LOBBY] The provided queueId is valid. Creating lobby.."))
    const credentials = await get_raw_auth();
    const lobbyData = await lc.createHttp1Request({
        method: 'POST',
        url: '/lol-lobby/v2/lobby',
        body: {
            "queueId": queueId
        }
    }, credentials);
    /*const session = await lc.createHttpSession(credentials)
    const lobbyData = await lc.createHttp2Request({
        method: 'POST',
        url: '/lol-lobby/v2/lobby',
        body: {
            "queueId": queueId
        }
    }, session, credentials);
    session.close()*/
    if(lobbyData.ok){
        log(ConsoleColor.green("[API][CREATE-LOBBY] Lobby created succesfully"))
        res.json(serializeResponse(null, 200, "Lobby created succesfully"));
        // emit socketio as successfull lobby creation to nav and all that
    }else{
        log(ConsoleColor.red("[API][CREATE-LOBBY][ERROR] Lobby could not be created"))
        res.json(serializeResponse(null, 500, "Lobby could not be created"));
    }
    
}
async function getAsset(req, res){
    log(ConsoleColor.greenBright("[API][GET-ASSET] Checking if plugin and path are provided.."));
    const assetPlugin = req.body.plugin;
    const assetPath = req.body.path;
    if(assetPlugin && assetPath){
        log(ConsoleColor.greenBright("[API][GET-ASSET] Plugin and path provided. Returning asset.."));
        if(apiCache.has("asset/" + assetPlugin+ "" + assetPath)){
            log(ConsoleColor.greenBright("[API][CACHE][GET-ASSET] Cache hit for /" + assetPlugin + "/assets" + assetPath));
            let queueData = apiCache.get("asset/" + assetPlugin+ "" + assetPath);
            res.set("Content-Type", "image/jpeg")
            res.send(queueData);
        }else{
            const credentials = await get_raw_auth();
            const assetData = await lc.createHttp1Request({
                method: 'GET',
                url: '/' + assetPlugin + '/assets' + assetPath
            }, credentials);
            if(assetData.ok){
                if(apiCache.set("asset/" + assetPlugin+ "" + assetPath, assetData.buffer())){
                    log(ConsoleColor.greenBright("[API][CACHE][GET-ASSSET] Setted cache for /" + assetPlugin + "/assets" + assetPath));
                }else{
                    log(ConsoleColor.red("[API][CACHE][GET-ASSSET] Could not set cache for /" + assetPlugin + "/assets" + assetPath));
                }
                res.set("Content-Type", "image/jpeg")
                res.send(assetData.buffer())
                
            }else{
                log(ConsoleColor.green("[API][GET-ASSET][ERROR] No asset with provided combination can be retrieved"));
                res.status(404).send('No Asset with the provided plugin/path combination exists')
            }
        }
        
        
    }else{
        log(ConsoleColor.red("[API][GET-ASSET][ERROR] No assetPlugin/assetPath provided."))
        res.json(serializeResponse(null, 400, "No assetPlugin/assetPath provided."));
        return;
    }
}
async function exitLobby(req, res){
    log(ConsoleColor.green("[API][EXIT-LOBBY] Checking if user is in Lobby..."));
    let isInLobbyBool = await _isInLobby();
    if(!isInLobbyBool){
        log(ConsoleColor.error("[API][EXIT-LOBBY][ERROR] User is not in a lobby."))
        res.json(serializeResponse(null, 404, "User is not in a lobby."));
        return;
    }
    log(ConsoleColor.green("[API][EXIT-LOBBY][INFO] User is currently in Lobby. Exiting..."))
    const credentials = await get_raw_auth();
    const lobbyData = await lc.createHttp1Request({
        method: 'DELETE',
        url: '/lol-lobby/v2/lobby'
    }, credentials);
    /*const session = await lc.createHttpSession(credentials)
    const lobbyData = await lc.createHttp2Request({
        method: 'POST',
        url: '/lol-lobby/v2/lobby',
        body: {
            "queueId": queueId
        }
    }, session, credentials);
    session.close()*/
    if(lobbyData.status == 204){
        log(ConsoleColor.green("[API][EXIT-LOBBY] Exited from lobby succesfully"))
        res.json(serializeResponse(null, 200, "Exited from lobby succesfully"));
        // emit socketio as successfull lobby creation to nav and all that
    }else{
        log(ConsoleColor.red("[API][EXIT-LOBBY][ERROR] Could not exit from lobby"))
        res.json(serializeResponse(null, 500, "Could not exit from lobby"));
    }
    
}
async function getLobbyInfo(req, res){
    const credentials = await get_raw_auth();
    const session = await lc.createHttpSession(credentials)
    const userData = await lc.createHttp2Request({
        method: 'GET',
        url: '/lol-lobby/v2/lobby'
    }, session, credentials);
    session.close()
    //console.log(userData.json());
    res.json(serializeResponse(userData.json()));
}

function serializeResponse(data, responseCode = 200, responseMessage = "OK"){
    return {"response": {"code": responseCode, "message": responseMessage}, "payload": data};
}

async function get_raw_auth(){
    if(apiCache.has("auth_info")){
        log(ConsoleColor.cyanBright("[API][CACHE][AUTH] Cache hit"))
        return apiCache.get("auth_info");
    }else{
        let authInfo = await getCred();
        if(apiCache.set("auth_info", authInfo)){
            log(ConsoleColor.cyanBright("[API][CACHE][AUTH] Setted cache"));
        }else{
            log(ConsoleColor.red("[API][CACHE][AUTH] Could not set cache"));
        }
        return authInfo;
    }
}
async function initSubs(){
    const ws = await getLCUWebSocket();
    ws.subscribe('/lol-matchmaking/v1/search', (data, event) => {
        let eventType = event.eventType;
        let searchState = event.data.searchState;
        if(eventType == "Delete"){
            // search stopped
            console.log("[API][WS][CLIENT][MATCHMAKING] Search STOPPED");
        }else if(eventType == "Create"){
            // search started
            console.log("[API][WS][CLIENT][MATCHMAKING] Search STARTED");
        }else if(eventType == "Update"){
            // update. searchState vagy Searching, vagy Found
            // readycheck vagy Invalid, vagy InProgress
            if(searchState == "Found"){
                let readycheckState = event.data.readyCheck.state;
                console.log("[API][WS][CLIENT][MATCHMAKING] Match found, showing ready check.");
                console.log("Ready Check state: " + readycheckState);
            }
        }
        console.log("eventType: " + eventType)
        console.log("searchState: " + event.data.searchState)
        
        //console.log( JSON.stringify(event) )
        /*
        EVENT
        {
            "data": {
                "dodgeData":{
                    "dodgerId":0,
                    "state":"Invalid"
                },
                "errors":[],
                "estimatedQueueTime":45.2920036315918,
                "isCurrentlyInQueue":true,
                "lobbyId":"",
                "lowPriorityData":{
                    "bustedLeaverAccessToken":"",
                    "penalizedSummonerIds":[],
                    "penaltyTime":0,
                    "penaltyTimeRemaining":0,
                    "reason":""
                },
                "queueId":430,
                "readyCheck":{
                    "declinerIds":[],
                    "dodgeWarning":"None",
                    "playerResponse":"None",
                    "state":"Invalid",
                    "suppressUx":false,
                    "timer":0
                },
                "searchState":"Searching",
                "timeInQueue":2
            },
            "eventType":"Update",
            "uri":"/lol-matchmaking/v1/search"
        }
        */
    })
    ws.subscribe('/lol-lobby/v2/lobby', (data, event) => {
        let eventType = event.eventType;
        if(eventType == "Delete"){
            log(ConsoleColor.green("[API][WS][CLIENT][LOBBY] Exited from lobby"))
            socket.emit("exitedLobby");
        }else if(eventType == "Create"){
            log(ConsoleColor.green("[API][WS][CLIENT][LOBBY] Created lobby"))
            socket.emit("createdLobby");
        }
        // poziciok: UTILITY - support, MIDDLE - mid, BOTTOM - bot, TOP - top, JUNGLE - jg
        /*console.log("LOBBY EVENT:")
        console.log(JSON.stringify(event));*/

        /* 
            EVENT
            {	
                "data": {	
                    "canStartActivity": true,	
                    "gameConfig": {	
                        "allowablePremadeSizes": [	
                            1,	
                            2,	
                            3,	
                            4,	
                            5	
                        ],	
                        "customLobbyName": "Custom Lobby",	
                        "customMutatorName": "",	
                        "customRewardsDisabledReasons": [],	
                        "customSpectatorPolicy": "NotAllowed",	
                        "customSpectators": [],	
                        "customTeam100": [],	
                        "customTeam200": [],	
                        "gameMode": "CLASSIC",	
                        "isCustom": false,	
                        "isLobbyFull": false,	
                        "isTeamBuilderManaged": false,	
                        "mapId": 11,	
                        "maxHumanPlayers": 0,	
                        "maxLobbySize": 5,	
                        "maxTeamSize": 5,	
                        "pickType": "",	
                        "premadeSizeAllowed": true,	
                        "queueId": 400,	
                        "shouldForceScarcePositionSelection": false,	
                        "showPositionSelector": true	
                    },	
                    "invitations": [	
                    {	
                        "invitationId": "",	
                        "invitationType": "invalid",	
                        "state": "Accepted",	
                        "timestamp": "0",	
                        "toSummonerId": 64053626,	
                        "toSummonerName": "TheNoscopeMaster"	
                    }	
                    ],	
                    "localMember": {	
                        "allowedChangeActivity": true,	
                        "allowedInviteOthers": true,	
                        "allowedKickOthers": true,	
                        "allowedStartActivity": true,	
                        "allowedToggleInvite": true,	
                        "autoFillEligible": true,	
                        "autoFillProtectedForPromos": false,	
                        "autoFillProtectedForSoloing": false,	
                        "autoFillProtectedForStreaking": false,	
                        "botChampionId": 0,	
                        "botDifficulty": "NONE",	
                        "botId": "",	
                        "firstPositionPreference": "UTILITY",	
                        "isBot": false,	
                        "isLeader": true,	
                        "isSpectator": false,	
                        "primaryChampionPreference": 0,	
                        "puuid": "9ab90b48-f886-581f-bcfa-84445faeb107",	
                        "ready": true,	
                        "secondPositionPreference": "MIDDLE",	
                        "secondaryChampionPreference": 0,	
                        "showGhostedBanner": false,	
                        "summonerIconId": 4380,	
                        "summonerId": 64053626,	
                        "summonerInternalName": "TheNoscopeMaster",	
                        "summonerLevel": 244,	
                        "summonerName": "TheNoscopeMaster",	
                        "teamId": 0	
                    },	
                    "members": [	
                        {	
                            "allowedChangeActivity": true,	
                            "allowedInviteOthers": true,	
                            "allowedKickOthers": true,	
                            "allowedStartActivity": true,	
                            "allowedToggleInvite": true,	
                            "autoFillEligible": true,	
                            "autoFillProtectedForPromos": false,	
                            "autoFillProtectedForSoloing": false,	
                            "autoFillProtectedForStreaking": false,	
                            "botChampionId": 0,	
                            "botDifficulty": "NONE",	
                            "botId": "",	
                            "firstPositionPreference": "UTILITY",	
                            "isBot": false,	
                            "isLeader": true,	
                            "isSpectator": false,	
                            "primaryChampionPreference": 0,	
                            "puuid": "9ab90b48-f886-581f-bcfa-84445faeb107",	
                            "ready": true,	
                            "secondPositionPreference": "MIDDLE",	
                            "secondaryChampionPreference": 0,	
                            "showGhostedBanner": false,	
                            "summonerIconId": 4380,	
                            "summonerId": 64053626,	
                            "summonerInternalName": "TheNoscopeMaster",	
                            "summonerLevel": 244,	
                            "summonerName": "TheNoscopeMaster",	
                            "teamId": 0	
                        }	
                    ],	
                    "mucJwtDto": {	
                        "channelClaim": "",	
                        "domain": "",	
                        "jwt": "",	
                        "targetRegion": ""	
                    },	
                    "multiUserChatId": "8e648be5-5a54-47d7-bce3-e6d32f3dc25d",	
                    "multiUserChatPassword": "8e648be5-5a54-47d7-bce3-e6d32f3dc25d",	
                    "partyId": "8e648be5-5a54-47d7-bce3-e6d32f3dc25d",	
                    "partyType": "closed",	
                    "restrictions": [],	
                    "scarcePositions": [	
                        "BOTTOM",	
                        "UTILITY"	
                    ],	
                    "warnings": []	
                },	
                "eventType": "Update",	
                "uri": "/lol-lobby/v2/lobby"	
            }
        */
    })
}
async function getResources(){
    const credentials = await get_raw_auth();
    const session = await lc.createHttpSession(credentials)
    const resources = await lc.createHttp2Request({
        method: 'GET',
        url: '/lol-lobby/v2/lobby'
    }, session, credentials);
    session.close()
    //console.log(userData.json());
    res.json(serializeResponse(userData.json()));
}

exports.get_auth_info = get_auth_info;
exports.user_info = user_info;
exports.queues = queues; 
exports.initSubs = initSubs;
exports.createLobby = createLobby;
exports.setSocket = setSocket;
exports.getLobbyInfo = getLobbyInfo;
exports.exitLobby = exitLobby;
exports.isInLobby = isInLobby;
exports.getAsset = getAsset;