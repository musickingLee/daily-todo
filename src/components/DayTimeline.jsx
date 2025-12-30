import { useState } from 'react'

function DayTimeline({ categories, timerTick, dateKey }) {
  const [hoveredBlock, setHoveredBlock] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const getTodayKey = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  }

  const targetDate = dateKey || getTodayKey()
  const isToday = targetDate === getTodayKey()

  // Get the start of the target date (midnight)
  const [year, month, day] = targetDate.split('-').map(Number)
  const dayStart = new Date(year, month - 1, day, 0, 0, 0).getTime()
  const dayEnd = new Date(year, month - 1, day, 23, 59, 59, 999).getTime()

  // Load todos for the target date
  const stored = localStorage.getItem(`todos-${targetDate}`)
  const todos = stored ? JSON.parse(stored) : []

  // Build time blocks from sessions
  const getTimeBlocks = () => {
    const blocks = []

    todos.forEach(todo => {
      const category = categories.find(c => c.id === todo.categoryId)
      const color = category?.color || '#999999'
      const sessions = todo.sessions || []

      sessions.forEach(session => {
        if (session.start && session.end) {
          // Clamp to day boundaries
          const start = Math.max(session.start, dayStart)
          const end = Math.min(session.end, dayEnd)

          if (start < end) {
            blocks.push({
              start,
              end,
              color,
              todoText: todo.text,
              categoryName: category?.name || '미분류'
            })
          }
        }
      })

      // Handle currently running timer
      if (todo.timerStartedAt && isToday) {
        const now = Date.now()
        const start = Math.max(todo.timerStartedAt, dayStart)
        const end = Math.min(now, dayEnd)

        if (start < end) {
          blocks.push({
            start,
            end,
            color,
            todoText: todo.text,
            categoryName: category?.name || '미분류',
            isRunning: true
          })
        }
      }
    })

    return blocks
  }

  const timeBlocks = getTimeBlocks()

  // Convert timestamp to percentage position in day (0-100)
  const getPositionPercent = (timestamp) => {
    const msInDay = 24 * 60 * 60 * 1000
    const msFromStart = timestamp - dayStart
    return (msFromStart / msInDay) * 100
  }

  // Get current time position for "now" indicator
  const getNowPosition = () => {
    if (!isToday) return null
    const now = Date.now()
    if (now < dayStart || now > dayEnd) return null
    return getPositionPercent(now)
  }

  const nowPosition = getNowPosition()

  // Format time for tooltip
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  return (
    <div className="day-timeline">
      <div className="timeline-header">
        <span className="timeline-title">24시간 타임라인</span>
      </div>

      <div className="timeline-container">
        {/* Hour labels */}
        <div className="timeline-labels">
          {[0, 6, 12, 18, 24].map(hour => (
            <div
              key={hour}
              className="timeline-label"
              style={{ top: `${(hour / 24) * 100}%` }}
            >
              {hour.toString().padStart(2, '0')}
            </div>
          ))}
        </div>

        {/* Timeline track */}
        <div className="timeline-track">
          {/* Hour grid lines */}
          {Array.from({ length: 25 }, (_, i) => (
            <div
              key={i}
              className={`timeline-grid-line ${i % 6 === 0 ? 'major' : ''}`}
              style={{ top: `${(i / 24) * 100}%` }}
            />
          ))}

          {/* Time blocks */}
          {timeBlocks.map((block, index) => {
            const top = getPositionPercent(block.start)
            const height = getPositionPercent(block.end) - top

            return (
              <div
                key={index}
                className={`timeline-block ${block.isRunning ? 'running' : ''}`}
                style={{
                  top: `${top}%`,
                  height: `${Math.max(height, 0.5)}%`,
                  backgroundColor: block.color
                }}
                onMouseEnter={(e) => {
                  setHoveredBlock(block)
                  const rect = e.currentTarget.getBoundingClientRect()
                  setTooltipPosition({ x: rect.left, y: rect.top })
                }}
                onMouseLeave={() => setHoveredBlock(null)}
              />
            )
          })}

          {/* Now indicator */}
          {nowPosition !== null && (
            <div
              className="timeline-now"
              style={{ top: `${nowPosition}%` }}
            >
              <div className="timeline-now-line" />
              <div className="timeline-now-dot" />
            </div>
          )}

          {/* Custom Tooltip */}
          {hoveredBlock && (
            <div
              className="timeline-tooltip"
              style={{
                top: `${getPositionPercent(hoveredBlock.start)}%`,
              }}
            >
              <div className="tooltip-text">{hoveredBlock.todoText}</div>
              <div className="tooltip-meta">
                {hoveredBlock.categoryName} · {formatTime(hoveredBlock.start)} - {formatTime(hoveredBlock.end)}
              </div>
            </div>
          )}
        </div>
      </div>

      {timeBlocks.length === 0 && (
        <div className="timeline-empty">
          기록된 시간이 없습니다
        </div>
      )}
    </div>
  )
}

export default DayTimeline
