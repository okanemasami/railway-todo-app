import { useCallback, useEffect, useMemo, useState } from 'react'
import { Modal } from '~/components/ui/Modal'
import { FormActions } from '~/components/ui/FormActions'
import './LimitPicker.css'
import parseLimitText from '~/utils/parseLimitText'

/**
 * LimitPicker - 期限設定ピッカー（カレンダー + 時刻選択）
 *
 * 【機能】
 * - カレンダー表示（月単位で前月/次月ボタンで移動）
 * - 日付選択（クリックで日を選択）
 * - 時刻選択（30分単位のドロップダウン）
 * - Confirmボタンでスラッシュ形式（YYYY/M/D H:MM）を親に渡す
 * - Clearボタンで期限をクリア（空文字を親に渡す）
 *
 * 【受け取るもの】
 * @param {boolean} isOpen - モーダルの開閉状態
 * @param {function} onClose - モーダルを閉じる処理
 * @param {string} defaultLimitText - 初期値（スラッシュ形式またはISO形式）
 * @param {function} onConfirm - 確定時のコールバック（引数: スラッシュ形式の日時文字列）
 *
 * 【返すもの】
 * - モーダルのHTML要素
 */
export const LimitPicker = ({ isOpen, onClose, defaultLimitText, onConfirm }) => {
  // 状態管理
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1) // 1-12
  const [selectedDate, setSelectedDate] = useState(null) // YYYY-MM-DD 形式
  const [selectedTime, setSelectedTime] = useState(null) // HH:MM 形式

  /**
   * 初期値をパースして日付と時刻に分解
   * スラッシュ形式（JST）またはISO形式（UTC）から内部形式に変換
   * @param {string} text - 期限文字列
   * @returns {object} - { date: 'YYYY-MM-DD', time: 'HH:MM' } または null
   */
  const parseDefault = useCallback((text) => {
    if (!text) return { date: null, time: null }

    // スラッシュ形式や日本語形式をISO形式（UTC）に変換
    const iso = parseLimitText(text)
    if (!iso) return { date: null, time: null }

    try {
      // ISO文字列（UTC）をDateオブジェクトに変換
      const utcDate = new Date(iso)

      // 日本時間（UTC+9）に変換
      const jstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000)

      // 日付と時刻を抽出（UTCメソッドを使って、JSTとして調整済みの値を取得）
      const yyyy = String(jstDate.getUTCFullYear())
      const mm = String(jstDate.getUTCMonth() + 1).padStart(2, '0')
      const dd = String(jstDate.getUTCDate()).padStart(2, '0')
      const hh = String(jstDate.getUTCHours()).padStart(2, '0')
      const mi = String(jstDate.getUTCMinutes()).padStart(2, '0')

      return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${mi}` }
    } catch (error) {
      console.error('Failed to parse limit text:', error)
      return { date: null, time: null }
    }
  }, [])

  /**
   * モーダルが開いたときに初期値を設定
   * - 既存の期限がある場合はその値を復元
   * - ない場合は現在の年月をカレンダーに表示
   */
  useEffect(() => {
    if (!isOpen) return

    const { date, time } = parseDefault(defaultLimitText)

    if (date) {
      // 既存の期限がある場合
      const [y, m] = date.split('-').map(Number)
      setYear(y)
      setMonth(m)
      setSelectedDate(date)
    } else {
      // 期限がない場合は現在の年月を表示
      const now = new Date()
      setYear(now.getFullYear())
      setMonth(now.getMonth() + 1)
      setSelectedDate(null)
    }

    setSelectedTime(time)
  }, [isOpen, defaultLimitText, parseDefault])

  /**
   * 選択中の年月の日数を計算
   * 例: 2025年2月 → 28日
   */
  const daysInMonth = useMemo(() => {
    return new Date(year, month, 0).getDate()
  }, [year, month])

  /**
   * 選択中の月の1日が何曜日か計算
   * 0=日曜日, 1=月曜日, ..., 6=土曜日
   */
  const firstDayOfWeek = useMemo(() => {
    return new Date(year, month - 1, 1).getDay()
  }, [year, month])

  /**
   * カレンダーの日付配列を生成
   * 先頭に空白（null）を追加して曜日を揃える
   * 例: [null, null, 1, 2, 3, ...]（1日が火曜日の場合）
   */
  const calendarDays = useMemo(() => {
    const days = []

    // 月の最初の曜日まで空白を追加
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }

    // 1日から月末まで追加
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d)
    }

    return days
  }, [firstDayOfWeek, daysInMonth])

  /**
   * 前月ボタンをクリックした時の処理
   * 1月の場合は前年の12月に移動
   */
  const handlePrevMonth = useCallback(() => {
    if (month === 1) {
      setYear(year - 1)
      setMonth(12)
    } else {
      setMonth(month - 1)
    }
  }, [year, month])

  /**
   * 次月ボタンをクリックした時の処理
   * 12月の場合は翌年の1月に移動
   */
  const handleNextMonth = useCallback(() => {
    if (month === 12) {
      setYear(year + 1)
      setMonth(1)
    } else {
      setMonth(month + 1)
    }
  }, [year, month])

  /**
   * カレンダーの日付をクリックした時の処理
   * @param {number} day - クリックされた日（1〜31）
   */
  const handleDateClick = useCallback(
    (day) => {
      const mm = String(month).padStart(2, '0')
      const dd = String(day).padStart(2, '0')
      setSelectedDate(`${year}-${mm}-${dd}`)
    },
    [year, month]
  )

  /**
   * 時刻選択のオプション一覧を生成（30分単位）
   * 例: ['00:00', '00:30', '01:00', ..., '23:30']
   */
  const timeOptions = useMemo(() => {
    const opts = []
    for (let h = 0; h < 24; h++) {
      for (let m of [0, 30]) {
        const hh = String(h).padStart(2, '0')
        const mm = String(m).padStart(2, '0')
        opts.push(`${hh}:${mm}`)
      }
    }
    return opts
  }, [])

  /**
   * Confirmボタンが有効かどうか判定
   * 日付と時刻の両方が選択されている場合のみ有効
   */
  const canSubmit = useMemo(() => {
    return selectedDate && selectedTime
  }, [selectedDate, selectedTime])

  /**
   * 内部形式（YYYY-MM-DD HH:MM）をスラッシュ形式（YYYY/M/D H:MM）に変換
   * @param {string} dateStr - 'YYYY-MM-DD' 形式の日付
   * @param {string} timeStr - 'HH:MM' 形式の時刻
   * @returns {string} - 'YYYY/M/D H:MM' 形式の文字列
   */
  const toJpText = useCallback((dateStr, timeStr) => {
    if (!dateStr || !timeStr) return ''

    const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    const t = timeStr.match(/^(\d{2}):(\d{2})$/)
    if (!m || !t) return ''

    const yyyy = m[1]
    const M = String(Number(m[2])) // 先頭ゼロを除去
    const D = String(Number(m[3])) // 先頭ゼロを除去
    const H = String(Number(t[1])) // 先頭ゼロを除去
    const Mi = t[2] // 分は先頭ゼロを保持

    // YYYY/M/D H:MM 形式で返す
    return `${yyyy}/${M}/${D} ${H}:${Mi}`
  }, [])

  /**
   * Confirmボタンをクリックした時の処理
   * 選択した日時をスラッシュ形式で親コンポーネントに渡す
   */
  const handleConfirm = useCallback(() => {
    if (!canSubmit) return

    const jp = toJpText(selectedDate, selectedTime)
    onConfirm?.(jp)
    onClose?.()
  }, [canSubmit, selectedDate, selectedTime, toJpText, onConfirm, onClose])

  /**
   * Clearボタンをクリックした時の処理
   * 期限をクリアして空文字を親コンポーネントに渡す
   */
  const handleClear = useCallback(() => {
    setSelectedDate(null)
    setSelectedTime(null)
    onConfirm?.('')
    onClose?.()
  }, [onConfirm, onClose])

  // 現在選択されている日（1〜31）を取得
  const selectedDay = selectedDate ? Number(selectedDate.split('-')[2]) : null

  return (
    <Modal isOpen={isOpen} onClose={onClose} titleId="limit-picker-title">
      {/* モーダルヘッダー（タイトルと閉じるボタン） */}
      <div className="modal_header">
        <div id="limit-picker-title" className="modal_header_title">
          タスク期限設定
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

      {/* ピッカー本体 */}
      <div className="limit_picker__body">
        {/* カレンダーヘッダー（前月・次月ボタンと年月表示） */}
        <div className="limit_picker__calendar_header">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="limit_picker__nav_button"
          >
            &lt;
          </button>
          <div className="limit_picker__month_label">
            {month}月 {year}
          </div>
          <button
            type="button"
            onClick={handleNextMonth}
            className="limit_picker__nav_button"
          >
            &gt;
          </button>
        </div>

        {/* カレンダー本体（曜日ヘッダーと日付グリッド） */}
        <div className="limit_picker__calendar">
          {/* 曜日ヘッダー */}
          <div className="limit_picker__weekday">日</div>
          <div className="limit_picker__weekday">月</div>
          <div className="limit_picker__weekday">火</div>
          <div className="limit_picker__weekday">水</div>
          <div className="limit_picker__weekday">木</div>
          <div className="limit_picker__weekday">金</div>
          <div className="limit_picker__weekday">土</div>

          {/* 日付グリッド */}
          {calendarDays.map((day, idx) => {
            // 空白セル（月の開始前）
            if (day === null) {
              return <div key={idx} className="limit_picker__day_empty"></div>
            }

            // 選択中の日付かどうか判定
            const isSelected =
              day === selectedDay &&
              selectedDate &&
              selectedDate.startsWith(
                `${year}-${String(month).padStart(2, '0')}`
              )

            // 日付ボタン
            return (
              <button
                key={idx}
                type="button"
                className={`limit_picker__day ${
                  isSelected ? 'limit_picker__day--selected' : ''
                }`}
                onClick={() => handleDateClick(day)}
              >
                {day}
              </button>
            )
          })}
        </div>

        {/* 時刻選択セクション */}
        <div className="limit_picker__time_section">
          <div className="limit_picker__time_label">時間</div>
          <select
            className="limit_picker__time_select"
            value={selectedTime || ''}
            onChange={(e) => setSelectedTime(e.target.value)}
          >
            <option value="">--:--</option>
            {timeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ボタンエリア（Clear と Confirm） */}
      <FormActions
        buttons={[
          {
            text: 'Clear',
            onClick: handleClear,
            variant: 'secondary',
          },
          {
            text: 'Confirm',
            onClick: handleConfirm,
            disabled: !canSubmit,
          },
        ]}
        isSubmitting={false}
      />
    </Modal>
  )
}

export default LimitPicker


