'use client'

import { User } from '@/types/chat'
import { X, Crown, Circle } from 'lucide-react'

interface UserListProps {
  users: User[]
  currentUser: string
  onClose: () => void
}

export default function UserList({ users, currentUser, onClose }: UserListProps) {
  return (
    <div className="h-full flex flex-col bg-white">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          온라인 사용자 ({users.length})
        </h3>
        <button
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 사용자 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {users.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">👥</span>
            </div>
            <p className="text-gray-500">온라인 사용자가 없습니다</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className={`
                flex items-center space-x-3 p-3 rounded-lg transition-all duration-200
                ${user.username === currentUser 
                  ? 'bg-primary-50 border border-primary-200' 
                  : 'hover:bg-gray-50'
                }
              `}
            >
              {/* 아바타 */}
              <div className="relative">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold
                  ${user.username === currentUser 
                    ? 'bg-gradient-to-r from-primary-400 to-primary-600' 
                    : 'bg-gradient-to-r from-blue-400 to-purple-500'
                  }
                `}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                
                {/* 온라인 상태 */}
                <div className="absolute -bottom-1 -right-1">
                  <Circle className={`w-4 h-4 ${user.isOnline ? 'text-green-500 fill-current' : 'text-gray-400'}`} />
                </div>
              </div>

              {/* 사용자 정보 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className={`
                    font-medium truncate
                    ${user.username === currentUser ? 'text-primary-700' : 'text-gray-900'}
                  `}>
                    {user.username}
                  </span>
                  
                  {user.username === currentUser && (
                    <Crown className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  )}
                </div>
                
                <p className={`
                  text-sm truncate
                  ${user.username === currentUser ? 'text-primary-600' : 'text-gray-500'}
                `}>
                  {user.username === currentUser ? '나' : user.isOnline ? '온라인' : '오프라인'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 하단 정보 */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          실시간으로 업데이트됩니다
        </p>
      </div>
    </div>
  )
}