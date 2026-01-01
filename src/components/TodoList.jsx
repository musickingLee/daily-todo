import { useState, useEffect, useRef } from 'react'
import MemoModal from './MemoModal'
import TipTapEditor from './TipTapEditor'

function TodoList({ dateKey, dateDisplay, isToday, categories, onTimerUpdate }) {
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [openMemoId, setOpenMemoId] = useState(null)
  const [openCategoryId, setOpenCategoryId] = useState(null)
  const [modalTodoId, setModalTodoId] = useState(null)
  const [editingTodoId, setEditingTodoId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [activeTimerId, setActiveTimerId] = useState(null)
  const [, setTick] = useState(0)
  const [draggedId, setDraggedId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)
  const inputRef = useRef(null)
  const editInputRef = useRef(null)
  const isInitialLoad = useRef(true)
  const timerIntervalRef = useRef(null)

  useEffect(() => {
    isInitialLoad.current = true
    const stored = localStorage.getItem(`todos-${dateKey}`)
    if (stored) {
      const parsedTodos = JSON.parse(stored)
      // Check if any timer was running (for page reload recovery)
      const runningTimer = parsedTodos.find(t => t.timerStartedAt)
      if (runningTimer && isToday) {
        setActiveTimerId(runningTimer.id)
      }
      setTodos(parsedTodos)
    } else {
      setTodos([])
    }
    setOpenMemoId(null)
    setOpenCategoryId(null)
    setModalTodoId(null)
    setEditingTodoId(null)
    setTimeout(() => {
      isInitialLoad.current = false
    }, 0)
  }, [dateKey, isToday])

  // Timer tick effect
  useEffect(() => {
    if (activeTimerId && isToday) {
      timerIntervalRef.current = setInterval(() => {
        setTick(t => t + 1)
        if (onTimerUpdate) {
          onTimerUpdate()
        }
      }, 1000)
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [activeTimerId, isToday, onTimerUpdate])

  useEffect(() => {
    if (isInitialLoad.current) return

    localStorage.setItem(`todos-${dateKey}`, JSON.stringify(todos))

    if (todos.length > 0) {
      const datesWithData = JSON.parse(localStorage.getItem('dates-with-data') || '[]')
      if (!datesWithData.includes(dateKey)) {
        datesWithData.push(dateKey)
        localStorage.setItem('dates-with-data', JSON.stringify(datesWithData))
      }
    }
  }, [todos, dateKey])

  useEffect(() => {
    if (isToday && inputRef.current) {
      inputRef.current.focus({ preventScroll: true })
    }
  }, [isToday])

  useEffect(() => {
    if (editingTodoId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingTodoId])

  const handleKeyDown = (e) => {
    if (e.nativeEvent.isComposing) return
    if (e.key === 'Enter' && inputValue.trim()) {
      const newTodo = {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false,
        memo: '',
        categoryId: null,
        timeSpent: 0,
        timerStartedAt: null,
        sessions: [] // New: array of {start, end} timestamps
      }
      setTodos([...todos, newTodo])
      setInputValue('')
    }
  }

  const toggleTodo = (id) => {
    if (!isToday) return // Archive에서는 수정 불가
    const todo = todos.find(t => t.id === id)
    if (!todo) return

    // 완료 체크 시 타이머가 돌고 있으면 자동 정지
    if (!todo.completed && activeTimerId === id) {
      const now = Date.now()
      if (todo.timerStartedAt) {
        const elapsed = Math.floor((now - todo.timerStartedAt) / 1000)
        const newSession = { start: todo.timerStartedAt, end: now }
        const sessions = [...(todo.sessions || []), newSession]

        setTodos(todos.map(t =>
          t.id === id ? {
            ...t,
            completed: true,
            timeSpent: t.timeSpent + elapsed,
            timerStartedAt: null,
            sessions
          } : t
        ))
        setActiveTimerId(null)
        return
      }
    }

    setTodos(todos.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ))
  }

  const deleteTodo = (id) => {
    if (activeTimerId === id) {
      setActiveTimerId(null)
    }
    setTodos(todos.filter(todo => todo.id !== id))
    if (openMemoId === id) setOpenMemoId(null)
    if (openCategoryId === id) setOpenCategoryId(null)
  }

  const toggleMemo = (id) => {
    setOpenMemoId(openMemoId === id ? null : id)
    setOpenCategoryId(null)
  }

  const toggleCategoryPicker = (id) => {
    setOpenCategoryId(openCategoryId === id ? null : id)
    setOpenMemoId(null)
  }

  const updateMemo = (id, memo) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, memo } : todo
    ))
  }

  const updateCategory = (id, categoryId) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, categoryId } : todo
    ))
    setOpenCategoryId(null)
  }

  const getCategory = (categoryId) => {
    return categories.find(c => c.id === categoryId)
  }

  const openMemoModal = (id) => {
    setModalTodoId(id)
    setOpenCategoryId(null)
  }

  const closeMemoModal = () => {
    setModalTodoId(null)
  }

  const startEditing = (todo) => {
    if (!isToday) return
    setEditingTodoId(todo.id)
    setEditingText(todo.text)
  }

  const cancelEditing = () => {
    setEditingTodoId(null)
    setEditingText('')
  }

  const saveEditing = () => {
    if (editingText.trim()) {
      setTodos(todos.map(todo =>
        todo.id === editingTodoId ? { ...todo, text: editingText.trim() } : todo
      ))
    }
    setEditingTodoId(null)
    setEditingText('')
  }

  const handleEditKeyDown = (e) => {
    if (e.nativeEvent.isComposing) return
    if (e.key === 'Enter') {
      saveEditing()
    } else if (e.key === 'Escape') {
      cancelEditing()
    }
  }

  // Timer functions with session tracking
  const toggleTimer = (id) => {
    const todo = todos.find(t => t.id === id)
    if (!todo) return

    const now = Date.now()

    if (activeTimerId === id) {
      // Stop this timer - complete the current session
      if (todo.timerStartedAt) {
        const elapsed = Math.floor((now - todo.timerStartedAt) / 1000)
        const newSession = { start: todo.timerStartedAt, end: now }
        const sessions = [...(todo.sessions || []), newSession]

        setTodos(todos.map(t =>
          t.id === id ? {
            ...t,
            timeSpent: t.timeSpent + elapsed,
            timerStartedAt: null,
            sessions
          } : t
        ))
      }
      setActiveTimerId(null)
    } else {
      // Stop any running timer first
      let updatedTodos = todos
      if (activeTimerId) {
        const runningTodo = todos.find(t => t.id === activeTimerId)
        if (runningTodo && runningTodo.timerStartedAt) {
          const elapsed = Math.floor((now - runningTodo.timerStartedAt) / 1000)
          const newSession = { start: runningTodo.timerStartedAt, end: now }
          const sessions = [...(runningTodo.sessions || []), newSession]

          updatedTodos = todos.map(t =>
            t.id === activeTimerId ? {
              ...t,
              timeSpent: t.timeSpent + elapsed,
              timerStartedAt: null,
              sessions
            } : t
          )
        }
      }
      // Start new timer
      setTodos(updatedTodos.map(t =>
        t.id === id ? { ...t, timerStartedAt: now } : t
      ))
      setActiveTimerId(id)
    }
  }

  const getElapsedTime = (todo) => {
    let total = todo.timeSpent || 0
    if (todo.timerStartedAt && activeTimerId === todo.id) {
      total += Math.floor((Date.now() - todo.timerStartedAt) / 1000)
    }
    return total
  }

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Drag and drop handlers
  const handleDragStart = (e, id) => {
    if (!isToday) return
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, id) => {
    e.preventDefault()
    if (!isToday || draggedId === id) return
    setDragOverId(id)
  }

  const handleDragLeave = () => {
    setDragOverId(null)
  }

  const handleDrop = (e, targetId) => {
    e.preventDefault()
    if (!isToday || !draggedId || draggedId === targetId) {
      setDraggedId(null)
      setDragOverId(null)
      return
    }

    const draggedIndex = todos.findIndex(t => t.id === draggedId)
    const targetIndex = todos.findIndex(t => t.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newTodos = [...todos]
    const [draggedItem] = newTodos.splice(draggedIndex, 1)
    newTodos.splice(targetIndex, 0, draggedItem)

    setTodos(newTodos)
    setDraggedId(null)
    setDragOverId(null)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDragOverId(null)
  }

  const modalTodo = todos.find(t => t.id === modalTodoId)

  return (
    <div className="todo-container">
      <h1 className="date-header">{dateDisplay}</h1>

      <div className="todo-list">
        {todos.map(todo => {
          const category = getCategory(todo.categoryId)
          const elapsed = getElapsedTime(todo)
          const isTimerRunning = activeTimerId === todo.id
          const isDragging = draggedId === todo.id
          const isDragOver = dragOverId === todo.id
          return (
            <div
              key={todo.id}
              className={`todo-item-wrapper ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
              draggable={isToday}
              onDragStart={(e) => handleDragStart(e, todo.id)}
              onDragOver={(e) => handleDragOver(e, todo.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, todo.id)}
              onDragEnd={handleDragEnd}
            >
              <div
                className={`todo-item ${todo.completed ? 'completed' : ''}`}
                style={category ? { borderLeftColor: category.color, borderLeftWidth: '4px' } : {}}
              >
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    disabled={!isToday}
                  />
                  <span className="checkmark"></span>
                </label>
                {editingTodoId === todo.id ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    onBlur={saveEditing}
                    className="todo-edit-input"
                  />
                ) : (
                  <span
                    className="todo-text"
                    onDoubleClick={() => startEditing(todo)}
                    title={isToday ? "더블클릭하여 수정" : ""}
                  >
                    {todo.text}
                  </span>
                )}

                {isToday && !(editingTodoId === todo.id) && (
                  <div className="timer-container">
                    <span className={`timer-display ${isTimerRunning ? 'running' : ''}`}>
                      {formatTime(elapsed)}
                    </span>
                    <button
                      className={`timer-btn ${isTimerRunning ? 'running' : ''}`}
                      onClick={() => toggleTimer(todo.id)}
                      title={isTimerRunning ? "일시정지" : "시작"}
                    >
                      {isTimerRunning ? '⏸️' : '▶️'}
                    </button>
                  </div>
                )}

                {!isToday && elapsed > 0 && (
                  <span className="timer-display readonly">{formatTime(elapsed)}</span>
                )}

                {isToday && !(editingTodoId === todo.id) && (
                  <button
                    className={`category-picker-btn ${todo.categoryId ? 'has-category' : ''}`}
                    onClick={() => toggleCategoryPicker(todo.id)}
                    title="카테고리"
                    style={category ? { color: category.color } : {}}
                  >
                    {category ? '●' : '○'}
                  </button>
                )}
                {!isToday && category && (
                  <span className="category-indicator" style={{ color: category.color }}>●</span>
                )}
                {!(editingTodoId === todo.id) && (
                  <>
                    <button
                      className={`memo-btn ${todo.memo ? 'has-memo' : ''}`}
                      onClick={() => toggleMemo(todo.id)}
                      title="간단 메모"
                    >
                      📝
                    </button>
                    <button
                      className={`expand-memo-btn ${todo.memo ? 'has-memo' : ''}`}
                      onClick={() => openMemoModal(todo.id)}
                      title="전체 메모장"
                    >
                      📄
                    </button>
                  </>
                )}
                {isToday && !(editingTodoId === todo.id) && (
                  <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>×</button>
                )}
              </div>

              {openCategoryId === todo.id && (
                <div className="category-picker">
                  <button
                    className={`category-option ${!todo.categoryId ? 'selected' : ''}`}
                    onClick={() => updateCategory(todo.id, null)}
                  >
                    <span className="category-option-color" style={{ background: '#ccc' }}>○</span>
                    <span>없음</span>
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      className={`category-option ${todo.categoryId === cat.id ? 'selected' : ''}`}
                      onClick={() => updateCategory(todo.id, cat.id)}
                    >
                      <span className="category-option-color" style={{ background: cat.color }}>●</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {openMemoId === todo.id && (
                <div className="memo-area">
                  <div className="inline-memo-tiptap">
                    <TipTapEditor
                      content={todo.memo || ''}
                      onChange={(html) => updateMemo(todo.id, html)}
                      placeholder="메모를 입력하세요..."
                      isReadOnly={!isToday}
                      compact={true}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {isToday && (
        <div className="input-area">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="할 일을 입력하고 Enter..."
            className="todo-input"
          />
        </div>
      )}

      {modalTodo && (
        <MemoModal
          isOpen={true}
          onClose={closeMemoModal}
          memo={modalTodo.memo}
          onSave={(memo) => updateMemo(modalTodo.id, memo)}
          todoText={modalTodo.text}
          isReadOnly={!isToday}
        />
      )}
    </div>
  )
}

export default TodoList
