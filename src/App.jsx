import { useState, useEffect, useCallback } from 'react'
import TodoList from './components/TodoList'
import Calendar from './components/Calendar'
import CategorySidebar from './components/CategorySidebar'
import TimeStats from './components/TimeStats'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('todo')
  const [selectedDate, setSelectedDate] = useState(null)
  const [categories, setCategories] = useState([])
  const [timerTick, setTimerTick] = useState(0)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system')
  const [archiveYear, setArchiveYear] = useState(new Date().getFullYear())
  const [archiveMonth, setArchiveMonth] = useState(new Date().getMonth() + 1)

  const getTodayKey = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  }

  const [todayKey, setTodayKey] = useState(getTodayKey())

  // 테마 적용
  useEffect(() => {
    const applyTheme = (themeSetting) => {
      let effectiveTheme = themeSetting
      if (themeSetting === 'system') {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      document.documentElement.setAttribute('data-theme', effectiveTheme)
    }

    applyTheme(theme)
    localStorage.setItem('theme', theme)

    // 시스템 테마 변경 감지
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system')
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const cycleTheme = () => {
    setTheme(prev => {
      if (prev === 'light') return 'dark'
      if (prev === 'dark') return 'system'
      return 'light'
    })
  }

  const getThemeIcon = () => {
    if (theme === 'light') return '☀️'
    if (theme === 'dark') return '🌙'
    return '💻'
  }

  // Load categories from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('categories')
    if (stored) {
      setCategories(JSON.parse(stored))
    }
  }, [])

  // Save categories to localStorage
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories))
  }, [categories])

  // 자정 감지 및 날짜 전환 (타이머 실행 중이면 세션을 자정에서 끊고 새 날짜로 복사)
  useEffect(() => {
    const scheduleNextMidnight = () => {
      const now = new Date()
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)
      const msUntilMidnight = midnight - now

      return setTimeout(() => {
        const oldDateKey = todayKey
        const midnightTimestamp = midnight.getTime()
        // getTodayKey() 대신 midnightTimestamp 기준으로 새 날짜 계산 (setTimeout 타이밍 오차 방지)
        const newDate = new Date(midnightTimestamp)
        const newDateKey = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`

        // 이전 날짜에서 타이머가 돌고 있는 투두 찾기
        const oldTodos = JSON.parse(localStorage.getItem(`todos-${oldDateKey}`) || '[]')
        const runningTodo = oldTodos.find(t => t.timerStartedAt)

        if (runningTodo) {
          // 이전 날짜: 자정까지의 세션 기록하고 타이머 종료
          const elapsedUntilMidnight = Math.floor((midnightTimestamp - runningTodo.timerStartedAt) / 1000)
          const sessionUntilMidnight = { start: runningTodo.timerStartedAt, end: midnightTimestamp }

          const updatedOldTodos = oldTodos.map(t =>
            t.id === runningTodo.id ? {
              ...t,
              timeSpent: t.timeSpent + elapsedUntilMidnight,
              timerStartedAt: null,
              sessions: [...(t.sessions || []), sessionUntilMidnight]
            } : t
          )
          localStorage.setItem(`todos-${oldDateKey}`, JSON.stringify(updatedOldTodos))

          // 새 날짜: 같은 투두 복사, 자정부터 타이머 시작
          const newTodos = JSON.parse(localStorage.getItem(`todos-${newDateKey}`) || '[]')
          const copiedTodo = {
            ...runningTodo,
            id: Date.now(), // 새 ID 부여
            timeSpent: 0,
            timerStartedAt: midnightTimestamp,
            sessions: []
          }
          newTodos.unshift(copiedTodo)
          localStorage.setItem(`todos-${newDateKey}`, JSON.stringify(newTodos))

          // 새 날짜를 dates-with-data에 추가
          const datesWithData = JSON.parse(localStorage.getItem('dates-with-data') || '[]')
          if (!datesWithData.includes(newDateKey)) {
            datesWithData.push(newDateKey)
            localStorage.setItem('dates-with-data', JSON.stringify(datesWithData))
          }
        }

        setTodayKey(newDateKey)
        scheduleNextMidnight()
      }, msUntilMidnight)
    }

    const timerId = scheduleNextMidnight()
    return () => clearTimeout(timerId)
  }, [todayKey])

  const formatDateDisplay = (dateKey) => {
    const [year, month, day] = dateKey.split('-')
    const date = new Date(year, month - 1, day)
    const weekdays = ['일', '월', '화', '수', '목', '금', '토']
    return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일 ${weekdays[date.getDay()]}요일`
  }

  const handleDateSelect = (dateKey) => {
    setSelectedDate(dateKey)
  }

  const handleBackToCalendar = () => {
    setSelectedDate(null)
  }

  const handleTimerUpdate = useCallback(() => {
    setTimerTick(t => t + 1)
  }, [])

  const handleMonthChange = useCallback((year, month) => {
    setArchiveYear(year)
    setArchiveMonth(month)
  }, [])

  return (
    <div className="app-container">
      <div className="drag-bar"></div>
      <aside className="sidebar-left">
        <div className="sidebar-left-content">
          <CategorySidebar
            categories={categories}
            onCategoriesChange={setCategories}
          />
        </div>
      </aside>

      <div className="app">
        <nav className="tabs">
          <button
            className={`tab ${activeTab === 'todo' ? 'active' : ''}`}
            onClick={() => { setActiveTab('todo'); setSelectedDate(null); window.scrollTo(0, 0); }}
          >
            Today
          </button>
          <button
            className={`tab ${activeTab === 'archive' ? 'active' : ''}`}
            onClick={() => { setActiveTab('archive'); setSelectedDate(null); }}
          >
            Archive
          </button>
          <button
            className="theme-toggle"
            onClick={cycleTheme}
            title={`테마: ${theme === 'light' ? '라이트' : theme === 'dark' ? '다크' : '시스템'}`}
          >
            {getThemeIcon()}
          </button>
        </nav>

        <main className="content">
          {activeTab === 'todo' ? (
            <TodoList
              dateKey={todayKey}
              dateDisplay={formatDateDisplay(todayKey)}
              isToday={true}
              categories={categories}
              onTimerUpdate={handleTimerUpdate}
            />
          ) : selectedDate ? (
            <div className="archive-detail">
              <button className="back-btn" onClick={handleBackToCalendar}>
                ← 캘린더로 돌아가기
              </button>
              <TodoList
                dateKey={selectedDate}
                dateDisplay={formatDateDisplay(selectedDate)}
                isToday={false}
                categories={categories}
              />
            </div>
          ) : (
            <Calendar onDateSelect={handleDateSelect} onMonthChange={handleMonthChange} />
          )}
        </main>
      </div>

      <aside className="sidebar-right">
        <div className="sidebar-right-content">
          <TimeStats
            categories={categories}
            timerTick={timerTick}
            selectedDate={activeTab === 'archive' ? selectedDate : null}
            isArchive={activeTab === 'archive'}
            archiveYear={archiveYear}
            archiveMonth={archiveMonth}
          />
        </div>
      </aside>
    </div>
  )
}

export default App
