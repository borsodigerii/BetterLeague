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
async function getUserInfobyId(req, res){
    /*if(apiCache.has("user_info")){
        log(ConsoleColor.cyan("[API][CACHE][USERINFO] Cache hit"));
        let userData = apiCache.get("user_info");
        res.json(serializeResponse(userData));
    }else{*/
        //log(ConsoleColor.cyan("[API][CACHE][USERINFO] Cache miss"));
        const summonerId = req.body.summonerId;
        if(summonerId){
            const credentials = await get_raw_auth();
            const session = await lc.createHttpSession(credentials)
            const userData = await lc.createHttp2Request({
                method: 'GET',
                url: '/lol-summoner/v1/summoners/' + summonerId
            }, session, credentials);
            session.close()
            //console.log(userData.json());
            //let data = userData.json();
            if(userData.ok){
                res.json(serializeResponse(userData.json()));
            }else{
                log(ConsoleColor.red("[API][GET-USER-BY-SUMM-ID][ERROR] No user with given summonerId exists."))
                res.json(serializeResponse(null, 400, "No user with given summonerId exists."));
                return;
            }
            
        }else{
            log(ConsoleColor.red("[API][GET-USER-BY-SUMM-ID][ERROR] No summonerId provided."))
            res.json(serializeResponse(null, 400, "No summonerId provided in the body of the request."));
            return;
        
        }
        
    //}
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

async function _isInMatchMaking(){
    const credentials = await get_raw_auth();
    const session = await lc.createHttpSession(credentials)
    const isInLobbyData = await lc.createHttp2Request({
        method: 'GET',
        url: '/lol-lobby/v2/lobby/matchmaking/search-state'
    }, session, credentials);
    session.close()
    //console.log(userData.json());
    if(isInLobbyData.json().searchState != "Invalid") return true
    return false
    //return isInLobbyData.json();
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
            log(ConsoleColor.red("[API][CACHE][QUEUES][ERROR] Could not set cache"));
        }
        res.json(serializeResponse(queueData.json()));
    }
}
async function getQueueById(queueid){
    if(apiCache.has("queue_" + queueid)){
        log(ConsoleColor.greenBright("[API][CACHE][QUEUE_" + queueid + "] Cache hit"));
        let queueData = apiCache.get("queue_" + queueid);
        //res.json(serializeResponse(queueData)); 
        return queueData;
    }else{
        log(ConsoleColor.greenBright("[API][CACHE][QUEUE_" + queueid + "] Cache miss"));
        const credentials = await get_raw_auth();
        const session = await lc.createHttpSession(credentials)
        const queueData = await lc.createHttp2Request({
            method: 'GET',
            url: 'lol-game-queues/v1/queues/' + queueid
        }, session, credentials);
        session.close()
        //console.log(userData.json());
        if(apiCache.set("queue_" + queueid, queueData.json())){
            log(ConsoleColor.greenBright("[API][CACHE][QUEUE_" + queueid + "] Setted cache"));
        }else{
            log(ConsoleColor.red("[API][CACHE][QUEUE_" + queueid + "][ERROR] Could not set cache"));
        }
        //res.json(serializeResponse(queueData.json()));
        return queueData.json();
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
        log(ConsoleColor.red("[API][EXIT-LOBBY][ERROR] User is not in a lobby."))
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
    const lobbyFetch = await lc.createHttp2Request({
        method: 'GET',
        url: '/lol-lobby/v2/lobby'
    }, session, credentials);
    session.close()
    //console.log(userData.json());
    let lobbyData = lobbyFetch.json();
    let queueId = lobbyData.gameConfig.queueId;
    
    let queueData = await getQueueById(queueId);
    //log(queueData)
    lobbyData.gameConfig.queueData = queueData;
    res.json(serializeResponse(lobbyData));
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
                let data = {
                    timeLeft: event.data.readyCheck.timer
                }
                socket.emit("readyCheck", data)
            }else{
                let data = {
                    timeElapsed: event.data.timeInQueue,
                    timeEstimated: event.data.estimatedQueueTime
                }
                socket.emit("updatedLobbySearch", data)
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
            let lobbyDataCache = {
                gameMode: event.data.gameConfig.gameMode,
                mapId: event.data.gameConfig.mapId,
                queueId: event.data.gameConfig.queueId,
                maxTeamSize: event.data.gameConfig.maxTeamSize,
                maxLobbySize: event.data.gameConfig.maxLobbySize,
                partyType: event.data.partyType,
                //membersCount: Object.keys(event.data.members[i]).length
                membersCount: event.data.members.length,
                members: event.data.members
            }
            apiCache.set("lobbyUpdateData", lobbyDataCache)
            socket.emit("createdLobby");
        }else if(eventType == "Update"){
            log(ConsoleColor.red("[API][WS][CLIENT][LOBBY] Updated lobby"))
            let lobbyDataCache = {
                gameMode: event.data.gameConfig.gameMode,
                mapId: event.data.gameConfig.mapId,
                queueId: event.data.gameConfig.queueId,
                maxTeamSize: event.data.gameConfig.maxTeamSize,
                maxLobbySize: event.data.gameConfig.maxLobbySize,
                partyType: event.data.partyType,
                //membersCount: Object.keys(event.data.members[i]).length
                membersCount: event.data.members.length,
                members: event.data.members
            }
            if(JSON.stringify(apiCache.get("lobbyUpdateData")) != JSON.stringify(lobbyDataCache)){
                apiCache.set("lobbyUpdateData", lobbyDataCache)
                socket.emit("updatedLobby");
            }
            
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
async function startMatchmaking(req, res){
    log(ConsoleColor.magenta("[API][START-MATCHMAKING] Checking if user is in Lobby..."));
    let isInLobbyBool = await _isInLobby();
    if(!isInLobbyBool){
        log(ConsoleColor.red("[API][START-MATCHMAKING][ERROR] User is not in a lobby."))
        res.json(serializeResponse(null, 404, "User is not in a lobby."));
        return;
    }
    log(ConsoleColor.magenta("[API][START-MATCHMAKING][INFO] User is currently in Lobby. Starting search..."))
    const credentials = await get_raw_auth();
    const lobbyData = await lc.createHttp1Request({
        method: 'POST',
        url: '/lol-lobby/v2/lobby/matchmaking/search'
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
        log(ConsoleColor.green("[API][START-MATCHMAKING] Started matchmaking"))
        res.json(serializeResponse(null, 200, "Started matchmaking"));
        // emit socketio as successfull lobby creation to nav and all that
    }else{
        log(ConsoleColor.red("[API][START-MATCHMAKING][ERROR] Could not start matchmaking"))
        res.json(serializeResponse(null, 500, "Could not start matchmaking"));
    }
}
async function stopMatchmaking(req, res){
    log(ConsoleColor.magenta("[API][STOP-MATCHMAKING] Checking if user is in matchmaking..."));
    let isInMatchMakingBool = await _isInMatchMaking();
    if(!isInMatchMakingBool){
        log(ConsoleColor.red("[API][STOP-MATCHMAKING][ERROR] User is not in matchmaking."))
        res.json(serializeResponse(null, 404, "User is not in matchmaking."));
        return;
    }
    log(ConsoleColor.magenta("[API][STOP-MATCHMAKING][INFO] User is currently in matchmaking. Stopping search..."))
    const credentials = await get_raw_auth();
    const lobbyData = await lc.createHttp1Request({
        method: 'DELETE',
        url: '/lol-lobby/v2/lobby/matchmaking/search'
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
        log(ConsoleColor.green("[API][STOP-MATCHMAKING] Stopped matchmaking"))
        res.json(serializeResponse(null, 200, "Stopped matchmaking"));
        // emit socketio as successfull lobby creation to nav and all that
    }else{
        log(ConsoleColor.red("[API][STOP-MATCHMAKING][ERROR] Could not stop matchmaking"))
        res.json(serializeResponse(null, 500, "Could not stop matchmaking"));
    }
}
async function acceptReadyCheck(req, res){
    log(ConsoleColor.magenta("[API][ACCEPT-READY-CHECK] Checking if user is in matchmaking..."));
    let isInMatchMakingBool = await _isInMatchMaking();
    if(!isInMatchMakingBool){
        log(ConsoleColor.red("[API][ACCEPT-READY-CHECK][ERROR] User is not in matchmaking."))
        res.json(serializeResponse(null, 404, "User is not in matchmaking."));
        return;
    }
    log(ConsoleColor.magenta("[API][ACCEPT-READY-CHECK][INFO] User is currently in matchmaking. Accepting Ready Check..."))
    const credentials = await get_raw_auth();
    const lobbyData = await lc.createHttp1Request({
        method: 'POST',
        url: '/lol-matchmaking/v1/ready-check/accept'
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
        log(ConsoleColor.green("[API][ACCEPT-READY-CHECK] Accepted ready check"))
        res.json(serializeResponse(null, 200, "Accepted ready check"));
        // emit socketio as successfull lobby creation to nav and all that
    }else{
        log(ConsoleColor.red("[API][ACCEPT-READY-CHECK][ERROR] Could not accept ready check"))
        res.json(serializeResponse(null, 500, "Could not accept ready check"));
    }
}
async function declineReadyCheck(req, res){
    log(ConsoleColor.magenta("[API][DECLINE-READY-CHECK] Checking if user is in matchmaking..."));
    let isInMatchMakingBool = await _isInMatchMaking();
    if(!isInMatchMakingBool){
        log(ConsoleColor.red("[API][DECLINE-READY-CHECK][ERROR] User is not in matchmaking."))
        res.json(serializeResponse(null, 404, "User is not in matchmaking."));
        return;
    }
    log(ConsoleColor.magenta("[API][DECLINE-READY-CHECK][INFO] User is currently in matchmaking. Declining Ready Check..."))
    const credentials = await get_raw_auth();
    const lobbyData = await lc.createHttp1Request({
        method: 'POST',
        url: '/lol-matchmaking/v1/ready-check/decline'
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
        log(ConsoleColor.green("[API][DECLINE-READY-CHECK] Declined ready check"))
        res.json(serializeResponse(null, 200, "Declined ready check"));
        // emit socketio as successfull lobby creation to nav and all that
    }else{
        log(ConsoleColor.red("[API][DECLINE-READY-CHECK][ERROR] Could not decline ready check"))
        res.json(serializeResponse(null, 500, "Could not decline ready check"));
    }
}
async function getMap(req, res){
    log(ConsoleColor.green("[API][GET-MAP] Checking if provided mapId is valid..."));
    const mapId = req.body.mapID;
    //console.log(req.body)
    log(ConsoleColor.green("[API][GET-MAP] Provided mapId: " + req.body.mapID))
    if(mapId){
        // van mapId
        if(apiCache.has("map_" + mapId)){
            log(ConsoleColor.greenBright("[API][CACHE][MAP_" + mapId + "] Cache hit"));
            let mapData = apiCache.get("map_" + mapId);
            res.json(serializeResponse(mapData)); 
            //return mapData;
        }else{
            log(ConsoleColor.greenBright("[API][CACHE][MAP_" + mapId + "] Cache miss"));
            const credentials = await get_raw_auth();
            const session = await lc.createHttpSession(credentials)
            const mapData = await lc.createHttp2Request({
                method: 'GET',
                url: 'lol-maps/v1/map/' + mapId
            }, session, credentials);
            session.close()
            if(!mapData.ok){
                log(ConsoleColor.red("[API][GET-MAP][ERROR] The provided mapId is invalid."))
                res.json(serializeResponse(null, 400, "The provided mapId is invalid."));
                return;
            }
            if(apiCache.set("map_" + mapId, mapData.json())){
                log(ConsoleColor.greenBright("[API][CACHE][MAP_" + mapId + "] Setted cache"));
            }else{
                log(ConsoleColor.red("[API][CACHE][MAP_" + mapId + "][ERROR] Could not set cache"));
            }
            res.json(serializeResponse(mapData.json()));
            //return queueData.json();
        }
    }else{
        log(ConsoleColor.red("[API][GET-MAP][ERROR] No mapId provided."))
        res.json(serializeResponse(null, 400, "No mapId provided in the body of the request."));
        return;
    }    
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
exports.startMatchmaking = startMatchmaking;
exports.stopMatchmaking = stopMatchmaking;
exports.acceptReadyCheck = acceptReadyCheck;
exports.declineReadyCheck = declineReadyCheck;
exports.getMap = getMap;
exports.getUserInfobyId = getUserInfobyId;