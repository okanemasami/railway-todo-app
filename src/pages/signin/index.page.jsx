import React, { useCallback, useState } from 'react'
import { Redirect } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useLogin } from '~/hooks/useLogin'
import { useId } from '~/hooks/useId'
import './index.css'
import { FormActions } from '~/components/ui/FormActions'
import { AppTextField } from '~/components/ui/AppTextField'

const SignIn = () => {
  const auth = useSelector(state => state.auth.token !== null)
  const { login } = useLogin()

  const id = useId()
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmit = useCallback(
    event => {
      event.preventDefault()

      setIsSubmitting(true)

      login({ email, password })
        .catch(err => {
          setErrorMessage(err.message)
        })
        .finally(() => {
          setIsSubmitting(false)
        })
    },
    [email, password],
  )

  if (auth) {
    return <Redirect to="/" />
  }

  return (
    <main className="signin">
      <h2 className="signin__title">Login</h2>
      <p className="signin__error">{errorMessage}</p>
      <form className="signin__form" onSubmit={onSubmit}>
        <fieldset className="signin__form_field">
          <label htmlFor={`${id}-email`} className="signin__form_label">
            E-mail Address
          </label>
          <AppTextField
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            value={email}
            required
            onChange={event => setEmail(event.target.value)}
          />
        </fieldset>
        <fieldset className="signin__form_field">
          <label htmlFor={`${id}-password`} className="signin__form_label">
            Password
          </label>
          <AppTextField
            id={`${id}-password`}
            type="password"
            autoComplete="current-password"
            value={password}
            required
            onChange={event => setPassword(event.target.value)}
          />
        </fieldset>
        <FormActions
          buttons={[
            {
              to: '/signup',
              text: 'Register',
              variant: 'secondary',
            },
            {
              text: 'Login',
              type: 'submit',
            },
          ]}
          isSubmitting={isSubmitting}
        />
      </form>
    </main>
  )
}

export default SignIn
