const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const expressValidator = require('express-validator')
const http = require('http')
const { Server } = require('socket.io')
require('dotenv').config()

//import routes
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const categoryRoutes = require('./routes/category')
const productRoutes = require('./routes/product')
const brainTreeRoutes = require('./routes/braintree')
const orderRoutes = require('./routes/order')


//app
const app = express()
const server = http.createServer(app)

//socket.io
const io = new Server(server, {
    path: '/socketchat/',
    cors:{
        origin: 'http://localhost:3000',
        methods: ['GET','POST']
    }
})

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`)

    socket.on('join_room', (data)=>{
        socket.join(data)
        console.log(`User with ID: ${socket.id} joined room: ${data}`)
    })

    socket.on("send_message", (data) => {
        socket.to(data.room).emit("receive_message", data);
      });

    socket.on('disconnect', () =>{
        console.log('User disconnected: ', socket.id)
    })
})

//db
mongoose
        .connect(process.env.DATABASE,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            })
        .then(() => console.log('DB Connected'));


//middlewares
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(expressValidator())
app.use(cors())

//routes middleware
app.use('/api',authRoutes)
app.use('/api',userRoutes)
app.use('/api',categoryRoutes)
app.use('/api',productRoutes)
app.use('/api',brainTreeRoutes)
app.use('/api',orderRoutes)




const port = process.env.PORT || 8000

server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})