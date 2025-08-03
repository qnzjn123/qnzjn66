export const formatTime = (timestamp: Date | string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  
  // 같은 날이면 시간만 표시
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }
  
  // 어제면 "어제 HH:MM"
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return `어제 ${date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })}`
  }
  
  // 그 외에는 날짜와 시간
  return date.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}