const { app, BrowserWindow } = require('electron')
const path = require('node:path')
const lc = require("league-connect")
const ConsoleColor = require("cli-color");
const child_process = require("child_process");
const kill = require("tree-kill");
//const { default: urlExist } = require('url-exist');

// SOCKET:IO
const { io } = require("socket.io-client")

let socket = io("http://localhost:4000", {
    auth: {
        token: "electron"
    }
})

let BACKENDPROCESS;

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1360,
        height: 768,
        frame: false,
        resizable: false
    })

    //win.loadURL('http://localhost:3000')
    win.loadFile("loading.html");

    checkAndReplace(win)
}

const checkAndReplace = async (win) => {
    //let urlModul = await import("url-exist");
    import("url-exist").then(async ({default: urlExist}) => {
        let result = await urlExist("http://localhost:3000");
        
        if(!result){
            setTimeout(() => {
                checkAndReplace(win)
            }, 250);
            
        }else{
            win.loadURL("http://localhost:3000")
            socket.connect()
        }
        
    })
}

app.whenReady().then(() => {
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
    
    launchBackendUI();
    
})

app.on('window-all-closed', () => {
    //if (process.platform !== 'darwin') app.quit()
    killAndQuit();
})

socket.on("connect", () => {
    console.log(ConsoleColor.yellow("[APP][SOCKET-IO] Connected to backend"))
})
socket.on("closeApplication", () => {
    console.log(ConsoleColor.green("[APP][SOCKET-IO] Received closing signal, initiating close"))
    killAndQuit();
})

const killAndQuit = async () => {
    //let response = await fetch('http://localhost:3080/api/stop-application', {method: "POST"})
    console.log(ConsoleColor.green("[APP] Close initiated, attempting to kill backend and UI..."))
    BACKENDPROCESS.stdin.pause();
    BACKENDPROCESS.stdout.pause();
    BACKENDPROCESS.stdin.end();
    kill(BACKENDPROCESS.pid, 'SIGTERM', (error) => {
        if(error == undefined){
            // no errors, we are safe to quit
            console.log(ConsoleColor.green("[APP] Both processes were killed sucessfully. Good bye :)"))
            app.quit()
        }else{
            console.log(ConsoleColor.red("[APP] Could not stop the backend/UI, some errors have happened: " + error.message))
            return;
        }
    })
    //console.log(response)
    //app.quit()
}

const waitForClient = async () => {
    console.log(ConsoleColor.white("[APP] Looking for League client.."));
    let clientCredentials = await lc.authenticate({
      awaitConnection: true,
      pollInterval: 5000,
    });
    //clientCredentials.password = clientCredentials.password.replace("--app-port", "")
    const client = new lc.LeagueClient(clientCredentials)
    console.log(ConsoleColor.green("[APP] Client found! Credentials: " + clientCredentials.password.toString()));
    
    return true;
}

const launchBackendUI = async () => {
    if(await waitForClient()){
        console.log(ConsoleColor.green("[APP] Starting backend and UI..."));
        start_BACKEND("npm", ["run", "dev"], "../better-league-backend/", function(output, exit_code) {
            console.log(ConsoleColor.blue("[BACKEND][PROC] Process Finished."));
          });
        createWindow();
    }
}

function start_BACKEND(command, args, cwdString, callback) {
    //log("Starting Process.");
    if(command == "npm"){
      BACKENDPROCESS = child_process.spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', args, {cwd: cwdString});
    }else{
      BACKENDPROCESS = child_process.spawn(command, args, {cwd: cwdString});
    }
    
  
    var scriptOutput = "";
  
    BACKENDPROCESS.stdout.setEncoding('utf8');
    BACKENDPROCESS.stdout.on('data', function(data) {
        console.log(ConsoleColor.blue('[BACKEND] ' + data));
        data=data.toString();
        scriptOutput+=data;
    });
  
    BACKENDPROCESS.stderr.setEncoding('utf8');
    BACKENDPROCESS.stderr.on('data', function(data) {
        console.log(ConsoleColor.red('[BACKEND][ERROR] ' + data));
  
        data=data.toString();
        scriptOutput+=data;
    });
  
    BACKENDPROCESS.on('close', function(code) {
        callback(scriptOutput,code);
    });
  }

  