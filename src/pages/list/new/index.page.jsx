import React, { useCallback, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { BackButton } from '~/components/BackButton'
import './index.css'
import { createList, setCurrentList } from '~/store/list/index'
import { useId } from '~/hooks/useId'
import { FormActions } from '~/components/ui/FormActions'
import { AppTextField } from '~/components/ui/AppTextField'

const NewList = () => {
  const id = useId()
  const history = useHistory()
  const dispatch = useDispatch()

  const [title, setTitle] = useState('')

  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = useCallback(
    event => {
      event.preventDefault()

      setIsSubmitting(true)

      void dispatch(createList({ title }))
        .unwrap()
        .then(listId => {
          dispatch(setCurrentList(listId))
          history.push(`/`)
        })
        .catch(err => {
          setErrorMessage(err.message)
        })
        .finally(() => {
          setIsSubmitting(false)
        })
    },
    [title],
  )

  return (
    <main className="new_list">
      <BackButton />
      <h2 className="new_list__title">New List</h2>
      <p className="new_list__error">{errorMessage}</p>
      <form className="new_list__form" onSubmit={onSubmit}>
        <fieldset className="new_list__form_field">
          <label htmlFor={`${id}-title`} className="new_list__form_label">
            Name
          </label>
          <AppTextField
            id={`${id}-title`}
            placeholder="Family"
            value={title}
            required
            onChange={event => setTitle(event.target.value)}
          />
        </fieldset>
        <FormActions
          leftButton={{ to: '/', text: 'Cancel' }}
          rightButton={{ text: 'Create', type: 'submit' }}
          isSubmitting={isSubmitting}
        />
      </form>
    </main>
  )
}

export default NewList
