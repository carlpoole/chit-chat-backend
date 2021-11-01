const path = require('path')
const fastify = require('fastify')({
  logger: true
})

fastify.register(require('fastify-socket.io'))
fastify.register(require('fastify-static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/',
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

const Message = require("./db/message")

// Get and register routes
const messages = require('./routes/messages')
fastify.register(messages, { prefix: '/api/messages' })

fastify.ready().then(() => {
  fastify.io.on('connection', (socket) => {
    const ipAddress = socket.handshake.address;
    console.log(`user connected: ${ipAddress}`);

    socket.on('chat message', (msg) => {
      console.log(`message from ${ipAddress}: ${msg}`);

      fastify.io.emit('chat message', msg);

      const message = {
          name: ipAddress,
          body: msg,
      }

      Message.create(message, (err, message) => {
        if(err) {
          console.log({ error: err })
        }
      })
    });

    socket.on('disconnect', () => {
      console.log(`user disconnected: ${ipAddress}`);
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
