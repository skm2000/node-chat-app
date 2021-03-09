const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const fs = require('fs')
const Filter = require('bad-words')
const { generateMessages } = require('./utils/messages')
const { addUser,removeUser,getUser,getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

/* let count  = 0

// * fires whenever a socketio gets a new connection (new client connects)
io.on('connection',(socket)=>{
    console.log('New Websocket connection')

    socket.emit('countUpdated', count)

    socket.on('increment',()=> {
        count++
        // socket.emit('countUpdated', count) //* to send the data to the particular client
        // * to send the data to every connected client
        io.emit('countUpdated', count)
    })
})
*/

io.on('connection',(socket)=>{
    console.log('New Websocket connection')

    

    socket.on('join', ({ username,room }, callback) => {

        const {error,user} = addUser({id: socket.id, username, room})
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message',generateMessages('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessages(user.username,`${user.username} has joined the ${user.room} room`))
        io.to(user.room).emit('roomData',{
            room : user.room,
            users : getUsersInRoom(user.room)
        })

        callback()

    })


    let check = 'no';


    socket.on('sendMessage',(message,callback) => {

        const user = getUser(socket.id)
        const filter = new Filter();
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }

        if(message.startsWith('broadcast')){
            check = 'broadcast';
            console.log('broadcast');
            io.emit('message', generateMessages(user.username,message))
        }else{
            io.to(user.room).emit('message', generateMessages(user.username,message))
        }

        callback()
    })

    socket.on('shareLocation', (coords,callback) => {

        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', {
            username : user.username,
            url : `https://google.com/maps?q=${coords.latitude},${coords.longitude}`,
            createdAt : new Date().getTime()
        })
        callback()

    })

    socket.on('sendImage', (image,callback) => {
        
        const user = getUser(socket.id)
        if(check == 'broadcast'){
            io.emit('image',{
                username : user.username,
                image : image,
                createdAt : new Date().getTime()
            })
            check = 'no'
        }else{
            io.to(user.room).emit('image',{
                username : user.username,
                image : image,
                createdAt : new Date().getTime()
            })
        }
        callback()
    })

    socket.on('disconnect', () => {

        const user = removeUser(socket.id)
        if(user){   
            io.to(user.room).emit('message',generateMessages(`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room : user.room,
                users : getUsersInRoom(user.room)
            })
        }
    })
})



server.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})

// https://shubham-node-chat-app.herokuapp.com