'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { Send, Users, LogOut, MessageCircle } from 'lucide-react'
import { Message, User, TypingUser } from '@/types/chat'
import MessageList from './MessageList'
import UserList from './UserList'
import TypingIndicator from './TypingIndicator'

interface ChatRoomProps {
  username: string
  onLogout: () => void
}

export default function ChatRoom({ username, onLogout }: ChatRoomProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting')
  const [showUsers, setShowUsers] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Socket.IO 연결
    const newSocket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000', {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    })
    setSocket(newSocket)

    // 연결 성공
    newSocket.on('connect', () => {
      setIsConnected(true)
      setConnectionStatus('connected')
      newSocket.emit('join', username)
    })

    // 연결 해제
    newSocket.on('disconnect', (reason) => {
      setIsConnected(false)
      setConnectionStatus('disconnected')
      console.log('연결 해제:', reason)
    })

    // 연결 오류
    newSocket.on('connect_error', (error) => {
      setIsConnected(false)
      setConnectionStatus('error')
      console.log('연결 오류:', error)
    })

    // 재연결 시도
    newSocket.on('reconnecting', (attemptNumber) => {
      setConnectionStatus('connecting')
      console.log('재연결 시도 중...', attemptNumber)
    })

    // 입장 오류 (중복 닉네임 등)
    newSocket.on('join-error', ({ message }) => {
      console.log('입장 오류:', message)
      alert(message)
      handleLogout()
    })

    // 메시지 수신
    newSocket.on('message', (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    // 사용자 목록 업데이트
    newSocket.on('users', (userList: User[]) => {
      setUsers(userList)
    })

    // 타이핑 상태 업데이트
    newSocket.on('typing', (data: { username: string; isTyping: boolean }) => {
      if (data.username !== username) {
        setTypingUsers(prev => {
          if (data.isTyping) {
            const filtered = prev.filter(user => user.username !== data.username)
            return [...filtered, { username: data.username, timestamp: Date.now() }]
          } else {
            return prev.filter(user => user.username !== data.username)
          }
        })
      }
    })

    return () => {
      newSocket.close()
    }
  }, [username])

  // 타이핑 인디케이터 정리
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setTypingUsers(prev => prev.filter(user => now - user.timestamp < 3000))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() && socket) {
      const message: Omit<Message, 'id'> = {
        username,
        text: newMessage.trim(),
        timestamp: new Date(),
        type: 'message'
      }
      socket.emit('message', message)
      setNewMessage('')
      
      // 타이핑 상태 해제
      socket.emit('typing', { username, isTyping: false })
    }
  }

  const handleTyping = (text: string) => {
    setNewMessage(text)
    
    if (socket) {
      socket.emit('typing', { username, isTyping: text.length > 0 })
      
      // 타이핑 타임아웃 설정
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { username, isTyping: false })
      }, 2000)
    }
  }

  const handleLogout = () => {
    if (socket) {
      socket.emit('leave', username)
      socket.close()
    }
    onLogout()
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-6 h-6 text-primary-500" />
            <h1 className="text-xl font-bold text-gray-900">실시간 채팅</h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
              connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'
            }`} />
            <span className="text-sm text-gray-600">
              {connectionStatus === 'connected' ? '연결됨' : 
               connectionStatus === 'connecting' ? '연결 중...' : 
               connectionStatus === 'error' ? '연결 오류' : '연결 해제됨'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowUsers(!showUsers)}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Users className="w-5 h-5" />
            <span className="hidden sm:inline">사용자 ({users.length})</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">나가기</span>
          </button>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 채팅 영역 */}
        <div className="flex-1 flex flex-col">
          {/* 메시지 목록 */}
          <div className="flex-1 overflow-hidden">
            <MessageList messages={messages} currentUser={username} />
          </div>

          {/* 타이핑 인디케이터 */}
          {typingUsers.length > 0 && (
            <div className="px-6 py-2">
              <TypingIndicator users={typingUsers} />
            </div>
          )}

          {/* 메시지 입력 */}
          <div className="bg-white border-t border-gray-200 p-4">
            <form onSubmit={sendMessage} className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => handleTyping(e.target.value)}
                placeholder="메시지를 입력하세요..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                disabled={!isConnected}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || !isConnected}
                className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* 사용자 목록 (모바일에서는 오버레이) */}
        {showUsers && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setShowUsers(false)}
            />
            <div className={`
              ${showUsers ? 'translate-x-0' : 'translate-x-full'}
              fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 lg:relative lg:translate-x-0 lg:w-80 lg:border-l lg:border-gray-200 lg:shadow-none
              transition-transform duration-300 ease-in-out
            `}>
              <UserList users={users} currentUser={username} onClose={() => setShowUsers(false)} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}