import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ListIcon } from '~/icons/ListIcon'
import { PlusIcon } from '~/icons/PlusIcon'
import { useLogout } from '~/hooks/useLogout'
import { fetchLists } from '~/store/list/index'
import './Sidebar.css'

/**
 * Sidebar - サイドバー（左側のナビゲーション）
 *
 * 【機能】
 * - ログイン状態の表示と切り替え
 * - リスト一覧の表示
 * - 現在選択中のリストをハイライト
 * - 新しいリストの作成
 * - ログアウト機能
 */
export const Sidebar = () => {
  const dispatch = useDispatch()
  const { pathname } = useLocation()

  // Redux storeからデータを取得
  const lists = useSelector((state) => state.list.lists)
  const activeId = useSelector((state) => state.list.current)
  const isLoggedIn = useSelector((state) => state.auth.token !== null)
  const userName = useSelector((state) => state.auth.user?.name)

  // リスト新規作成ページではリストをハイライトしない
  const shouldHighlight = !pathname.startsWith('/list/new')

  const { logout } = useLogout()

  // 初回表示時にリスト一覧を取得
  useEffect(() => {
    void dispatch(fetchLists())
  }, [dispatch])

  return (
    <div className="sidebar">
      {/* アプリタイトル */}
      <Link to="/">
        <h1 className="sidebar__title">Todos</h1>
      </Link>

      {/* ログイン済みの場合 */}
      {isLoggedIn ? (
        <>
          {/* リスト一覧 */}
          {lists && (
            <div className="sidebar__lists">
              <h2 className="sidebar__lists_title">Lists</h2>
              <ul className="sidebar__lists_items">
                {/* 各リストを表示 */}
                {lists.map((listItem) => (
                  <li key={listItem.id}>
                    <Link
                      data-active={shouldHighlight && listItem.id === activeId}
                      to={`/lists/${listItem.id}`}
                      className="sidebar__lists_item"
                    >
                      <ListIcon
                        aria-hidden
                        className="sidebar__lists_icon"
                      />
                      {listItem.title}
                    </Link>
                  </li>
                ))}

                {/* 新しいリストを作成ボタン */}
                <li>
                  <Link
                    to="/list/new"
                    className="sidebar__lists_button"
                  >
                    <PlusIcon className="sidebar__lists_plus_icon" />
                    New List...
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* 空白（リストとアカウント情報の間） */}
          <div className="sidebar__spacer" aria-hidden />

          {/* アカウント情報とログアウト */}
          <div className="sidebar__account">
            <p className="sidebar__account_name">{userName}</p>
            <button
              type="button"
              className="sidebar__account_logout"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </>
      ) : (
        /* ログインしていない場合 */
        <Link to="/signin" className="sidebar__login">
          Login
        </Link>
      )}
    </div>
  )
}
