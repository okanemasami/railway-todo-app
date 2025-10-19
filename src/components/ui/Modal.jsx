import React, { useEffect, useRef, useCallback } from 'react'
import ReactDOM from 'react-dom'
import './Modal.css'

/**
 * Modal - ダイアログ（モーダルウィンドウ）のコンポーネント
 *
 * 【受け取るもの】
 * @param {boolean} isOpen - モーダルを表示するか（true: 表示、false: 非表示）
 * @param {function} onClose - モーダルを閉じる時に実行する関数
 * @param {string} titleId - モーダルのタイトル要素のID（アクセシビリティ用）
 * @param {ReactNode} children - モーダル内に表示する内容
 *
 * 【機能】
 * - モーダル表示中は背景のスクロールを無効化
 * - Escキーで閉じる
 * - Tabキーでモーダル内の要素を循環（外に出ない）
 * - モーダルを閉じた後、元の場所にフォーカスを戻す
 *
 * 【使用例】
 * <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} titleId="modal-title">
 *   <h2 id="modal-title">タイトル</h2>
 *   <p>内容</p>
 * </Modal>
 */
export const Modal = ({ isOpen, onClose, titleId, children }) => {
  // モーダルの背景（オーバーレイ）への参照
  const overlayRef = useRef(null)

  // モーダルの内容部分への参照
  const contentRef = useRef(null)

  // モーダルを開く前にフォーカスされていた要素への参照
  const previouslyFocusedElementRef = useRef(null)

  /**
   * モーダル内の最初のフォーカス可能な要素にフォーカスを移す関数
   */
  const focusFirstElement = useCallback(() => {
    if (!contentRef.current) return

    // フォーカス可能な要素のセレクター一覧
    const focusableSelectors = [
      'a[href]',                          // リンク
      'area[href]',                       // クリック可能なエリア
      'input:not([disabled])',            // 入力欄（無効でないもの）
      'select:not([disabled])',           // セレクトボックス
      'textarea:not([disabled])',         // テキストエリア
      'button:not([disabled])',           // ボタン
      'iframe',                           // iframe
      'object',                           // オブジェクト
      'embed',                            // 埋め込みコンテンツ
      '[tabindex]:not([tabindex="-1"])', // tabindexが設定された要素
      '[contenteditable="true"]',         // 編集可能なコンテンツ
    ].join(',')

    // モーダル内のフォーカス可能な要素を取得
    const focusableElements = contentRef.current.querySelectorAll(focusableSelectors)

    if (focusableElements.length > 0) {
      // 最初の要素にフォーカス
      const firstElement = focusableElements[0]
      firstElement.focus()
    } else {
      // フォーカス可能な要素がない場合はモーダル自体にフォーカス
      contentRef.current.focus()
    }
  }, [])

  /**
   * モーダルが開いた時の処理
   * - 背景のスクロールを無効化
   * - モーダル内の最初の要素にフォーカス
   * - モーダルを閉じた時に元の場所に戻すため、現在のフォーカス位置を記憶
   */
  useEffect(() => {
    // モーダルが閉じている場合は何もしない
    if (!isOpen) return

    // 現在フォーカスされている要素を記憶（モーダルを閉じた後に戻すため）
    previouslyFocusedElementRef.current = document.activeElement

    // 背景のスクロールを無効化
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // モーダル内の最初の要素にフォーカスを移動（少し遅延させる）
    setTimeout(focusFirstElement, 0)

    // クリーンアップ関数（モーダルを閉じる時に実行）
    return () => {
      // 背景のスクロールを元に戻す
      document.body.style.overflow = originalOverflow

      // 元の場所にフォーカスを戻す
      if (
        previouslyFocusedElementRef.current &&
        previouslyFocusedElementRef.current.focus
      ) {
        previouslyFocusedElementRef.current.focus()
      }
    }
  }, [isOpen, focusFirstElement])

  /**
   * Escキーでモーダルを閉じる処理
   * documentレベルでキャッチすることで、フォーカス位置に関わらず確実に動作
   */
  useEffect(() => {
    // モーダルが閉じている場合は何もしない
    if (!isOpen) return

    // Escキーが押された時の処理
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onClose?.()
      }
    }

    // documentにイベントリスナーを追加（キャプチャフェーズで実行）
    document.addEventListener('keydown', handleEscapeKey, true)

    // クリーンアップ関数（イベントリスナーを削除）
    return () => {
      document.removeEventListener('keydown', handleEscapeKey, true)
    }
  }, [isOpen, onClose])

  /**
   * キーボード操作の処理（Tabキーによるフォーカス循環）
   */
  const handleKeyDown = useCallback((event) => {
    // Escキーの処理（念のため、上のuseEffectでも処理している）
    if (event.key === 'Escape') {
      event.stopPropagation()
      onClose?.()
      return
    }

    // Tabキーの処理（モーダル内でフォーカスを循環させる）
    if (event.key === 'Tab') {
      if (!contentRef.current) return

      // フォーカス可能な要素のセレクター一覧（上と同じ）
      const focusableSelectors = [
        'a[href]',
        'area[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        'button:not([disabled])',
        'iframe',
        'object',
        'embed',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]',
      ].join(',')

      // モーダル内のフォーカス可能な要素を配列として取得
      const focusableElements = Array.from(
        contentRef.current.querySelectorAll(focusableSelectors)
      )

      // フォーカス可能な要素がない場合、Tabキーを無効化
      if (focusableElements.length === 0) {
        event.preventDefault()
        return
      }

      // 最初と最後の要素を取得
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      // Shiftキーが押されているか
      const isShiftPressed = event.shiftKey

      // 現在フォーカスされている要素
      const currentFocusedElement = document.activeElement

      // 最後の要素からTab → 最初の要素に戻る
      if (!isShiftPressed && currentFocusedElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
      // 最初の要素からShift+Tab → 最後の要素に移動
      else if (isShiftPressed && currentFocusedElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    }
  }, [onClose])

  // モーダルが閉じている場合は何も表示しない
  if (!isOpen) {
    return null
  }

  // モーダルをdocument.bodyに直接表示（ポータル機能）
  // これにより、親要素のCSSに影響されずにモーダルを表示できる
  return ReactDOM.createPortal(
    <div
      className="modal_overlay"
      ref={overlayRef}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="modal_content"
        ref={contentRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}

export default Modal


