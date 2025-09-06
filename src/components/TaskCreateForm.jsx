import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import './TaskCreateForm.css'
import { CheckIcon } from '~/icons/CheckIcon'
import { createTask } from '~/store/task'
import { FormActions } from './ui/FormActions'

export const TaskCreateForm = () => {
  const dispatch = useDispatch()

  const refForm = useRef(null)
  const [elemTextarea, setElemTextarea] = useState(null)

  const [formState, setFormState] = useState('initial')

  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [done, setDone] = useState(false)
  const [limit, setLimit] = useState('')

  const handleToggle = useCallback(() => {
    setDone(prev => !prev)
  }, [])

  const handleFocus = useCallback(() => {
    setFormState('focused')
  }, [])

  const handleBlur = useCallback(() => {
    if (title || detail) {
      return
    }

    setTimeout(() => {
      // フォーム内の要素がフォーカスされている場合は何もしない
      const formElement = refForm.current
      if (formElement && formElement.contains(document.activeElement)) {
        return
      }

      setFormState('initial')
      setDone(false)
    }, 100)
  }, [title, detail])

  const handleDiscard = useCallback(() => {
    setTitle('')
    setDetail('')
    setLimit('')
    setFormState('initial')
    setDone(false)
  }, [])

  const onSubmit = useCallback(
    event => {
      event.preventDefault()

      setFormState('submitting')

      const raw = limit && limit.trim() !== '' ? limit.trim() : ''
      let nextLimit = null
      if (raw) {
        // 日本語形式: 2025年10月21日22時 → ISO: YYYY-MM-DDTHH:00:00Z
        const jp = raw.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日(\d{1,2})時$/)
        if (jp) {
          const yyyy = jp[1]
          const mm = String(jp[2]).padStart(2, '0')
          const dd = String(jp[3]).padStart(2, '0')
          const hh = String(jp[4]).padStart(2, '0')
          nextLimit = `${yyyy}-${mm}-${dd}T${hh}:00:00Z`
        } else {
          // 旧形式サポート: YYYY-MM-DD-hh:mm:ss
          const m = raw.match(/^(\d{4}-\d{2}-\d{2})-(\d{2}:\d{2}:\d{2})$/)
          nextLimit = m ? `${m[1]}T${m[2]}Z` : raw
        }
      }

      void dispatch(createTask({ title, detail, done, limit: nextLimit }))
        .unwrap()
        .then(() => {
          handleDiscard()
        })
        .catch(err => {
          alert(err.message)
          setFormState('focused')
        })
    },
    [title, detail, done]
  )

  useEffect(() => {
    if (!elemTextarea) {
      return
    }

    const recalcHeight = () => {
      elemTextarea.style.height = 'auto'
      elemTextarea.style.height = `${elemTextarea.scrollHeight}px`
    }

    elemTextarea.addEventListener('input', recalcHeight)
    recalcHeight()

    return () => {
      elemTextarea.removeEventListener('input', recalcHeight)
    }
  }, [elemTextarea])

  return (
    <form
      ref={refForm}
      className="task_create_form"
      onSubmit={onSubmit}
      data-state={formState}
    >
      <div className="task_create_form__title_container">
        <button
          type="button"
          onClick={handleToggle}
          className="task_create_form__mark_button"
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          {done ? (
            <div
              className="task_create_form__mark____complete"
              aria-label="Completed"
            >
              <CheckIcon className="task_create_form__mark____complete_check" />
            </div>
          ) : (
            <div
              className="task_create_form__mark____incomplete"
              aria-label="Incomplete"
            ></div>
          )}
        </button>
        <input
          type="text"
          className="task_create_form__title"
          placeholder="Add a new task..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required
          disabled={formState === 'submitting'}
        />
      </div>
      {formState !== 'initial' && (
        <div>
          <textarea
            ref={setElemTextarea}
            rows={1}
            className="task_create_form__detail"
            placeholder="Add a description here..."
            value={detail}
            onChange={e => setDetail(e.target.value)}
            onBlur={handleBlur}
            required
            disabled={formState === 'submitting'}
          />
          <div className="task_create_form__limit_row">
            <span className="task_create_form__limit_label">タスク期限：</span>
            <input
              type="text"
              className="task_create_form__limit_input"
              placeholder="2025年10月21日22時"
              value={limit}
              onChange={e => setLimit(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={formState === 'submitting'}
            />
          </div>
          
          <FormActions
            leftButton={{
              text: 'Discard',
              onClick: handleDiscard,
              disabled: (!title && !detail) || formState === 'submitting',
            }}
            rightButton={{ text: 'Add', type: 'submit' }}
            isSubmitting={formState === 'submitting'}
          />
        </div>
      )}
    </form>
  )
}
