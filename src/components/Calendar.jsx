import { useState, useEffect } from 'react'

function Calendar({ onDateSelect, onMonthChange, onViewGoalsArchive }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [datesWithData, setDatesWithData] = useState([])

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('dates-with-data') || '[]')
    setDatesWithData(stored)
  }, [])

  // 현재 보고 있는 연도/월이 변경될 때 부모에게 알림
  useEffect(() => {
    if (onMonthChange) {
      onMonthChange(currentDate.getFullYear(), currentDate.getMonth() + 1)
    }
  }, [currentDate, onMonthChange])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const getDateKey = (day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const hasData = (day) => {
    const dateKey = getDateKey(day)
    return datesWithData.includes(dateKey)
  }

  const isToday = (day) => {
    const today = new Date()
    return year === today.getFullYear() && month === today.getMonth() && day === today.getDate()
  }

  const handleDayClick = (day) => {
    if (hasData(day)) {
      onDateSelect(getDateKey(day))
    }
  }

  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  const days = []

  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const hasRecord = hasData(day)
    const isTodayDate = isToday(day)

    days.push(
      <div
        key={day}
        className={`calendar-day ${hasRecord ? 'has-data' : 'no-data'} ${isTodayDate ? 'today' : ''}`}
        onClick={() => handleDayClick(day)}
      >
        {day}
        {hasRecord && <span className="dot"></span>}
      </div>
    )
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button className="nav-btn" onClick={prevMonth}>←</button>
        <h2>{year}년 {month + 1}월</h2>
        <button className="nav-btn" onClick={nextMonth}>→</button>
      </div>

      <div className="calendar-weekdays">
        {weekdays.map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {days}
      </div>

      <button className="view-goals-archive-btn" onClick={onViewGoalsArchive}>
        🎯 과거 목표 기록 보기
      </button>
    </div>
  )
}

export default Calendar
