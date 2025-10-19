import React, { forwardRef } from 'react'

/**
 * AppTextField - テキスト入力欄のコンポーネント
 *
 * 【受け取るもの】
 * @param {string} className - 追加のCSSクラス（省略可能）
 * @param {boolean} multiline - 複数行入力にするか（true: textarea、false: input）
 * @param {object} ...rest - その他のHTML属性（placeholder, value, onChange など）
 * @param {ref} ref - React ref（親コンポーネントから要素を操作するため）
 *
 * 【返すもの】
 * - 1行入力: <input> 要素
 * - 複数行入力: <textarea> 要素
 *
 * 【使用例】
 * // 1行入力
 * <AppTextField
 *   placeholder="タイトルを入力"
 *   value={title}
 *   onChange={(e) => setTitle(e.target.value)}
 * />
 *
 * // 複数行入力
 * <AppTextField
 *   multiline
 *   placeholder="詳細を入力"
 *   value={detail}
 *   onChange={(e) => setDetail(e.target.value)}
 * />
 */
export const AppTextField = forwardRef(function AppTextField(props, ref) {
  // propsから必要な情報を取り出す
  const { className = '', multiline = false, ...rest } = props

  // CSSクラスを結合（基本クラス + 追加クラス）
  const combinedClassName = ['app_input', className]
    .filter(Boolean) // 空文字を除外
    .join(' ') // スペース区切りで結合

  // 複数行入力の場合
  if (multiline) {
    return (
      <textarea
        ref={ref}
        className={combinedClassName}
        {...rest}
      />
    )
  }

  // 1行入力の場合
  return (
    <input
      ref={ref}
      className={combinedClassName}
      {...rest}
    />
  )
})


