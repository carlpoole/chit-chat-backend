var socket = io();

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');

(function () {
    fetch("/api/messages")
        .then(data => {
            return data.json();
        })
        .then(json => {
            json.map(data => {
                // timestamp
                var timestamp = data._id.toString().substring(0, 8)
                timestamp = parseInt(timestamp, 16) * 1000
                const date = new Date(timestamp).toLocaleString()

                var item = document.createElement('li');
                item.textContent = data.body;

                var time = document.createElement('a')
                time.textContent = `from ${data.name} at ${date}`
                item.append(time)

                messages.appendChild(item);
                window.scrollTo(0, document.body.scrollHeight);
            });
        });
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

    var item = document.createElement('li');
    item.textContent = msg;

    var time = document.createElement('a')
    time.textContent = `from you at ${date}`
    item.append(time)

    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});