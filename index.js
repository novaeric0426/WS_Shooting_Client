const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = {};
let bullets = [];

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A player connected: ', socket.id);

    // 새로운 플레이어 추가
    players[socket.id] = { x: Math.random() * 800, y: Math.random() * 600, size: 20 };

    // 모든 클라이언트에게 플레이어 정보 전달
    io.emit('updatePlayers', players);

    // 플레이어 이동 처리
    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            io.emit('updatePlayers', players); // 이동 후 모든 클라이언트에 갱신된 플레이어 정보 전송
        }
    });

    // 총알 발사 처리
    socket.on('shoot', (bullet) => {
        bullets.push(bullet);
        io.emit('newBullet', bullet); // 새로운 총알을 모든 클라이언트에 전달
    });

    // 연결 종료 처리
    socket.on('disconnect', () => {
        console.log('A player disconnected: ', socket.id);
        delete players[socket.id];
        io.emit('updatePlayers', players); // 플레이어가 나가면 모든 클라이언트에 갱신된 플레이어 정보 전송
    });
});

// 총알 이동 처리 및 클라이언트에 전송
setInterval(() => {
    bullets.forEach((bullet, index) => {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;
        if (bullet.x < 0 || bullet.x > 800 || bullet.y < 0 || bullet.y > 600) {
            bullets.splice(index, 1);
        }
    });
    io.emit('newBullet', bullets); // 모든 클라이언트에 총알 정보 전송
}, 1000 / 60);

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
