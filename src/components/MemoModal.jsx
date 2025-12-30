import { useState, useEffect } from 'react'
import TipTapEditor from './TipTapEditor'

function MemoModal({ isOpen, onClose, memo, onSave, todoText, isReadOnly }) {
  const [content, setContent] = useState(memo || '')

  useEffect(() => {
    setContent(memo || '')
  }, [memo])

  if (!isOpen) return null

  const handleSave = () => {
    onSave(content)
    onClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className="memo-modal-overlay" onClick={onClose} onKeyDown={handleKeyDown}>
      <div className="memo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="memo-modal-header">
          <h2 className="memo-modal-title">{todoText}</h2>
          <div className="memo-modal-actions">
            <button className="memo-modal-close" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="memo-modal-body">
          <div className="memo-tiptap-container">
            <TipTapEditor
              content={content}
              onChange={setContent}
              placeholder="마크다운으로 메모를 작성하세요...

# 제목
## 소제목

**굵게** *기울임* ~~취소선~~

- 목록 항목
- [ ] 체크박스 (Ctrl/Cmd + Shift + 9)

> 인용문

`코드`"
              isReadOnly={isReadOnly}
              compact={false}
            />
          </div>
        </div>

        {!isReadOnly && (
          <div className="memo-modal-footer">
            <button className="memo-cancel-btn" onClick={onClose}>취소</button>
            <button className="memo-save-btn" onClick={handleSave}>저장</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MemoModal
