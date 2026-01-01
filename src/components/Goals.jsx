import { useState, useEffect, useRef } from 'react'

// ISO week number 계산
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

// 현재 기간 키 생성
function getCurrentPeriodKeys() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const week = getWeekNumber(now)

  return {
    year: `goals-year-${year}`,
    month: `goals-month-${year}-${String(month).padStart(2, '0')}`,
    week: `goals-week-${year}-W${String(week).padStart(2, '0')}`
  }
}

// 기간 라벨 생성
function getPeriodLabels() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const week = getWeekNumber(now)

  return {
    year: `${year}년 목표`,
    month: `${month}월 목표`,
    week: `${week}주차 목표`
  }
}

// 아카이브 함수 (컴포넌트 외부)
function archiveGoals(type, key, goals) {
  if (goals.length === 0) return

  const archive = JSON.parse(localStorage.getItem('goals-archive') || '[]')
  archive.push({
    type,
    key,
    goals,
    archivedAt: Date.now()
  })
  localStorage.setItem('goals-archive', JSON.stringify(archive))
}

function Goals() {
  const [yearGoals, setYearGoals] = useState([])
  const [monthGoals, setMonthGoals] = useState([])
  const [weekGoals, setWeekGoals] = useState([])
  const [periodKeys, setPeriodKeys] = useState(getCurrentPeriodKeys())
  const [periodLabels, setPeriodLabels] = useState(getPeriodLabels())
  const [yearInput, setYearInput] = useState('')
  const [monthInput, setMonthInput] = useState('')
  const [weekInput, setWeekInput] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const editInputRef = useRef(null)
  const isInitialLoad = useRef(true)

  // 기간 변경 감지 및 아카이브
  useEffect(() => {
    const checkPeriodChange = () => {
      const newKeys = getCurrentPeriodKeys()
      const oldKeys = periodKeys

      // 연도 변경
      if (newKeys.year !== oldKeys.year) {
        archiveGoals('year', oldKeys.year, yearGoals)
        setYearGoals([])
      }
      // 월 변경
      if (newKeys.month !== oldKeys.month) {
        archiveGoals('month', oldKeys.month, monthGoals)
        setMonthGoals([])
      }
      // 주 변경
      if (newKeys.week !== oldKeys.week) {
        archiveGoals('week', oldKeys.week, weekGoals)
        setWeekGoals([])
      }

      if (newKeys.year !== oldKeys.year ||
          newKeys.month !== oldKeys.month ||
          newKeys.week !== oldKeys.week) {
        setPeriodKeys(newKeys)
        setPeriodLabels(getPeriodLabels())
      }
    }

    // 매 분마다 체크
    const interval = setInterval(checkPeriodChange, 60000)
    return () => clearInterval(interval)
  }, [periodKeys, yearGoals, monthGoals, weekGoals])

  // 로드 및 기간 지난 데이터 아카이브
  useEffect(() => {
    isInitialLoad.current = true
    const currentKeys = getCurrentPeriodKeys()
    setPeriodKeys(currentKeys)
    setPeriodLabels(getPeriodLabels())

    // 저장된 마지막 기간 키 확인
    const lastKeys = JSON.parse(localStorage.getItem('goals-last-period-keys') || 'null')

    // 이전 기간 데이터가 있으면 아카이브
    if (lastKeys) {
      // 연간 목표: 연도가 바뀌었으면 아카이브
      if (lastKeys.year && lastKeys.year !== currentKeys.year) {
        const oldYearGoals = JSON.parse(localStorage.getItem(lastKeys.year) || '[]')
        if (oldYearGoals.length > 0) {
          archiveGoals('year', lastKeys.year, oldYearGoals)
          localStorage.removeItem(lastKeys.year)
        }
      }
      // 월간 목표: 월이 바뀌었으면 아카이브
      if (lastKeys.month && lastKeys.month !== currentKeys.month) {
        const oldMonthGoals = JSON.parse(localStorage.getItem(lastKeys.month) || '[]')
        if (oldMonthGoals.length > 0) {
          archiveGoals('month', lastKeys.month, oldMonthGoals)
          localStorage.removeItem(lastKeys.month)
        }
      }
      // 주간 목표: 주가 바뀌었으면 아카이브
      if (lastKeys.week && lastKeys.week !== currentKeys.week) {
        const oldWeekGoals = JSON.parse(localStorage.getItem(lastKeys.week) || '[]')
        if (oldWeekGoals.length > 0) {
          archiveGoals('week', lastKeys.week, oldWeekGoals)
          localStorage.removeItem(lastKeys.week)
        }
      }
    }

    // 현재 기간 키 저장
    localStorage.setItem('goals-last-period-keys', JSON.stringify(currentKeys))

    // 현재 기간 데이터 로드
    const loadedYear = JSON.parse(localStorage.getItem(currentKeys.year) || '[]')
    const loadedMonth = JSON.parse(localStorage.getItem(currentKeys.month) || '[]')
    const loadedWeek = JSON.parse(localStorage.getItem(currentKeys.week) || '[]')

    setYearGoals(loadedYear)
    setMonthGoals(loadedMonth)
    setWeekGoals(loadedWeek)

    setTimeout(() => {
      isInitialLoad.current = false
    }, 0)
  }, [])

  // 저장
  useEffect(() => {
    if (isInitialLoad.current) return
    localStorage.setItem(periodKeys.year, JSON.stringify(yearGoals))
  }, [yearGoals, periodKeys.year])

  useEffect(() => {
    if (isInitialLoad.current) return
    localStorage.setItem(periodKeys.month, JSON.stringify(monthGoals))
  }, [monthGoals, periodKeys.month])

  useEffect(() => {
    if (isInitialLoad.current) return
    localStorage.setItem(periodKeys.week, JSON.stringify(weekGoals))
  }, [weekGoals, periodKeys.week])

  // 목표 추가
  const addGoal = (type, text) => {
    if (!text.trim()) return
    const newGoal = {
      id: Date.now(),
      text: text.trim(),
      completed: false
    }

    if (type === 'year') {
      setYearGoals([...yearGoals, newGoal])
      setYearInput('')
    } else if (type === 'month') {
      setMonthGoals([...monthGoals, newGoal])
      setMonthInput('')
    } else {
      setWeekGoals([...weekGoals, newGoal])
      setWeekInput('')
    }
  }

  // 목표 토글
  const toggleGoal = (type, id) => {
    const setter = type === 'year' ? setYearGoals : type === 'month' ? setMonthGoals : setWeekGoals
    const goals = type === 'year' ? yearGoals : type === 'month' ? monthGoals : weekGoals
    setter(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g))
  }

  // 목표 삭제
  const deleteGoal = (type, id) => {
    const setter = type === 'year' ? setYearGoals : type === 'month' ? setMonthGoals : setWeekGoals
    const goals = type === 'year' ? yearGoals : type === 'month' ? monthGoals : weekGoals
    setter(goals.filter(g => g.id !== id))
  }

  // 편집 시작
  const startEditing = (goal) => {
    setEditingId(goal.id)
    setEditingText(goal.text)
  }

  // 편집 저장
  const saveEditing = (type) => {
    if (editingText.trim()) {
      const setter = type === 'year' ? setYearGoals : type === 'month' ? setMonthGoals : setWeekGoals
      const goals = type === 'year' ? yearGoals : type === 'month' ? monthGoals : weekGoals
      setter(goals.map(g => g.id === editingId ? { ...g, text: editingText.trim() } : g))
    }
    setEditingId(null)
    setEditingText('')
  }

  // 편집 취소
  const cancelEditing = () => {
    setEditingId(null)
    setEditingText('')
  }

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingId])

  const handleKeyDown = (e, type) => {
    if (e.nativeEvent.isComposing) return
    if (e.key === 'Enter') {
      const input = type === 'year' ? yearInput : type === 'month' ? monthInput : weekInput
      addGoal(type, input)
    }
  }

  const handleEditKeyDown = (e, type) => {
    if (e.nativeEvent.isComposing) return
    if (e.key === 'Enter') {
      saveEditing(type)
    } else if (e.key === 'Escape') {
      cancelEditing()
    }
  }

  const renderGoalSection = (type, goals, input, setInput, label) => (
    <div className="goal-section">
      <h2 className="goal-section-title">{label}</h2>
      <div className="goal-list">
        {goals.map(goal => (
          <div key={goal.id} className={`goal-item ${goal.completed ? 'completed' : ''}`}>
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={goal.completed}
                onChange={() => toggleGoal(type, goal.id)}
              />
              <span className="checkmark"></span>
            </label>
            {editingId === goal.id ? (
              <input
                ref={editInputRef}
                type="text"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onKeyDown={(e) => handleEditKeyDown(e, type)}
                onBlur={() => saveEditing(type)}
                className="goal-edit-input"
              />
            ) : (
              <span
                className="goal-text"
                onDoubleClick={() => startEditing(goal)}
                title="더블클릭하여 수정"
              >
                {goal.text}
              </span>
            )}
            <button className="delete-btn" onClick={() => deleteGoal(type, goal.id)}>×</button>
          </div>
        ))}
      </div>
      <div className="goal-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, type)}
          placeholder="목표를 입력하고 Enter..."
          className="goal-input"
        />
      </div>
    </div>
  )

  return (
    <div className="goals-container">
      <h1 className="goals-header">목표 관리</h1>
      <div className="goals-grid">
        {renderGoalSection('year', yearGoals, yearInput, setYearInput, periodLabels.year)}
        {renderGoalSection('month', monthGoals, monthInput, setMonthInput, periodLabels.month)}
        {renderGoalSection('week', weekGoals, weekInput, setWeekInput, periodLabels.week)}
      </div>
    </div>
  )
}

export default Goals
