import { useState, useEffect, useCallback } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'
import DayTimeline from './DayTimeline'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

function TimeStats({ categories, timerTick, selectedDate, isArchive, archiveYear, archiveMonth }) {
  const [viewMode, setViewMode] = useState('timeline') // timeline, chart
  const [period, setPeriod] = useState('daily') // daily, weekly, monthly
  const [archivePeriod, setArchivePeriod] = useState('monthly') // monthly, yearly
  const [chartType, setChartType] = useState('pie') // pie, bar
  const [stats, setStats] = useState({})

  const getTodayKey = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  }

  const getDateRange = useCallback(() => {
    const dates = []

    // Archive 모드: 선택한 월 또는 연도의 날짜들
    if (isArchive && !selectedDate) {
      if (archivePeriod === 'monthly') {
        // 해당 월의 모든 날짜
        const daysInMonth = new Date(archiveYear, archiveMonth, 0).getDate()
        for (let day = 1; day <= daysInMonth; day++) {
          dates.push(`${archiveYear}-${String(archiveMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
        }
      } else if (archivePeriod === 'yearly') {
        // 해당 연도의 모든 날짜
        for (let month = 1; month <= 12; month++) {
          const daysInMonth = new Date(archiveYear, month, 0).getDate()
          for (let day = 1; day <= daysInMonth; day++) {
            dates.push(`${archiveYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
          }
        }
      }
      return dates
    }

    // Today 모드: 기존 로직
    const today = new Date()
    if (period === 'daily') {
      dates.push(getTodayKey())
    } else if (period === 'weekly') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        dates.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`)
      }
    } else if (period === 'monthly') {
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        dates.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`)
      }
    }

    return dates
  }, [period, isArchive, selectedDate, archivePeriod, archiveYear, archiveMonth])

  const calculateStats = useCallback(() => {
    const dates = getDateRange()
    const categoryTimes = {}
    let uncategorizedTime = 0

    dates.forEach(dateKey => {
      const stored = localStorage.getItem(`todos-${dateKey}`)
      if (stored) {
        const todos = JSON.parse(stored)
        todos.forEach(todo => {
          let time = todo.timeSpent || 0
          // Add running timer time for today
          if (todo.timerStartedAt && dateKey === getTodayKey()) {
            time += Math.floor((Date.now() - todo.timerStartedAt) / 1000)
          }

          if (time > 0) {
            if (todo.categoryId) {
              categoryTimes[todo.categoryId] = (categoryTimes[todo.categoryId] || 0) + time
            } else {
              uncategorizedTime += time
            }
          }
        })
      }
    })

    setStats({ categoryTimes, uncategorizedTime })
  }, [getDateRange])

  useEffect(() => {
    if (!isArchive && period === 'daily') {
      calculateStats()
    }
  }, [timerTick, period, calculateStats, isArchive])

  useEffect(() => {
    calculateStats()
  }, [period, archivePeriod, archiveYear, archiveMonth, isArchive, selectedDate, calculateStats])

  const formatTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds}초`
    }
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hrs > 0) {
      return `${hrs}시간 ${mins}분`
    }
    return `${mins}분`
  }

  // 차트용 짧은 형식
  const formatTimeShort = (seconds) => {
    if (seconds < 60) {
      return `${seconds}s`
    }
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hrs > 0) {
      return mins > 0 ? `${hrs}h${mins}m` : `${hrs}h`
    }
    return `${mins}m`
  }

  const getChartData = () => {
    const labels = []
    const data = []
    const colors = []

    categories.forEach(cat => {
      const time = stats.categoryTimes?.[cat.id] || 0
      if (time > 0) {
        labels.push(cat.name)
        data.push(time)
        colors.push(cat.color)
      }
    })

    if (stats.uncategorizedTime > 0) {
      labels.push('미분류')
      data.push(stats.uncategorizedTime)
      colors.push('#999999')
    }

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: colors.map(c => c),
        borderWidth: 1
      }]
    }
  }

  const chartData = getChartData()
  const hasData = chartData.datasets[0].data.length > 0
  const totalTime = Object.values(stats.categoryTimes || {}).reduce((a, b) => a + b, 0) + (stats.uncategorizedTime || 0)

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 12,
          usePointStyle: true,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw
            return ` ${formatTime(value)}`
          }
        }
      }
    }
  }

  const barOptions = {
    ...chartOptions,
    indexAxis: 'y',
    plugins: {
      ...chartOptions.plugins,
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        ticks: {
          callback: (value) => formatTimeShort(value),
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  }

  const periodLabels = {
    daily: '오늘',
    weekly: '이번 주',
    monthly: '이번 달'
  }

  const getArchivePeriodLabel = () => {
    if (archivePeriod === 'monthly') {
      return `${archiveYear}년 ${archiveMonth}월`
    }
    return `${archiveYear}년`
  }

  return (
    <div className="time-stats">
      <div className="stats-header">
        <h3 className="stats-title">시간 통계</h3>
        {viewMode === 'chart' && period !== 'daily' && (
          <button className="refresh-btn" onClick={calculateStats} title="새로고침">
            🔄
          </button>
        )}
      </div>

      {/* View mode toggle */}
      <div className="view-mode-selector">
        <button
          className={`view-mode-btn ${viewMode === 'timeline' ? 'active' : ''}`}
          onClick={() => setViewMode('timeline')}
        >
          타임라인
        </button>
        <button
          className={`view-mode-btn ${viewMode === 'chart' ? 'active' : ''}`}
          onClick={() => setViewMode('chart')}
        >
          차트
        </button>
      </div>

      {viewMode === 'timeline' ? (
        isArchive && !selectedDate ? (
          <div className="timeline-placeholder">
            <p>날짜를 선택하면<br/>타임라인을 볼 수 있습니다</p>
          </div>
        ) : (
          <DayTimeline categories={categories} timerTick={timerTick} dateKey={selectedDate} />
        )
      ) : (
        <>
          <div className="stats-controls">
            <div className="period-selector">
              {isArchive && !selectedDate ? (
                <>
                  <button
                    className={`period-btn ${archivePeriod === 'monthly' ? 'active' : ''}`}
                    onClick={() => setArchivePeriod('monthly')}
                  >
                    월별
                  </button>
                  <button
                    className={`period-btn ${archivePeriod === 'yearly' ? 'active' : ''}`}
                    onClick={() => setArchivePeriod('yearly')}
                  >
                    연별
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={`period-btn ${period === 'daily' ? 'active' : ''}`}
                    onClick={() => setPeriod('daily')}
                  >
                    일별
                  </button>
                  <button
                    className={`period-btn ${period === 'weekly' ? 'active' : ''}`}
                    onClick={() => setPeriod('weekly')}
                  >
                    주별
                  </button>
                  <button
                    className={`period-btn ${period === 'monthly' ? 'active' : ''}`}
                    onClick={() => setPeriod('monthly')}
                  >
                    월별
                  </button>
                </>
              )}
            </div>

            <div className="chart-type-selector">
              <button
                className={`chart-btn ${chartType === 'pie' ? 'active' : ''}`}
                onClick={() => setChartType('pie')}
                title="파이 차트"
              >
                🥧
              </button>
              <button
                className={`chart-btn ${chartType === 'bar' ? 'active' : ''}`}
                onClick={() => setChartType('bar')}
                title="막대 그래프"
              >
                📊
              </button>
            </div>
          </div>

          <div className="stats-summary">
            <span className="summary-label">
              {isArchive && !selectedDate ? getArchivePeriodLabel() : periodLabels[period]} 총
            </span>
            <span className="summary-value">{formatTime(totalTime)}</span>
          </div>

          <div className="chart-container">
            {hasData ? (
              chartType === 'pie' ? (
                <Pie data={chartData} options={chartOptions} />
              ) : (
                <Bar data={chartData} options={barOptions} />
              )
            ) : (
              <div className="no-data">
                <p>기록된 시간이 없습니다</p>
                <p className="no-data-hint">할 일의 ▶️ 버튼을 눌러<br/>시간을 기록해보세요</p>
              </div>
            )}
          </div>

          {hasData && (
            <div className="stats-breakdown">
              {categories.map(cat => {
                const time = stats.categoryTimes?.[cat.id] || 0
                if (time === 0) return null
                const percentage = totalTime > 0 ? Math.round((time / totalTime) * 100) : 0
                return (
                  <div key={cat.id} className="breakdown-item">
                    <span className="breakdown-color" style={{ background: cat.color }}></span>
                    <span className="breakdown-name">{cat.name}</span>
                    <span className="breakdown-time">{formatTime(time)}</span>
                    <span className="breakdown-percent">{percentage}%</span>
                  </div>
                )
              })}
              {stats.uncategorizedTime > 0 && (
                <div className="breakdown-item">
                  <span className="breakdown-color" style={{ background: '#999' }}></span>
                  <span className="breakdown-name">미분류</span>
                  <span className="breakdown-time">{formatTime(stats.uncategorizedTime)}</span>
                  <span className="breakdown-percent">
                    {Math.round((stats.uncategorizedTime / totalTime) * 100)}%
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default TimeStats
