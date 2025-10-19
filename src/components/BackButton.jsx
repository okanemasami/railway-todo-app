import { ChevronIcon } from '~/icons/ChevronIcon'
import './BackButton.css'

/**
 * BackButton - ブラウザの「戻る」ボタン
 *
 * 【機能】
 * - クリックするとブラウザの履歴を1つ戻る
 * - 左向き矢印アイコン + "Back"テキストを表示
 */
export const BackButton = () => {
  const handleClick = () => {
    window.history.back()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="back_button"
    >
      <ChevronIcon className="back_button__icon" />
      Back
    </button>
  )
}
