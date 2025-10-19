import { useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { PencilIcon } from '~/icons/PencilIcon'
import { CheckIcon } from '~/icons/CheckIcon'
import { CalendarIcon } from '~/icons/CalendarIcon'
import { updateTask } from '~/store/task'
import { formatISOToJapanese } from '~/utils/dateUtils'
import { TaskEditModal } from '~/components/TaskEditModal'
import './TaskItem.css'

/**
 * TaskItem - タスク1件を表示するコンポーネント
 *
 * 【機能】
 * - タスクの完了/未完了をチェックボックスで切り替え
 * - タイトルと詳細を表示
 * - 期限がある場合は期限と残り時間を表示
 * - 編集ボタンでタスク編集モーダルを開く
 *
 * 【受け取るもの】
 * @param {object} task - タスクデータ
 *   - id: タスクID
 *   - title: タスクのタイトル
 *   - detail: タスクの詳細
 *   - done: 完了フラグ（true/false）
 *   - limit: 期限（ISO 8601形式、UTC）
 *
 * 【返すもの】
 * - タスク1件のHTML要素
 */
export const TaskItem = ({ task }) => {
  const dispatch = useDispatch()
  const { listId } = useParams()

  // taskオブジェクトから必要な情報を取り出す
  const { id, title, detail, done, limit } = task

  // 状態管理
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  // 期限をフォーマット（UTC → JST変換）
  // 例: "2025-10-25T07:30:00Z" → "2025/10/25 16:30"
  const formattedLimit = formatISOToJapanese(limit)

  /**
   * 期限までの残り時間を計算する関数
   * @param {string} iso - ISO 8601形式の期限日時（UTC）
   * @returns {object|null} - { text: 表示テキスト, isOverdue: 期限超過フラグ }
   */
  const calculateTimeRemaining = (iso) => {
    // 期限が設定されていない場合
    if (!iso) return null

    // ISO文字列をDateオブジェクトに変換
    const limitDate = new Date(iso)
    const now = new Date()

    // 現在時刻と期限の差分をミリ秒で計算
    const diffMs = limitDate - now

    // 期限超過の場合（差分がマイナス）
    if (diffMs < 0) {
      return {
        text: '期限超過',
        isOverdue: true
      }
    }

    // 差分を各単位に変換
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    // 1日以上残っている場合
    if (diffDays > 0) {
      const remainingHours = Math.floor(
        (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      )
      return {
        text: `残り${diffDays}日${remainingHours}時間`,
        isOverdue: false
      }
    }

    // 1時間以上残っている場合
    if (diffHours > 0) {
      const remainingMinutes = Math.floor(
        (diffMs % (1000 * 60 * 60)) / (1000 * 60)
      )
      return {
        text: `残り${diffHours}時間${remainingMinutes}分`,
        isOverdue: false
      }
    }

    // 1時間未満の場合
    return {
      text: `残り${diffMinutes}分`,
      isOverdue: false
    }
  }

  // 残り時間を計算
  const timeRemaining = calculateTimeRemaining(limit)

  /**
   * チェックボックスをクリックした時の処理
   * タスクの完了/未完了を切り替える
   */
  const handleToggle = useCallback(() => {
    setIsSubmitting(true)

    void dispatch(
      updateTask({
        id,
        done: !done, // 現在の状態を反転
      })
    ).finally(() => {
      setIsSubmitting(false)
    })
  }, [id, done, dispatch])

  return (
    <div className="task_item">
      {/* タイトル行 */}
      <div className="task_item__title_container">
        {/* 完了/未完了チェックボックス */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={isSubmitting}
          className="task__item__mark_button"
        >
          {done ? (
            // 完了状態のチェックマーク
            <div
              className="task_item__mark____complete"
              aria-label="Completed"
            >
              <CheckIcon className="task_item__mark____complete_check" />
            </div>
          ) : (
            // 未完了状態の空の丸
            <div
              className="task_item__mark____incomplete"
              aria-label="Incomplete"
            />
          )}
        </button>

        {/* タイトル */}
        <div className="task_item__title" data-done={done}>
          {title}
        </div>

        {/* 空白（タイトルと編集ボタンの間） */}
        <div aria-hidden className="task_item__title_spacer" />

        {/* 編集ボタン */}
        <button
          type="button"
          className="task_item__title_action"
          onClick={() => setIsEditOpen(true)}
        >
          <PencilIcon aria-label="Edit" />
        </button>
      </div>

      {/* 詳細 */}
      <div className="task_item__detail">{detail}</div>

      {/* 期限情報（期限が設定されている場合のみ表示） */}
      {limit && (
        <div className="task_item__limit_row">
          {/* 期限日時 */}
          <div className="task_item__limit">
            <CalendarIcon className="task_item__limit_icon" />
            <span className="task_item__limit_value">{formattedLimit}</span>
          </div>

          {/* 残り時間バッジ */}
          {timeRemaining && (
            <div
              className="task_item__time_badge"
              data-overdue={timeRemaining.isOverdue}
            >
              <span className="task_item__time_badge_text">
                {timeRemaining.text}
              </span>
            </div>
          )}
        </div>
      )}

      {/* タスク編集モーダル */}
      <TaskEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        listId={listId}
        taskId={id}
      />
    </div>
  )
}
