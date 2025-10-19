import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Modal } from '~/components/ui/Modal'
import { AppTextField } from '~/components/ui/AppTextField'
import { FormActions } from '~/components/ui/FormActions'
import { updateList, deleteList, fetchLists } from '~/store/list'
import { useId } from '~/hooks/useId'

/**
 * ListEditModal - リスト編集モーダル
 *
 * 【機能】
 * - リストの名前を編集
 * - リストを削除（確認ダイアログ付き）
 * - Updateボタンで変更を保存
 * - Deleteボタンでリストを削除
 *
 * 【受け取るもの】
 * @param {boolean} isOpen - モーダルの開閉状態
 * @param {function} onClose - モーダルを閉じる処理
 * @param {string} listId - 編集対象のリストID
 *
 * 【返すもの】
 * - モーダルのHTML要素
 */
export const ListEditModal = ({ isOpen, onClose, listId }) => {
  const dispatch = useDispatch()
  const id = useId()

  // Redux storeから編集対象のリストを取得
  const list = useSelector((state) =>
    state.list.lists?.find((l) => l.id === listId)
  )

  // 状態管理
  const [title, setTitle] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * モーダルが開いたときにリスト一覧を最新化
   * （他のユーザーが変更した可能性があるため）
   */
  useEffect(() => {
    if (!isOpen) return
    void dispatch(fetchLists())
  }, [isOpen, dispatch])

  /**
   * リストデータが取得できたらフォームに反映
   */
  useEffect(() => {
    if (list) {
      setTitle(list.title)
    }
  }, [list])

  /**
   * フォーム送信時の処理
   * リストのタイトルを更新する
   */
  const onSubmit = useCallback(
    (event) => {
      event.preventDefault()
      setIsSubmitting(true)

      void dispatch(updateList({ id: listId, title }))
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
    [listId, title, onClose, dispatch]
  )

  /**
   * 削除ボタンをクリックした時の処理
   * 確認ダイアログを表示してからリストを削除
   */
  const handleDelete = useCallback(() => {
    // 削除前に確認
    if (!window.confirm('Are you sure you want to delete this list?')) {
      return
    }

    setIsSubmitting(true)

    void dispatch(deleteList({ id: listId }))
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
  }, [listId, onClose, dispatch])

  // モーダルのタイトルに使うID（アクセシビリティ対応）
  const titleId = `${id}-list-edit-title`

  return (
    <Modal isOpen={isOpen} onClose={onClose} titleId={titleId}>
      {/* モーダルヘッダー（タイトルと閉じるボタン） */}
      <div className="modal_header">
        <div id={titleId} className="modal_header_title">
          Edit List
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

      {/* リスト編集フォーム */}
      <form className="edit_list__form" onSubmit={onSubmit}>
        {/* リスト名入力フィールド */}
        <fieldset className="edit_list__form_field">
          <label htmlFor={`${id}-title`} className="edit_list__form_label">
            Name
          </label>
          <AppTextField
            id={`${id}-title`}
            placeholder="Family"
            value={title}
            required
            onChange={(e) => setTitle(e.target.value)}
          />
        </fieldset>

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

export default ListEditModal


