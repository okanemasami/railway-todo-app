import React from 'react'
import { Link } from 'react-router-dom'
import './FormActions.css'

/**
 * FormActions - フォームの下部に表示される右寄せボタングループ
 *
 * 【受け取るもの】
 * @param {Array} buttons - 表示するボタンの配列（左から順に表示）
 * @param {boolean} isSubmitting - 送信中フラグ（trueの時、全ボタンが無効化される）
 *
 * 【ボタンの設定項目】
 * - text: ボタンに表示する文字（必須）
 * - type: ボタンの種類（'button' または 'submit'。省略時は'button'）
 * - variant: ボタンの見た目（'secondary' でグレー系に）
 * - className: 追加のCSSクラス（例: 削除ボタン用の赤色スタイル）
 * - disabled: ボタンを無効化するか（true/false）
 * - onClick: クリック時に実行する関数
 * - to: リンク先のパス（指定するとボタンではなくリンクになる）
 *
 * 【返すもの】
 * - 右寄せされたボタングループのHTML要素
 *
 * 【使用例】
 * <FormActions
 *   buttons={[
 *     { text: 'キャンセル', to: '/', variant: 'secondary' },
 *     { text: '保存', type: 'submit' }
 *   ]}
 *   isSubmitting={false}
 * />
 */
export const FormActions = ({ buttons = [], isSubmitting = false }) => {
  // ボタンを1つ作成する関数
  const renderButton = (button, index) => {
    // ボタンがnullの場合は何も表示しない
    if (!button) {
      return null
    }

    // ボタンが無効かどうか判定（個別のdisabled または 送信中）
    const isDisabled = button.disabled || isSubmitting

    // リンクの場合（toが指定されている）
    if (button.to) {
      return (
        <Link
          key={index}
          className="app_button"
          data-variant={button.variant || 'secondary'}
          to={button.to}
          aria-disabled={isDisabled || undefined}
        >
          {button.text}
        </Link>
      )
    }

    // 通常のボタンの場合
    return (
      <button
        key={index}
        type={button.type || 'button'}
        className={`app_button ${button.className || ''}`}
        data-variant={button.variant}
        disabled={isDisabled}
        onClick={button.onClick}
      >
        {button.text}
      </button>
    )
  }

  return (
    <div className="form_actions">
      {/* 左側の空白（ボタンを右寄せにするため） */}
      <div className="form_actions_spacer"></div>

      {/* 各ボタンを表示 */}
      {buttons.map(renderButton)}
    </div>
  )
}