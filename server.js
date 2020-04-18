var webSocketServer = require('ws').Server;
var wss = new webSocketServer({port: 9001});
var users = 0;
var figureList = [];
var clients = [];

wss.on('connection', connection);

function connection(ws) {
    clients.push(ws);
    users++;
    console.log('Sending initial Data');
    ws.on('message', incoming);
}

function incoming (message) {
    console.log('Message received: %s', message);
    if (isJson(message)) {
        //Contains the data of the created figure
        var obj = JSON.parse(message);
        //Add figure to list
        figureList.push(obj);

        wss.broadcast = broadcast(createObjectToSend(false), false, this);
    }
    //Plain message, not object. In this case, "connection open".
    else {
        wss.broadcast = broadcast(createObjectToSend(true), true, this);
    }
}

function broadcast(data, firstConnection, sentBy) {
    console.log('Broadcasting data');
    console.log('Clients: ' +  clients.length);
    if (firstConnection) {
        for (var i in clients) {
            if (clients[i] != sentBy) {
                clients[i].send(createObjectOnlyUsers())
            }else {
                clients[i].send(data);
            }
        }
    }else {
        for (var i in clients) {
            clients[i].send(data);
        }
    }
}

function isJson(str) {
    try {
        JSON.parse(str);
    }catch (e) {
        return false;
    }
    return true;
}

function createObjectToSend(firstConnection) {
    if (firstConnection) {
        return JSON.stringify({'figures': figureList, 'users': users});
    }
    var aux = figureList[figureList.length-1];
    return JSON.stringify({'figures': [aux], 'users': users});
}

function createObjectOnlyUsers() {
    return JSON.stringify({'figures': [], 'users': users});
}