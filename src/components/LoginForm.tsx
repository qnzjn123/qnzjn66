'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { User, MessageCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface LoginFormProps {
  onLogin: (username: string) => void
}

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error'

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle')
  const [socket, setSocket] = useState<Socket | null>(null)
  const [joinError, setJoinError] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const checkTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Socket.IO 연결 (닉네임 중복검사용)
    const newSocket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000', {
      autoConnect: true,
    })
    setSocket(newSocket)

    // 닉네임 중복검사 결과
    newSocket.on('username-checked', ({ username: checkedUsername, isAvailable }) => {
      if (checkedUsername === username) {
        setUsernameStatus(isAvailable ? 'available' : 'taken')
      }
    })

    // 입장 오류
    newSocket.on('join-error', ({ message }) => {
      setJoinError(message)
      setIsJoining(false)
    })

    return () => {
      newSocket.close()
    }
  }, [username])

  // 닉네임 변경시 중복검사
  useEffect(() => {
    if (username.trim().length < 2) {
      setUsernameStatus('idle')
      return
    }

    setUsernameStatus('checking')
    
    // 디바운싱: 500ms 후에 검사
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current)
    }
    
    checkTimeoutRef.current = setTimeout(() => {
      if (socket && username.trim()) {
        socket.emit('check-username', username.trim())
      }
    }, 500)

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current)
      }
    }
  }, [username, socket])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim() && usernameStatus === 'available' && !isJoining) {
      setIsJoining(true)
      setJoinError('')
      onLogin(username.trim())
    }
  }

  const getUsernameIcon = () => {
    switch (usernameStatus) {
      case 'checking':
        return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      case 'available':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'taken':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <User className="w-5 h-5 text-gray-400" />
    }
  }

  const getUsernameMessage = () => {
    switch (usernameStatus) {
      case 'checking':
        return '중복 확인 중...'
      case 'available':
        return '사용 가능한 닉네임입니다'
      case 'taken':
        return '이미 사용 중인 닉네임입니다'
      case 'error':
        return '중복 확인 중 오류가 발생했습니다'
      default:
        return ''
    }
  }

  const isSubmitDisabled = () => {
    return !username.trim() || 
           username.trim().length < 2 || 
           usernameStatus !== 'available' || 
           isJoining
  }

  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-bounce-in">
          {/* 로고 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">실시간 채팅</h1>
            <p className="text-gray-600">친구들과 즐거운 대화를 나눠보세요!</p>
          </div>

          {/* 로그인 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                사용자 이름
              </label>
              <div className="relative">
                <div className="absolute left-3 top-3">
                  {getUsernameIcon()}
                </div>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="2자 이상 입력하세요"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 text-lg ${
                    usernameStatus === 'taken' 
                      ? 'border-red-300 focus:ring-red-500' 
                      : usernameStatus === 'available'
                      ? 'border-green-300 focus:ring-green-500'
                      : 'border-gray-300 focus:ring-primary-500'
                  }`}
                  required
                  autoFocus
                  minLength={2}
                  maxLength={20}
                />
              </div>
              
              {/* 닉네임 상태 메시지 */}
              {username.trim().length >= 2 && (
                <div className={`mt-2 text-sm ${
                  usernameStatus === 'available' ? 'text-green-600' :
                  usernameStatus === 'taken' ? 'text-red-600' :
                  usernameStatus === 'checking' ? 'text-gray-600' :
                  'text-gray-500'
                }`}>
                  {getUsernameMessage()}
                </div>
              )}

              {/* 입장 오류 메시지 */}
              {joinError && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                  {joinError}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitDisabled()}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-lg flex items-center justify-center space-x-2"
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>입장 중...</span>
                </>
              ) : (
                <span>채팅 시작하기</span>
              )}
            </button>
          </form>

          {/* 설명 */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              입장하면 다른 사용자들과 실시간으로 채팅할 수 있습니다
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}