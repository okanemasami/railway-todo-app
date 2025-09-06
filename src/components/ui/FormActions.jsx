import React from 'react'
import { Link } from 'react-router-dom'
import './FormActions.css'

export const FormActions = ({ 
  leftButton,    // 左ボタン設定
  middleButton,  // 中央ボタン設定（オプション）
  rightButton,   // 右ボタン設定
  isSubmitting = false 
}) => {
  return (
    <div className="form_actions">
      {/* 左ボタン（通常はキャンセル/戻る） */}
      {leftButton && (
        leftButton.to ? (
          <Link 
            className="app_button" 
            data-variant="secondary" 
            to={leftButton.to}
            aria-disabled={leftButton.disabled || isSubmitting || undefined}
          >
            {leftButton.text}
          </Link>
        ) : (
          <button 
            type="button"
            className="app_button" 
            data-variant="secondary"
            disabled={leftButton.disabled || isSubmitting}
            onClick={leftButton.onClick}
          >
            {leftButton.text}
          </button>
        )
      )}
      
      <div className="form_actions_spacer"></div>
      
      {/* 中央ボタン（削除ボタンなど） */}
      {middleButton && (
        <button
          type="button"
          className={`app_button ${middleButton.className || ''}`}
          disabled={isSubmitting}
          onClick={middleButton.onClick}
        >
          {middleButton.text}
        </button>
      )}
      
      {/* 右ボタン（通常はSubmit） */}
      {rightButton && (
        <button 
          type={rightButton.type || 'submit'}
          className="app_button"
          disabled={isSubmitting}
          onClick={rightButton.onClick}
        >
          {rightButton.text}
        </button>
      )}
    </div>
  )
}