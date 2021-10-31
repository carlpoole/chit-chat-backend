const path = require('path')
const fastify = require('fastify')({
  logger: true
})

fastify.register(require('fastify-socket.io'))
fastify.register(require('fastify-static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/public/',
})

const { Server } = require("socket.io");
const io = new Server();

// Connect to mongodb
const mongoose = require('mongoose')
const mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017/chitchat"

try {
  mongoose.connect(mongoUrl)
} catch (error) {
  console.error(error)
}

// Get and register routes
const messages = require('./routes/messages')
fastify.register(messages, { prefix: '/api/messages' })

// Register default route
fastify.get('/', function (request, reply) {
  return reply.sendFile('index.html')
})

fastify.ready().then(() => {
  fastify.io.on('connection', (socket) => {
    console.log('user connected');

    socket.on('chat message', (msg) => {
      console.log('message: ' + msg);
      fastify.io.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
});

// Run server
fastify.listen(3000, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }

  console.log(`Server is now listening on ${address}`)
})
