'use client'

import { useState } from 'react'
import ChatRoom from '@/components/ChatRoom'
import LoginForm from '@/components/LoginForm'

export default function Home() {
  const [username, setUsername] = useState<string>('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = (name: string) => {
    setUsername(name)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setUsername('')
    setIsLoggedIn(false)
  }

  return (
    <main className="h-full">
      {!isLoggedIn ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <ChatRoom username={username} onLogout={handleLogout} />
      )}
    </main>
  )
}