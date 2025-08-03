export interface Message {
  id: string
  username: string
  text: string
  timestamp: Date
  type: 'message' | 'system'
}

export interface User {
  id: string
  username: string
  isOnline: boolean
}

export interface TypingUser {
  username: string
  timestamp: number
}