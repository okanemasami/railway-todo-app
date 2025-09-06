import { useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { PencilIcon } from '~/icons/PencilIcon'
import { CheckIcon } from '~/icons/CheckIcon'
import { updateTask } from '~/store/task'
import './TaskItem.css'

export const TaskItem = ({ task }) => {
  const dispatch = useDispatch()

  const { listId } = useParams()
  const { id, title, detail, done, limit } = task

  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatLimitForDisplay = value => {
    if (!value) return null
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):\d{2}:\d{2}Z$/)
    if (m) {
      const [, yyyy, mm, dd, hh] = m
      return `${yyyy}年${Number(mm)}月${Number(dd)}日${Number(hh)}時00分`
    }
    return value
  }

  const formatRemainingTime = value => {
    if (!value) return '期限超過'
    const ms = Date.parse(value) - Date.now()
    if (Number.isNaN(ms) || ms <= 0) return '期限超過'
    const dayMs = 24 * 60 * 60 * 1000
    const hourMs = 60 * 60 * 1000
    const days = Math.floor(ms / dayMs)
    const hours = Math.floor((ms % dayMs) / hourMs)
    return `${days}日${hours}時間00分`
  }

  const handleToggle = useCallback(() => {
    setIsSubmitting(true)
    void dispatch(updateTask({ id, done: !done })).finally(() => {
      setIsSubmitting(false)
    })
  }, [id, done])

  return (
    <div className="task_item">
      <div className="task_item__title_container">
        <button
          type="button"
          onClick={handleToggle}
          disabled={isSubmitting}
          className="task__item__mark_button"
        >
          {done ? (
            <div className="task_item__mark____complete" aria-label="Completed">
              <CheckIcon className="task_item__mark____complete_check" />
            </div>
          ) : (
            <div
              className="task_item__mark____incomplete"
              aria-label="Incomplete"
            ></div>
          )}
        </button>
        <div className="task_item__title" data-done={done}>
          {title}
        </div>
        <div aria-hidden className="task_item__title_spacer"></div>
        <Link
          to={`/lists/${listId}/tasks/${id}`}
          className="task_item__title_action"
        >
          <PencilIcon aria-label="Edit" />
        </Link>
      </div>
      <div className="task_item__detail">{detail}</div>
      <div className="task_item__limit">
        <span className="task_item__limit_label">タスク期限：</span>
        <span className="task_item__limit_value">{limit ? formatLimitForDisplay(limit) : '未設定'}</span>
      </div>
      <div className="task_item__limit">
        <span className="task_item__limit_label">タスク期限までの残り時間：</span>
        <span className="task_item__limit_value">{formatRemainingTime(limit)}</span>
      </div>
    </div>
  )
}
