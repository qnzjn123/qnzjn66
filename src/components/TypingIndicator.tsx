'use client'

import { TypingUser } from '@/types/chat'

interface TypingIndicatorProps {
  users: TypingUser[]
}

export default function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null

  const getUsersText = () => {
    if (users.length === 1) {
      return `${users[0].username}님이 입력 중입니다`
    } else if (users.length === 2) {
      return `${users[0].username}님과 ${users[1].username}님이 입력 중입니다`
    } else {
      return `${users[0].username}님 외 ${users.length - 1}명이 입력 중입니다`
    }
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500 animate-fade-in">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{getUsersText()}</span>
    </div>
  )
}