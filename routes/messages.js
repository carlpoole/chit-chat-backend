const Message = require("../db/message")

function routes(fastify, options, done) {
// Get all messages
    fastify.get("/", (request, reply) => {
        Message.find({}, (err, messages) => {
        if (!err) {
            reply.send(messages)
        } else {
            reply.send({ error: err })
        }
        })
    })
  
    // Get a single message
    fastify.get("/:messageId", (request, reply) => {
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
    fastify.post("/", (request, reply) => {
        var message = request.body
        if (message && message.name && message.body) {
            Message.create(message, (err, message) => {
                if(!err) {
                    fastify.io.emit('chat message', { user: message.name, msg: message.body });
                    reply.send(message)
                } else {
                    reply.send({ error: err })
                }
            })
        } else {
            reply.send({ error: 'Message user and body must be provided.' })
        }
    })
  
    // Delete message
    fastify.delete("/:messageId", (request, reply) => {
        var messageId = request.params.messageId
        Message.findByIdAndDelete(messageId, function (err) {
            if(!err) {
            reply.send(messageId)
            } else {
            reply.send({ error: err })
            }
        });
    })

    done()
}

module.exports = routes