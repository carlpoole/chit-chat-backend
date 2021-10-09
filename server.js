const fastify = require('fastify')({
  logger: true
})

const mongoose = require('mongoose')

const mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017/chitchat"

// Connect to mongodb
try {
  mongoose.connect(mongoUrl)
} catch (error) {
  console.error(error)
}

const Message = require("./db/Message")

// Get all messages
fastify.get("/api/messages", (request, reply) => {
  Message.find({}, (err, messages) => {
    if (!err) {
      reply.send(messages)
    } else {
      reply.send({ error: err })
    }
  })
})

// Get a single message
fastify.get("/api/messages/:messageId", (request, reply) => {
  var messageId = request.params.messageId
  Message.findById(messageId, (err, message) => {
      if (!err) {
        reply.send(message)
      } else {
        reply.send({ error: err })
      }
  })
})

// Add message
fastify.post("/api/messages", (request, reply) => {
  var message = request.body
  Message.create(message, (err, message) => {
      if(!err) {
        reply.send(message)
      } else {
        reply.send({ error: err })
      }
  })
})

// Delete message
fastify.delete("/api/messages/:messageId", (request, reply) => {
  var messageId = request.params.messageId
  Message.findByIdAndDelete(messageId, function (err) {
    if(!err) {
      reply.send(messageId)
    } else {
      reply.send({ error: err })
    }
  });
})

// Default route
fastify.get('/', function (request, reply) {
  reply.send({ hello: 'world' })
})

// Run the server!
fastify.listen(3000, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }

  console.log(`Server is now listening on ${address}`)
})
