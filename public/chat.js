var socket = io();

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');
var usertyping = document.getElementById('usertyping');

var timeout = undefined
var randomIdentifier = randomId()

var typingUsers = new Set()

function typingTimeout(){ 
    socket.emit('typing', { typing: false });
}

function randomId() {
    const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
    return uint32.toString(16);
}

function getMessages() {
    fetch("/api/messages")
    .then(data => {
        return data.json();
    })
    .then(json => {
        json.map(data => {
            var timestamp = data._id.toString().substring(0, 8)
            timestamp = parseInt(timestamp, 16) * 1000
            const date = new Date(timestamp).toLocaleString()
            displayMessage(date, data.name, data.body)
        });
    });
}

function displayMessage(date, user, message) {
    var item = document.createElement('li');
    item.textContent = message;

    var time = document.createElement('a')
    time.textContent = `from ${user} at ${date}`
    item.append(time)

    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
}

function displayTyping() {
    const tuArray = [...typingUsers]

    switch(typingUsers.size) {
        case 3:
            usertyping.textContent = `${tuArray[0]}, ${tuArray[1]}, and ${tuArray[2]} are typing...`
            break;
        case 2:
            usertyping.textContent = `${tuArray[0]} and ${tuArray[1]} are typing...`
            break;
        case 1:
            usertyping.textContent = `${tuArray[0]} is typing...`
            break;
        case 0:
            usertyping.textContent = ''
            break;
        default:
            usertyping.textContent = "Several people are typing..."
    }
}

(function () {
    getMessages()
})();

(function () {
    input.addEventListener('keyup', function (e) {
        if (input.value.length > 0) {
            if(e.code == "Enter") {
                clearTimeout(timeout)
                typingTimeout()
            } else {
                clearTimeout(timeout)
                timeout = setTimeout(typingTimeout, 3000)
                socket.emit('typing', { id: randomIdentifier, typing: true });
            }
        } else {
            socket.emit('typing', { id: randomIdentifier, typing: false });
        }
    })
})();

form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
});

socket.on('chat message', function (msg) {
    const date = new Date().toLocaleString()
    displayMessage(date, msg.user, msg.msg)
});

socket.on('user typing', function (data) {
    if (data.id != randomIdentifier) {
        if(data.isTyping) {
            typingUsers.add(data.user)
        } else {
            typingUsers.delete(data.user)
        }

        displayTyping()
    }
})