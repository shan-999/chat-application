const express = require('express')
const http = require('http')
const app = express()
const path = require('path')
const PORT = 3000
const socketio = require('socket.io') 
const server = http.createServer(app)
const io = socketio(server)
const formatMessage = require('./utils/message')
const {userJoin,getCurrentUser,userLeave,getRoomUser} = require('./utils/users')

const botName = 'Mammotty'

app.use(express.static(path.join(__dirname,'public')))

io.on('connection',socket => {
    console.log('New ws connection...');


    //for join room 

    socket.on('joinRoom',({username,room}) => {

        const user = userJoin(socket.id, username, room)

        socket.join(user.room)

        socket.emit('message',formatMessage(botName,'Hi welcom my chat app'))

        socket.broadcast.to(user.room).emit('message', formatMessage(botName,`${user.username} joined chat`))


        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUser(user.room)
        })
    })
    
    
    // show chat messages
    socket.on('chatMessage',(msg) => {
        const user = getCurrentUser(socket.id)

        io.to(user.room).emit('message',formatMessage(user.username, msg))
    })



    // disconnect
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)

        if(user){
            io.to(user.room).emit('message',formatMessage(botName,`${user.username} left the chat`))

            io.to(user.room).emit('roomUsers',{
                room: user.room,
                users: getRoomUser(user.room)
            })
        }
    })
})

server.listen(PORT, () => console.log(`server runnig on port ${PORT}`))