
// misfits server
'use strict';

// config
var port = 8001;

// load and initialize modules
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server, {
	cors: {
		origin: true,
		methods: ["GET", "POST"],
		credentials: false
	},
	pingTimeout: 60000,
	pingInterval: 25000
});

server.listen(port, function () {
	console.log('misfits server listening at port %d', port);
});

app.use(express.static(__dirname + '/'));

// global variables, keeps the state of the app
var sockets = {};
var users = {};
var strangerQueue = false;
var peopleActive = 0;
var peopleTotal = 0;

// Clean up function to remove disconnected users
function cleanupUser(socketId) {
    if (users[socketId]) {
        const connectedTo = users[socketId].connectedTo;
        
        // If user was connected to someone
        if (connectedTo !== -1 && users[connectedTo]) {
            users[connectedTo].connectedTo = -1;
            if (sockets[connectedTo]) {
                sockets[connectedTo].emit('disconn', { who: 2 });
            }
        }
        
        // Clear from queue if needed
        if (strangerQueue === socketId) {
            strangerQueue = false;
        }
        
        // Remove user data
        delete users[socketId];
        delete sockets[socketId];
        
        if (peopleActive > 0) peopleActive--;
        if (peopleTotal > 0) peopleTotal--;
        
        // Update all clients with new count
        io.sockets.emit('online', Math.max(0, peopleActive));
        console.log(timestamp(), Math.max(0, peopleActive), 'users online');
    }
}

// helper functions, for logging
function fillZero (val) {
	if (val > 9) return ""+val;
	return "0"+val;
}
function timestamp () {
	var now = new Date();
	return "["+fillZero(now.getHours())+":"+fillZero(now.getMinutes())+":"+fillZero(now.getSeconds())+"]";
}

// listen for connections
io.sockets.on('connection', function (socket) {
    console.log(timestamp(), 'New connection:', socket.id);

    // Handle reconnection - cleanup any existing session
    if (users[socket.id]) {
        cleanupUser(socket.id);
    }
    
    // store the socket and info about the user
    sockets[socket.id] = socket;
    users[socket.id] = {
        connectedTo: -1,
        isTyping: false
    };
    
    // count total and active users
    peopleTotal++;
    peopleActive++;
    
    // broadcast the counts to all clients
    io.sockets.emit('online', peopleActive);
    console.log(timestamp(), peopleTotal, 'total,', peopleActive, 'active');

	// When a new user connects, they start in queue
	strangerQueue = socket.id;
	
	// Emit a welcome message
	socket.emit('chat', 'Welcome! Click "New" to start chatting with someone.');

	socket.on("new", function () {
		console.log(timestamp(), socket.id, 'requested new chat');
		
		// If already connected to someone, disconnect first
		if (users[socket.id].connectedTo !== -1) {
			var oldConn = users[socket.id].connectedTo;
			if (sockets[oldConn]) {
				users[oldConn].connectedTo = -1;
				sockets[oldConn].emit('disconn', { who: 2 });
			}
			users[socket.id].connectedTo = -1;
		}

		// If someone is waiting in queue
		if (strangerQueue !== false && strangerQueue !== socket.id && users[strangerQueue] && users[strangerQueue].connectedTo === -1) {
			// Connect to the person in queue
			users[socket.id].connectedTo = strangerQueue;
			users[strangerQueue].connectedTo = socket.id;
			users[socket.id].isTyping = false;
			users[strangerQueue].isTyping = false;
			
			// Notify both users
			socket.emit('conn');
			sockets[strangerQueue].emit('conn');
			
			console.log(timestamp(), socket.id, 'connected to', strangerQueue);
			
			// Clear queue
			strangerQueue = false;
		} else {
			// No one in queue, join queue
			strangerQueue = socket.id;
			socket.emit('chat', 'Waiting for someone to connect...');
			console.log(timestamp(), socket.id, 'joined queue');
		}
	});
	
	// Conversation ended
	socket.on("disconn", function () {
		var connTo = users[socket.id].connectedTo;
		if (strangerQueue === socket.id || strangerQueue === connTo) {
			strangerQueue = false;
		}
		users[socket.id].connectedTo = -1;
		users[socket.id].isTyping = false;
		if (sockets[connTo]) {
			users[connTo].connectedTo = -1;
			users[connTo].isTyping = false;
			sockets[connTo].emit("disconn", {who: 2});
		}
		socket.emit("disconn", {who: 1});
		peopleActive -= 2;
		io.sockets.emit('online', peopleActive);
	});
	socket.on('chat', function (message) {
		if (users[socket.id].connectedTo !== -1 && sockets[users[socket.id].connectedTo]) {
			sockets[users[socket.id].connectedTo].emit('chat', message);
		}
	});
	socket.on('typing', function (isTyping) {
		if (users[socket.id].connectedTo !== -1 && sockets[users[socket.id].connectedTo] && users[socket.id].isTyping !== isTyping) {
			users[socket.id].isTyping = isTyping;
			sockets[users[socket.id].connectedTo].emit('typing', isTyping);
		}
	});

	socket.on("disconnect", function (err) {
		console.log(timestamp(), socket.id, 'disconnected');
		cleanupUser(socket.id);
		console.log(timestamp(), peopleActive, "users online");
	});
});
