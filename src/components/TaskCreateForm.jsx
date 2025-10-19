import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import './TaskCreateForm.css'
import { CheckIcon } from '~/icons/CheckIcon'
import { CalendarIcon } from '~/icons/CalendarIcon'
import { createTask } from '~/store/task'
import { FormActions } from './ui/FormActions'
import parseLimitText from '~/utils/parseLimitText'
import { LimitPicker } from '~/components/LimitPicker'

/**
 * TaskCreateForm - タスク作成フォーム
 *
 * 【機能】
 * - フォーカス時に展開、ブラー時に折りたたみ（自動展開/折りたたみ）
 * - タイトルと詳細を入力してタスクを作成
 * - 完了/未完了の初期状態を設定
 * - 期限を設定（カレンダーピッカー）
 * - Addボタンで保存、Discardボタンでクリア
 *
 * 【受け取るもの】
 * なし
 *
 * 【返すもの】
 * - フォームのHTML要素
 */
export const TaskCreateForm = () => {
  const dispatch = useDispatch()

  // ref管理
  const refForm = useRef(null)
  const [elemTextarea, setElemTextarea] = useState(null)

  // フォームの状態管理
  // 'initial': 折りたたみ状態
  // 'focused': 展開状態
  // 'submitting': 送信中
  const [formState, setFormState] = useState('initial')

  // 入力値の状態管理
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [done, setDone] = useState(false)
  const [limit, setLimit] = useState('')

  // 期限ピッカーの状態管理
  const [isLimitPickerOpen, setIsLimitPickerOpen] = useState(false)
  const isLimitPickerOpenRef = useRef(false) // ブラー処理でモーダル判定に使用

  /**
   * 完了/未完了チェックボックスをクリックした時の処理
   */
  const handleToggle = useCallback(() => {
    setDone((prev) => !prev)
  }, [])

  /**
   * フォーム内の要素がフォーカスされた時の処理
   * フォームを展開状態にする
   */
  const handleFocus = useCallback(() => {
    setFormState('focused')
  }, [])

  /**
   * フォーム内の要素がフォーカスを失った時の処理
   * 条件を満たす場合にフォームを折りたたむ
   */
  const handleBlur = useCallback(() => {
    // タイトルまたは詳細が入力されている場合は何もしない
    if (title || detail) {
      return
    }

    // 少し待ってから処理（他の要素にフォーカスが移る時間を確保）
    setTimeout(() => {
      // 期限ピッカーが開いている場合は折りたたまない
      if (isLimitPickerOpenRef.current) {
        return
      }

      // フォーム内の要素がフォーカスされている場合は何もしない
      const formElement = refForm.current
      if (formElement && formElement.contains(document.activeElement)) {
        return
      }

      // フォームを折りたたむ
      setFormState('initial')
      setDone(false)
    }, 100)
  }, [title, detail])

  /**
   * Discardボタンをクリックした時の処理
   * 入力内容をクリアしてフォームを折りたたむ
   */
  const handleDiscard = useCallback(() => {
    setTitle('')
    setDetail('')
    setLimit('')
    setFormState('initial')
    setDone(false)
  }, [])

  /**
   * 期限設定ピッカーを開く
   */
  const openLimitPicker = useCallback(() => {
    isLimitPickerOpenRef.current = true
    setIsLimitPickerOpen(true)
  }, [])

  /**
   * 期限設定ピッカーを閉じる
   */
  const closeLimitPicker = useCallback(() => {
    isLimitPickerOpenRef.current = false
    setIsLimitPickerOpen(false)
  }, [])

  /**
   * 期限ピッカーの開閉状態をrefに同期
   * ブラー処理でモーダルが開いているか判定するために使用
   */
  useEffect(() => {
    isLimitPickerOpenRef.current = isLimitPickerOpen
  }, [isLimitPickerOpen])

  /**
   * 期限設定ピッカーで確定ボタンが押されたときの処理
   * @param {string} jpText - スラッシュ形式の日時（JST）
   */
  const handleConfirmLimit = useCallback((jpText) => {
    setLimit(jpText)
  }, [])

  /**
   * フォーム送信時の処理
   * タスクを作成してDBに保存
   */
  const onSubmit = useCallback(
    (event) => {
      event.preventDefault()

      setFormState('submitting')

      // スラッシュ形式（JST）をISO形式（UTC）に変換してDB保存
      const nextLimit = parseLimitText(limit)

      void dispatch(createTask({ title, detail, done, limit: nextLimit }))
        .unwrap()
        .then(() => {
          // 成功したらフォームをクリア
          handleDiscard()
        })
        .catch((err) => {
          // エラーが発生した場合はアラートを表示
          alert(err.message)
          setFormState('focused')
        })
    },
    [title, detail, done, limit, dispatch, handleDiscard]
  )

  /**
   * 詳細入力欄（textarea）の高さを自動調整
   * 入力内容に応じて高さを変更（スクロールバーなしで全体を表示）
   */
  useEffect(() => {
    if (!elemTextarea) {
      return
    }

    // 高さを再計算する関数
    const recalcHeight = () => {
      elemTextarea.style.height = 'auto'
      elemTextarea.style.height = `${elemTextarea.scrollHeight}px`
    }

    // inputイベントで高さを再計算
    elemTextarea.addEventListener('input', recalcHeight)
    recalcHeight()

    // クリーンアップ
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
      {/* タイトル入力行（常に表示） */}
      <div className="task_create_form__title_container">
        {/* 完了/未完了チェックボックス */}
        <button
          type="button"
          onClick={handleToggle}
          className="task_create_form__mark_button"
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          {done ? (
            // 完了状態のチェックマーク
            <div
              className="task_create_form__mark____complete"
              aria-label="Completed"
            >
              <CheckIcon className="task_create_form__mark____complete_check" />
            </div>
          ) : (
            // 未完了状態の空の丸
            <div
              className="task_create_form__mark____incomplete"
              aria-label="Incomplete"
            ></div>
          )}
        </button>

        {/* タイトル入力フィールド */}
        <input
          type="text"
          className="task_create_form__title"
          placeholder="Add a new task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required
          disabled={formState === 'submitting'}
        />
      </div>

      {/* 展開時のみ表示される詳細入力エリア */}
      {formState !== 'initial' && (
        <div>
          {/* 詳細入力フィールド（複数行） */}
          <textarea
            ref={setElemTextarea}
            rows={1}
            className="task_create_form__detail"
            placeholder="Add a description here..."
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            onBlur={handleBlur}
            required
            disabled={formState === 'submitting'}
          />

          {/* 期限設定ボタン */}
          <div className="task_create_form__limit_row">
            <button
              type="button"
              className="task_create_form__limit_button_combo"
              onClick={openLimitPicker}
              onFocus={handleFocus}
              disabled={formState === 'submitting'}
            >
              <CalendarIcon />
              <span className="task_create_form__limit_text">
                {limit && limit.trim() !== '' ? limit : '期限を設定'}
              </span>
            </button>
          </div>

          {/* 期限設定ピッカーモーダル */}
          <LimitPicker
            isOpen={isLimitPickerOpen}
            onClose={closeLimitPicker}
            defaultLimitText={limit}
            onConfirm={handleConfirmLimit}
          />

          {/* ボタンエリア（Discard と Add） */}
          <FormActions
            buttons={[
              {
                text: 'Discard',
                onClick: handleDiscard,
                disabled:
                  (!title && !detail && !limit) || formState === 'submitting',
                variant: 'secondary',
              },
              {
                text: 'Add',
                type: 'submit',
              },
            ]}
            isSubmitting={formState === 'submitting'}
          />
        </div>
      )}
    </form>
  )
}
