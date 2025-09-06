import React, { useCallback, useState } from 'react'
import { Redirect, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import './index.css'
import { useSignup } from '~/hooks/useSignup'
import { useId } from '~/hooks/useId'
import { FormActions } from '~/components/ui/FormActions'
import { AppTextField } from '~/components/ui/AppTextField'

const SignUp = () => {
  const auth = useSelector(state => state.auth.token !== null)

  const id = useId()
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  const { signup } = useSignup()

  const onSubmit = useCallback(
    event => {
      event.preventDefault()

      setIsSubmitting(true)

      signup({ email, name, password })
        .catch(err => {
          setErrorMessage(`サインアップに失敗しました: ${err.message}`)
        })
        .finally(() => {
          setIsSubmitting(false)
        })
    },
    [email, name, password],
  )

  if (auth) {
    return <Redirect to="/" />
  }

  return (
    <main className="signup">
      <h2 className="signup__title">Register</h2>
      <p className="signup__error">{errorMessage}</p>
      <form className="signup__form" onSubmit={onSubmit}>
        <fieldset className="signup__form_field">
          <label htmlFor={`${id}-email`} className="signup__form_label">
            E-mail Address
          </label>
          <AppTextField
            id={`${id}-email`}
            autoComplete="email"
            value={email}
            type="email"
            required
            onChange={event => setEmail(event.target.value)}
          />
        </fieldset>
        <fieldset className="signup__form_field">
          <label
            htmlFor={`${id}-name`}
            autoComplete="name"
            className="signup__form_label"
          >
            Name
          </label>
          <AppTextField
            id={`${id}-name`}
            type="text"
            value={name}
            required
            onChange={event => setName(event.target.value)}
          />
        </fieldset>
        <fieldset className="signup__form_field">
          <label
            htmlFor={`${id}-password`}
            autoComplete="new-password"
            className="signup__form_label"
          >
            Password
          </label>
          <AppTextField
            id={`${id}-password`}
            type="password"
            value={password}
            autoComplete="new-password"
            required
            onChange={event => setPassword(event.target.value)}
          />
        </fieldset>

        <FormActions
          leftButton={{
            to: '/signin',
            text: 'Login',
          }}
          rightButton={{
            type: 'submit',
            text: 'Register',
            disabled: isSubmitting,
          }}
        />
      </form>
    </main>
  )
}

export default SignUp
