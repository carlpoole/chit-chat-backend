const fastify = require('fastify')({
  logger: true
})

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
  reply.send({ status: 'ok' })
})

// Run server
fastify.listen(3000, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }

  console.log(`Server is now listening on ${address}`)
})
