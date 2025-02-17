
const chatForm = document.getElementById('chat-form')
const chatMessage = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

const {username,room} = Qs.parse(location.search,{
    ignoreQueryPrefix: true
})

const socket = io()

socket.emit('joinRoom',{username,room})

socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room)
    outputUsers(users)
})

socket.on('message',message => {
    console.log(message);
    outputMessage(message)

    chatMessage.scrollTop = chatMessage.scrollHeight;
})


chatForm.addEventListener('submit',(e) => {
    e.preventDefault()

    const msg = e.target.elements.msg.value;

    socket.emit('chatMessage', msg)

    e.target.elements.msg.value = ''
    e.target.elements.msg.focus()
})

function outputMessage(message) {
    const div = document.createElement('div')
    
    div.classList.add('message')
        div.innerHTML =`
        <div class="msg-head">
        <button class="btn"><i class="fa-solid fa-microphone" style="color: #667aff;"></i></i></button>
        <p class="meta">${message.username} <span>${message.time}</span></p>
        </div>
        <p class="text">
            ${message.text}
        </p>`

    document.querySelector('.chat-messages').appendChild(div)
}

let isSpeaking = false;
let currentUtterance = null; 

document.querySelector('.chat-messages').addEventListener('click', (event) => { 
    if (event.target.closest('.btn')) {
        const messageDiv = event.target.closest('.message');
        const messageText = messageDiv.querySelector('.text').innerText;
        
        toggleSpeech(messageText);
    }
});

function toggleSpeech(messageText) {
    if (isSpeaking) {
        window.speechSynthesis.cancel();
        isSpeaking = false;
    } else {
        currentUtterance = new SpeechSynthesisUtterance(messageText);
        currentUtterance.lang = 'en-US';

        currentUtterance.onend = () => {
            isSpeaking = false;
        };

        window.speechSynthesis.speak(currentUtterance);
        isSpeaking = true;
    }
}



function outputRoomName(room) {
    roomName.innerHTML = room
}

function outputUsers(users) {
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
    `
}

