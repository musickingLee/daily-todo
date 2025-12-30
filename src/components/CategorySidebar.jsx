import { useState } from 'react'

const DEFAULT_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
]

function CategorySidebar({ categories, onCategoriesChange }) {
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(DEFAULT_COLORS[0])
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')

  const handleAdd = () => {
    if (newName.trim()) {
      const newCategory = {
        id: Date.now(),
        name: newName.trim(),
        color: newColor
      }
      onCategoriesChange([...categories, newCategory])
      setNewName('')
      setNewColor(DEFAULT_COLORS[0])
      setIsAdding(false)
    }
  }

  const handleDelete = (id) => {
    onCategoriesChange(categories.filter(c => c.id !== id))
  }

  const startEdit = (category) => {
    setEditingId(category.id)
    setEditName(category.name)
    setEditColor(category.color)
  }

  const handleEdit = () => {
    if (editName.trim()) {
      onCategoriesChange(categories.map(c =>
        c.id === editingId ? { ...c, name: editName.trim(), color: editColor } : c
      ))
      setEditingId(null)
    }
  }

  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter') {
      action()
    } else if (e.key === 'Escape') {
      setIsAdding(false)
      setEditingId(null)
    }
  }

  return (
    <div className="category-sidebar">
      <h3 className="sidebar-title">카테고리</h3>

      <div className="category-list">
        {categories.map(category => (
          <div key={category.id} className="category-item">
            {editingId === category.id ? (
              <div className="category-edit">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleEdit)}
                  className="category-name-input"
                  autoFocus
                />
                <div className="color-picker">
                  {DEFAULT_COLORS.map(color => (
                    <button
                      key={color}
                      className={`color-option ${editColor === color ? 'selected' : ''}`}
                      style={{ background: color }}
                      onClick={() => setEditColor(color)}
                    />
                  ))}
                </div>
                <div className="edit-actions">
                  <button className="save-btn" onClick={handleEdit}>저장</button>
                  <button className="cancel-btn" onClick={() => setEditingId(null)}>취소</button>
                </div>
              </div>
            ) : (
              <div className="category-display">
                <span className="category-color" style={{ background: category.color }} />
                <span className="category-name">{category.name}</span>
                <div className="category-actions">
                  <button className="edit-btn" onClick={() => startEdit(category)}>✎</button>
                  <button className="delete-category-btn" onClick={() => handleDelete(category.id)}>×</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {isAdding ? (
        <div className="category-add-form">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, handleAdd)}
            placeholder="카테고리 이름"
            className="category-name-input"
            autoFocus
          />
          <div className="color-picker">
            {DEFAULT_COLORS.map(color => (
              <button
                key={color}
                className={`color-option ${newColor === color ? 'selected' : ''}`}
                style={{ background: color }}
                onClick={() => setNewColor(color)}
              />
            ))}
          </div>
          <div className="edit-actions">
            <button className="save-btn" onClick={handleAdd}>추가</button>
            <button className="cancel-btn" onClick={() => setIsAdding(false)}>취소</button>
          </div>
        </div>
      ) : (
        <button className="add-category-btn" onClick={() => setIsAdding(true)}>
          + 카테고리 추가
        </button>
      )}
    </div>
  )
}

export default CategorySidebar
