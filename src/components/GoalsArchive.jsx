import { useState, useEffect } from 'react'

function GoalsArchive({ onBack }) {
  const [archive, setArchive] = useState([])
  const [filter, setFilter] = useState('all') // all, year, month, week

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('goals-archive') || '[]')
    // 최신순 정렬
    stored.sort((a, b) => b.archivedAt - a.archivedAt)
    setArchive(stored)
  }, [])

  const getTypeLabel = (type) => {
    switch (type) {
      case 'year': return '연간'
      case 'month': return '월간'
      case 'week': return '주간'
      default: return ''
    }
  }

  const getPeriodLabel = (key) => {
    // goals-year-2024 -> 2024년
    // goals-month-2024-01 -> 2024년 1월
    // goals-week-2024-W01 -> 2024년 1주차
    if (key.startsWith('goals-year-')) {
      const year = key.replace('goals-year-', '')
      return `${year}년`
    } else if (key.startsWith('goals-month-')) {
      const parts = key.replace('goals-month-', '').split('-')
      return `${parts[0]}년 ${parseInt(parts[1])}월`
    } else if (key.startsWith('goals-week-')) {
      const parts = key.replace('goals-week-', '').split('-W')
      return `${parts[0]}년 ${parseInt(parts[1])}주차`
    }
    return key
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
  }

  const filteredArchive = filter === 'all'
    ? archive
    : archive.filter(item => item.type === filter)

  const getCompletionStats = (goals) => {
    const completed = goals.filter(g => g.completed).length
    return `${completed}/${goals.length}`
  }

  return (
    <div className="goals-archive">
      <div className="goals-archive-header">
        <button className="back-btn" onClick={onBack}>
          ← 캘린더로 돌아가기
        </button>
        <h2 className="goals-archive-title">과거 목표 기록</h2>
      </div>

      <div className="goals-archive-filter">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          전체
        </button>
        <button
          className={`filter-btn ${filter === 'year' ? 'active' : ''}`}
          onClick={() => setFilter('year')}
        >
          연간
        </button>
        <button
          className={`filter-btn ${filter === 'month' ? 'active' : ''}`}
          onClick={() => setFilter('month')}
        >
          월간
        </button>
        <button
          className={`filter-btn ${filter === 'week' ? 'active' : ''}`}
          onClick={() => setFilter('week')}
        >
          주간
        </button>
      </div>

      {filteredArchive.length === 0 ? (
        <div className="goals-archive-empty">
          <p>아직 아카이브된 목표가 없습니다.</p>
          <p className="hint">기간이 지난 목표는 자동으로 여기에 저장됩니다.</p>
        </div>
      ) : (
        <div className="goals-archive-list">
          {filteredArchive.map((item, index) => (
            <div key={index} className="goals-archive-item">
              <div className="archive-item-header">
                <span className={`archive-type-badge ${item.type}`}>
                  {getTypeLabel(item.type)}
                </span>
                <span className="archive-period">{getPeriodLabel(item.key)}</span>
                <span className="archive-stats">{getCompletionStats(item.goals)}</span>
                <span className="archive-date">
                  아카이브: {formatDate(item.archivedAt)}
                </span>
              </div>
              <div className="archive-goals-list">
                {item.goals.map(goal => (
                  <div
                    key={goal.id}
                    className={`archive-goal ${goal.completed ? 'completed' : ''}`}
                  >
                    <span className="archive-goal-check">
                      {goal.completed ? '✓' : '○'}
                    </span>
                    <span className="archive-goal-text">{goal.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default GoalsArchive
