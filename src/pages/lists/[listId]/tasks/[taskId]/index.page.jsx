import { useCallback, useState, useEffect } from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { BackButton } from '~/components/BackButton'
import { FormActions } from '~/components/ui/FormActions'
import './index.css'
import { setCurrentList } from '~/store/list'
import { fetchTasks, updateTask, deleteTask } from '~/store/task'
import { useId } from '~/hooks/useId'
import { AppTextField } from '~/components/ui/AppTextField'

const EditTask = () => {
  const id = useId()

  const { listId, taskId } = useParams()
  const history = useHistory()
  const dispatch = useDispatch()

  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [done, setDone] = useState(false)
  const [limit, setLimit] = useState('')

  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const task = useSelector(state =>
    state.task.tasks?.find(task => task.id === taskId),
  )

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDetail(task.detail)
      setDone(task.done)
      const iso = task.limit || ''
      const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):\d{2}:\d{2}Z$/)
      if (m) {
        // 表示は日本語形式: YYYY年MM月DD日HH時（分・秒は00固定）
        setLimit(`${m[1]}年${Number(m[2])}月${Number(m[3])}日${Number(m[4])}時`)
      } else {
        setLimit(iso)
      }
    }
  }, [task])

  useEffect(() => {
    void dispatch(setCurrentList(listId))
    void dispatch(fetchTasks())
  }, [listId])

  const onSubmit = useCallback(
    event => {
      event.preventDefault()

      setIsSubmitting(true)

      const raw = limit && limit.trim() !== '' ? limit.trim() : ''
      let nextLimit = null
      if (raw) {
        // 日本語形式: YYYY年M月D日H時 → ISO: YYYY-MM-DDTHH:00:00Z
        const jp = raw.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日(\d{1,2})時$/)
        if (jp) {
          const yyyy = jp[1]
          const mm = String(jp[2]).padStart(2, '0')
          const dd = String(jp[3]).padStart(2, '0')
          const hh = String(jp[4]).padStart(2, '0')
          nextLimit = `${yyyy}-${mm}-${dd}T${hh}:00:00Z`
        } else {
          // 後方互換: 旧形式/ISO も許容
          const m1 = raw.match(/^(\d{4}-\d{2}-\d{2})-(\d{2}:\d{2}:\d{2})$/)
          if (m1) nextLimit = `${m1[1]}T${m1[2]}Z`
          else nextLimit = raw
        }
      }
      void dispatch(updateTask({ id: taskId, title, detail, done, limit: nextLimit }))
        .unwrap()
        .then(() => {
          history.push(`/lists/${listId}`)
        })
        .catch(err => {
          setErrorMessage(err.message)
        })
        .finally(() => {
          setIsSubmitting(false)
        })
    },
    [title, taskId, listId, detail, done, limit],
  )

  const handleDelete = useCallback(() => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return
    }

    setIsSubmitting(true)

    void dispatch(deleteTask({ id: taskId }))
      .unwrap()
      .then(() => {
        history.push(`/`)
      })
      .catch(err => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }, [taskId])

  return (
    <main className="edit_list">
      <BackButton />
      <h2 className="edit_list__title">Edit List</h2>
      <p className="edit_list__error">{errorMessage}</p>
      <form className="edit_list__form" onSubmit={onSubmit}>
        <fieldset className="edit_list__form_field">
          <label htmlFor={`${id}-title`} className="edit_list__form_label">
            Title
          </label>
          <AppTextField
            id={`${id}-title`}
            placeholder="Buy some milk"
            value={title}
            required
            onChange={event => setTitle(event.target.value)}
          />
        </fieldset>
        <fieldset className="edit_list__form_field">
          <label htmlFor={`${id}-detail`} className="edit_list__form_label">
            Description
          </label>
          <AppTextField
            id={`${id}-detail`}
            placeholder="Blah blah blah"
            value={detail}
            required
            multiline
            onChange={event => setDetail(event.target.value)}
          />
        </fieldset>
        <fieldset className="edit_list__form_field">
          <label htmlFor={`${id}-done`} className="edit_list__form_label">
            Is Done
          </label>
          <div>
            <input
              id={`${id}-done`}
              type="checkbox"
              checked={done}
              onChange={event => setDone(event.target.checked)}
            />
          </div>
        </fieldset>
        <fieldset className="edit_list__form_field">
          <label htmlFor={`${id}-limit`} className="edit_list__form_label">タスク期限（例: 2025年10月21日22時）</label>
          <AppTextField
            id={`${id}-limit`}
            placeholder="2025年10月21日22時"
            value={limit}
            onChange={event => setLimit(event.target.value)}
          />
        </fieldset>
        <FormActions
          leftButton={{ to: '/', text: 'Cancel' }}
          middleButton={{ text: 'Delete', onClick: handleDelete, className: 'edit_list__form_actions_delete' }}
          rightButton={{ text: 'Update', type: 'submit' }}
          isSubmitting={isSubmitting}
        />
      </form>
    </main>
  )
}

export default EditTask
