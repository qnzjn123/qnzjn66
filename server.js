const { createServer } = require('http')
const { Server } = require('socket.io')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// Next.js 앱 생성
const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

// 사용자와 메시지 저장
const users = new Map()
const messages = []

app.prepare().then(() => {
  const httpServer = createServer(handler)
  
  const io = new Server(httpServer, {
    cors: {
      origin: dev ? "http://localhost:3000" : false,
      methods: ["GET", "POST"]
    }
  })

  io.on('connection', (socket) => {
    console.log('새로운 사용자가 연결되었습니다:', socket.id)

    // 닉네임 중복검사
    socket.on('check-username', (username) => {
      const isAvailable = !Array.from(users.values()).some(user => 
        user.username.toLowerCase() === username.toLowerCase()
      )
      socket.emit('username-checked', { username, isAvailable })
    })

    // 사용자 입장
    socket.on('join', (username) => {
      // 중복 닉네임 체크
      const isAvailable = !Array.from(users.values()).some(user => 
        user.username.toLowerCase() === username.toLowerCase()
      )
      
      if (!isAvailable) {
        socket.emit('join-error', { message: '이미 사용 중인 닉네임입니다.' })
        return
      }

      console.log(`${username}님이 입장했습니다`)
      
      // 사용자 정보 저장
      users.set(socket.id, {
        id: socket.id,
        username,
        isOnline: true
      })

      // 기존 메시지 전송
      messages.forEach(message => {
        socket.emit('message', message)
      })

      // 시스템 메시지 전송
      const systemMessage = {
        id: `system-${Date.now()}`,
        username: 'System',
        text: `${username}님이 입장했습니다`,
        timestamp: new Date(),
        type: 'system'
      }
      
      messages.push(systemMessage)
      io.emit('message', systemMessage)

      // 업데이트된 사용자 목록 전송
      io.emit('users', Array.from(users.values()))
    })

    // 메시지 수신
    socket.on('message', (messageData) => {
      const message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2)}`,
        ...messageData,
        timestamp: new Date()
      }
      
      messages.push(message)
      
      // 최근 100개 메시지만 유지
      if (messages.length > 100) {
        messages.splice(0, messages.length - 100)
      }
      
      io.emit('message', message)
      console.log(`메시지 [${message.username}]: ${message.text}`)
    })

    // 타이핑 상태
    socket.on('typing', (data) => {
      socket.broadcast.emit('typing', data)
    })

    // 사용자 퇴장
    socket.on('leave', (username) => {
      handleUserLeave(socket, username)
    })

    // 연결 해제
    socket.on('disconnect', () => {
      const user = users.get(socket.id)
      if (user) {
        handleUserLeave(socket, user.username)
      }
    })

    function handleUserLeave(socket, username) {
      console.log(`${username}님이 퇴장했습니다`)
      
      // 사용자 제거
      users.delete(socket.id)

      // 시스템 메시지 전송
      const systemMessage = {
        id: `system-${Date.now()}`,
        username: 'System',
        text: `${username}님이 퇴장했습니다`,
        timestamp: new Date(),
        type: 'system'
      }
      
      messages.push(systemMessage)
      io.emit('message', systemMessage)

      // 업데이트된 사용자 목록 전송
      io.emit('users', Array.from(users.values()))
    }
  })

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})