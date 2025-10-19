import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Modal } from '~/components/ui/Modal'
import { AppTextField } from '~/components/ui/AppTextField'
import { FormActions } from '~/components/ui/FormActions'
import { updateTask, deleteTask, fetchTasks } from '~/store/task'
import { setCurrentList } from '~/store/list'
import { useId } from '~/hooks/useId'
import { CalendarIcon } from '~/icons/CalendarIcon'
import { LimitPicker } from '~/components/LimitPicker'
import { formatISOToJapanese } from '~/utils/dateUtils'
import parseLimitText from '~/utils/parseLimitText'
import './TaskEditModal.css'

/**
 * TaskEditModal - タスク編集モーダル
 *
 * 【機能】
 * - タスクのタイトル、詳細、完了状態、期限を編集
 * - Updateボタンで変更を保存
 * - Deleteボタンでタスクを削除
 * - カレンダーアイコンから期限を設定
 *
 * 【受け取るもの】
 * @param {boolean} isOpen - モーダルの開閉状態
 * @param {function} onClose - モーダルを閉じる処理
 * @param {string} listId - タスクが所属するリストID
 * @param {string} taskId - 編集対象のタスクID
 *
 * 【返すもの】
 * - モーダルのHTML要素
 */
export const TaskEditModal = ({ isOpen, onClose, listId, taskId }) => {
  const dispatch = useDispatch()
  const id = useId()

  // Redux storeから編集対象のタスクを取得
  const task = useSelector((state) =>
    state.task.tasks?.find((task) => task.id === taskId)
  )

  // 状態管理
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [done, setDone] = useState(false)
  const [limit, setLimit] = useState('')
  const [isLimitPickerOpen, setIsLimitPickerOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * モーダルが開いたときに現在のリストを設定し、タスク一覧を最新化
   */
  useEffect(() => {
    if (!isOpen) return
    void dispatch(setCurrentList(listId))
    void dispatch(fetchTasks())
  }, [isOpen, listId, dispatch])

  /**
   * モーダルが開いたときのみ、taskの値でフォームを初期化
   * これにより、閉じる→開くときに未保存の変更が破棄される
   */
  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title)
      setDetail(task.detail)
      setDone(task.done)

      // ISO形式（UTC）をスラッシュ形式（JST）に変換して表示
      // 例: "2025-10-25T07:30:00Z" → "2025/10/25 16:30"
      const limitText = formatISOToJapanese(task.limit || '')
      setLimit(limitText)
    }
  }, [isOpen, task])

  /**
   * フォーム送信時の処理
   * タスク情報を更新してDBに保存
   */
  const onSubmit = useCallback(
    (event) => {
      event.preventDefault()
      setIsSubmitting(true)

      // スラッシュ形式（JST）をISO形式（UTC）に変換してDB保存
      // 例: "2025/10/25 16:30" → "2025-10-25T07:30:00Z"
      const nextLimit = parseLimitText(limit)

      void dispatch(
        updateTask({ id: taskId, title, detail, done, limit: nextLimit })
      )
        .unwrap()
        .then(() => {
          // 成功したらモーダルを閉じる
          onClose?.()
        })
        .catch((err) => {
          // エラーメッセージを表示
          setErrorMessage(err.message)
        })
        .finally(() => {
          setIsSubmitting(false)
        })
    },
    [title, detail, done, limit, taskId, onClose, dispatch]
  )

  /**
   * 期限設定ピッカーを開く
   */
  const openLimitPicker = useCallback(() => {
    setIsLimitPickerOpen(true)
  }, [])

  /**
   * 期限設定ピッカーを閉じる
   */
  const closeLimitPicker = useCallback(() => {
    setIsLimitPickerOpen(false)
  }, [])

  /**
   * 期限設定ピッカーで確定ボタンが押されたときの処理
   * @param {string} jpText - スラッシュ形式の日時（JST）
   */
  const handleConfirmLimit = useCallback((jpText) => {
    setLimit(jpText)
  }, [])

  /**
   * 削除ボタンをクリックした時の処理
   * 確認ダイアログを表示してからタスクを削除
   */
  const handleDelete = useCallback(() => {
    // 削除前に確認
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return
    }

    setIsSubmitting(true)

    void dispatch(deleteTask({ id: taskId }))
      .unwrap()
      .then(() => {
        // 成功したらモーダルを閉じる
        onClose?.()
      })
      .catch((err) => {
        // エラーメッセージを表示
        setErrorMessage(err.message)
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }, [taskId, onClose, dispatch])

  // モーダルのタイトルに使うID（アクセシビリティ対応）
  const titleId = `${id}-task-edit-title`

  return (
    <Modal isOpen={isOpen} onClose={onClose} titleId={titleId}>
      {/* モーダルヘッダー（タイトルと閉じるボタン） */}
      <div className="modal_header">
        <div id={titleId} className="modal_header_title">
          Edit Task
        </div>
        <div className="modal_spacer"></div>
        <button
          className="modal_close_button"
          aria-label="Close"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      {/* エラーメッセージ表示エリア */}
      <p className="edit_list__error">{errorMessage}</p>

      {/* タスク編集フォーム */}
      <form className="edit_list__form" onSubmit={onSubmit}>
        {/* タイトル入力フィールド */}
        <fieldset className="edit_list__form_field">
          <label htmlFor={`${id}-title`} className="edit_list__form_label">
            Title
          </label>
          <AppTextField
            id={`${id}-title`}
            placeholder="Buy some milk"
            value={title}
            required
            onChange={(e) => setTitle(e.target.value)}
          />
        </fieldset>

        {/* 詳細入力フィールド（複数行） */}
        <fieldset className="edit_list__form_field">
          <label htmlFor={`${id}-detail`} className="edit_list__form_label">
            Description
          </label>
          <AppTextField
            id={`${id}-detail`}
            placeholder="Blah blah blah"
            value={detail}
            multiline
            required
            onChange={(e) => setDetail(e.target.value)}
          />
        </fieldset>

        {/* 完了チェックボックス */}
        <fieldset className="edit_list__form_field">
          <div className="task_edit_modal__done_wrapper">
            <input
              id={`${id}-done`}
              type="checkbox"
              checked={done}
              onChange={(e) => setDone(e.target.checked)}
            />
            <label htmlFor={`${id}-done`} className="task_edit_modal__done_label">
              Is Done
            </label>
          </div>
        </fieldset>

        {/* 期限設定ボタン */}
        <fieldset className="edit_list__form_field">
          <button
            type="button"
            className="task_edit_modal__limit_button"
            onClick={openLimitPicker}
          >
            <CalendarIcon />
            <span className="task_edit_modal__limit_text">
              {limit && limit.trim() !== '' ? limit : '期限を設定'}
            </span>
          </button>
        </fieldset>

        {/* 期限設定ピッカーモーダル */}
        <LimitPicker
          isOpen={isLimitPickerOpen}
          onClose={closeLimitPicker}
          defaultLimitText={limit}
          onConfirm={handleConfirmLimit}
        />

        {/* ボタンエリア（Delete と Update） */}
        <FormActions
          buttons={[
            {
              text: 'Delete',
              onClick: handleDelete,
              className: 'edit_list__form_actions_delete',
            },
            {
              text: 'Update',
              type: 'submit',
            },
          ]}
          isSubmitting={isSubmitting}
        />
      </form>
    </Modal>
  )
}

export default TaskEditModal


