const express = require('express');
const cors = require("cors");
const app = express(),
      bodyParser = require("body-parser");
      port = 3080;
const child_process = require("child_process");
const ConsoleColor = require("cli-color");
const log = console.log;
const repl = require("repl");
const kill = require("tree-kill");
const LCU_Api = require("./LCU/apiController");
//const lc = require("league-connect")
//const credentials = lc.authenticate();
//let client;

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const { Console } = require('console');
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000"
  }
})



let UIPROCESS;

app.use(cors({
  origin: 'http://localhost:3000'
}));
 
app.use(bodyParser.json());

app.get('/api/get-auth-info', (req, res) => {
  log(ConsoleColor.bgCyan(ConsoleColor.black('[API] GET: /get-auth-info')))
  LCU_Api.get_auth_info(req, res); 
});
app.get('/api/user-info', (req, res) => {
  log(ConsoleColor.bgCyan(ConsoleColor.black('[API] GET: /user-info')))
  LCU_Api.user_info(req, res);  
});
app.get('/api/queues', (req, res) => {
  log(ConsoleColor.bgGreen(ConsoleColor.black('[API] GET: /queues')))
  LCU_Api.queues(req, res);  
});
app.post('/api/create-lobby', (req, res) => {
  log(ConsoleColor.bgGreen(ConsoleColor.black('[API] POST: /create-lobby')))
  //log(req.body)
  LCU_Api.createLobby(req, res);
});
app.post('/api/exit-lobby', (req, res) => {
  log(ConsoleColor.bgGreen(ConsoleColor.black('[API] POST: /exit-lobby')))
  //log(req.body)
  LCU_Api.exitLobby(req, res);
});
app.post('/api/start-matchmaking', (req, res) => {
  log(ConsoleColor.bgMagenta(ConsoleColor.black('[API] POST: /start-matchmaking')))
  //log(req.body)
  LCU_Api.startMatchmaking(req, res);
});
app.post('/api/stop-matchmaking', (req, res) => {
  log(ConsoleColor.bgMagenta(ConsoleColor.black('[API] POST: /stop-matchmaking')))
  //log(req.body)
  LCU_Api.stopMatchmaking(req, res);
});
app.post('/api/accept-ready-check', (req, res) => {
  log(ConsoleColor.bgMagenta(ConsoleColor.black('[API] POST: /accept-ready-check')))
  //log(req.body)
  LCU_Api.acceptReadyCheck(req, res);
});
app.post('/api/decline-ready-check', (req, res) => {
  log(ConsoleColor.bgMagenta(ConsoleColor.black('[API] POST: /decline-ready-check')))
  //log(req.body)
  LCU_Api.declineReadyCheck(req, res);
});
app.get('/api/lobby', (req, res) => {
  log(ConsoleColor.bgGreen(ConsoleColor.black('[API] GET: /lobby')))
  LCU_Api.getLobbyInfo(req, res);  
});
app.get('/api/isInLobby', (req, res) => {
  log(ConsoleColor.bgGreen(ConsoleColor.black('[API] GET: /isInLobby')))
  LCU_Api.isInLobby(req, res);  
});
app.post("/api/get-asset", (req, res) => {
  log("[API][ASSET] GET: /get_asset")
  LCU_Api.getAsset(req, res)
})
  
app.get('/', (req,res) => {
    res.send('App Works !!!!');
});

app.listen(port, () => {
    log(`[SYS][INFO] Backend server listening on the port::${port}`);
    log('[SYS][INFO] Starting UI...')

    //client = new lc.LeagueClient(credentials);
    start_UI("npm", ["run", "dev"], "../better-league-ui/", function(output, exit_code) {
      log(ConsoleColor.blue("[UI][PROC] Process Finished."));
    });
    LCU_Api.initSubs();
});
server.listen(4000, () => {
  log(ConsoleColor.bgBlack(ConsoleColor.yellow("[SYS][SOCKET-IO][INFO] Socket.IO server listening on port :4000")))
})
io.on("connection", (socket) => {
  log(ConsoleColor.bgBlack(ConsoleColor.yellow("[SYS][SOCKET-IO][INFO] UI connected")))
  LCU_Api.setSocket(socket)
})
function start_UI(command, args, cwdString, callback) {
  //log("Starting Process.");
  if(command == "npm"){
    UIPROCESS = child_process.spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', args, {cwd: cwdString});
  }else{
    UIPROCESS = child_process.spawn(command, args, {cwd: cwdString});
  }
  

  var scriptOutput = "";

  UIPROCESS.stdout.setEncoding('utf8');
  UIPROCESS.stdout.on('data', function(data) {
      log(ConsoleColor.blue('[UI][INFO] ' + data));
      data=data.toString();
      scriptOutput+=data;
  });

  UIPROCESS.stderr.setEncoding('utf8');
  UIPROCESS.stderr.on('data', function(data) {
      log(ConsoleColor.red('[UI][ERROR] ' + data));

      data=data.toString();
      scriptOutput+=data;
  });

  UIPROCESS.on('close', function(code) {
      callback(scriptOutput,code);
  });
}
async function stopServer(){
  log(ConsoleColor.yellow("[SYS][INFO] Stopping command received"));
  UIPROCESS.stdin.pause();
  UIPROCESS.stdout.pause();
  UIPROCESS.stdin.end();
  kill(UIPROCESS.pid);
  setTimeout(() => {
    log(ConsoleColor.green("[SYS][UI][PROC] UI process stopped, exiting."))
    process.exit(0)
  }, 1000);
}

const cli = repl.start();
const defineCommands = commands => cli => {
  Object.entries(commands).forEach(([k, v]) => {
    cli.defineCommand(k, v);
  });
};
defineCommands({
  stop: {
    help: "stops the program, and terminates the UI",
    action() {
      stopServer();
    },
  },
})(cli);
defineCommands({
  reset_ui: {
    help: "resets the UI",
    action() {
      log(ConsoleColor.yellow("[UI][PROC] Restarting instance..."))
      kill(UIPROCESS.pid);
      setTimeout(function(){
        start_UI("npm", ["run", "dev"], "../better-league-ui/", function(output, exit_code) {
          log(ConsoleColor.blue("[UI][INFO] Process Finished."));
        });
        log(ConsoleColor.green("[UI][PROC] Restart completed."));
      }, 2000);
      
    },
  },
})(cli);