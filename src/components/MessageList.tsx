'use client'

import { useEffect, useRef } from 'react'
import { Message } from '@/types/chat'
import { formatTime } from '@/utils/dateUtils'

interface MessageListProps {
  messages: Message[]
  currentUser: string
}

export default function MessageList({ messages, currentUser }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-gray-500 text-lg">아직 메시지가 없습니다</p>
            <p className="text-gray-400 text-sm mt-1">첫 번째 메시지를 보내보세요!</p>
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <div key={message.id} className="animate-slide-up">
            {message.type === 'system' ? (
              <div className="text-center">
                <span className="inline-block bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                  {message.text}
                </span>
              </div>
            ) : (
              <div className={`flex ${message.username === currentUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md ${message.username === currentUser ? 'order-2' : 'order-1'}`}>
                  {message.username !== currentUser && (
                    <div className="flex items-center mb-1">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-2">
                        <span className="text-white text-xs font-semibold">
                          {message.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{message.username}</span>
                    </div>
                  )}
                  
                  <div className={`
                    chat-bubble
                    ${message.username === currentUser ? 'chat-bubble-sent' : 'chat-bubble-received'}
                  `}>
                    <p className="text-sm leading-relaxed break-words">{message.text}</p>
                  </div>
                  
                  <div className={`text-xs text-gray-500 mt-1 ${
                    message.username === currentUser ? 'text-right' : 'text-left'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}