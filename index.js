const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server);

//sets up each client tht loads the HTML page
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

//listens for each time a new client connects t othe server via lading index.html in browser tab
io.on("connection", (socket) => {
    socket.on("username",(username)=>{
        socket.broadcast.emit(`${username} connected`, username);
        console.log(`${username} has connected`);

        //send out an event called "connection" to all registered clients
        // io.emit("connection", "a new user connected");
        
        //send "user joined" to all sockets/clients EXCEPT the one that just connected
        socket.on('connection', () => {
            const innerHTML = `<strong>${username} joined the chat</strong>`
            socket.broadcast.emit("chat message", innerHTML);
        });

        //send a 'welcome' event to just the socket that connected
        // socket.emit("welcome","Welcome new user!")

        socket.on('isTyping',()=>{
            const innerHTML = `<p>${username} is typing...</p>`
            socket.broadcast.emit("isTyping",innerHTML)
        })

        socket.on('notTyping',()=>{
            socket.broadcast.emit("notTyping")
        })

        socket.on('chat message', (msg) => {
            console.log(`${username}: ${msg}`);
            const innerHTML = `<strong>${username}</strong> <p>${msg}</p>`
            io.emit("chat message", innerHTML);
        });

        //response to the automatic disconnect event (fired when closing or regreshing a tab)
        socket.on('disconnect', () => {
            socket.broadcast.emit("disconnected", username);
            const innerHTML = `<strong>${username} has left the chat</strong>`
            io.emit("chat message", innerHTML);
            console.log(`${username} disconnected`);
        });
    })
    
});

server.listen(3000, () => {
    console.log("listening on *:3000");
});
