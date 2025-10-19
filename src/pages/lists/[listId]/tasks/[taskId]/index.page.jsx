import { useCallback, useState, useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { BackButton } from '~/components/BackButton'
import { FormActions } from '~/components/ui/FormActions'
import './index.css'
import { setCurrentList } from '~/store/list'
import { fetchTasks, updateTask, deleteTask } from '~/store/task'
import { useId } from '~/hooks/useId'
import { AppTextField } from '~/components/ui/AppTextField'
import { CalendarIcon } from '~/icons/CalendarIcon'
import { LimitPicker } from '~/components/LimitPicker'

const EditTask = () => {
  const id = useId()

  const { listId, taskId } = useParams()
  const history = useHistory()
  const dispatch = useDispatch()

  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [done, setDone] = useState(false)
  const [limit, setLimit] = useState('')
  const [isLimitPickerOpen, setIsLimitPickerOpen] = useState(false)

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
      const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):\d{2}Z$/)
      if (m) {
        const mi = Number(m[5])
        if (mi === 0) {
          setLimit(`${m[1]}年${Number(m[2])}月${Number(m[3])}日${Number(m[4])}時`)
        } else {
          setLimit(`${m[1]}年${Number(m[2])}月${Number(m[3])}日${Number(m[4])}時${mi}分`)
        }
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
        const jp1 = raw.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日(\d{1,2})時(\d{1,2})分$/)
        if (jp1) {
          const yyyy = jp1[1]
          const mm = String(jp1[2]).padStart(2, '0')
          const dd = String(jp1[3]).padStart(2, '0')
          const hh = String(jp1[4]).padStart(2, '0')
          const mi = String(jp1[5]).padStart(2, '0')
          nextLimit = `${yyyy}-${mm}-${dd}T${hh}:${mi}:00Z`
        } else {
          const jp2 = raw.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日(\d{1,2})時$/)
          if (jp2) {
            const yyyy = jp2[1]
            const mm = String(jp2[2]).padStart(2, '0')
            const dd = String(jp2[3]).padStart(2, '0')
            const hh = String(jp2[4]).padStart(2, '0')
            nextLimit = `${yyyy}-${mm}-${dd}T${hh}:00:00Z`
          } else {
            // 後方互換: 旧形式/ISO も許容
            const m1 = raw.match(/^(\d{4}-\d{2}-\d{2})-(\d{2}:\d{2}:\d{2})$/)
            if (m1) nextLimit = `${m1[1]}T${m1[2]}Z`
            else nextLimit = raw
          }
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

  const openLimitPicker = useCallback(() => setIsLimitPickerOpen(true), [])
  const closeLimitPicker = useCallback(() => setIsLimitPickerOpen(false), [])
  const handleConfirmLimit = useCallback((jpText) => {
    setLimit(jpText)
  }, [])

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
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={openLimitPicker}><CalendarIcon /></button>
            <button type="button" onClick={openLimitPicker}>タスク期限設定</button>
          </div>
        </fieldset>
        <LimitPicker isOpen={isLimitPickerOpen} onClose={closeLimitPicker} defaultLimitText={limit} onConfirm={handleConfirmLimit} />
        <FormActions
          buttons={[
            {
              to: '/',
              text: 'Cancel',
              variant: 'secondary',
            },
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
    </main>
  )
}

export default EditTask
