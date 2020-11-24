import '../../../lib/browser-test-env'

import { fireEvent, render } from '@testing-library/react'
import React from 'react'
import sinon from 'sinon'
import sleep from 'sleep-promise'
import tap from 'tap'

import LoginPresentation from './login'
import { LoginFormAction } from './login-view-model'

const doNothing = (): Promise<LoginFormAction> => new Promise(() => {})

const getFormAlerts = (document: Document) =>
  Array.from(document.querySelectorAll('*[aria-live]')).map(
    (e) => e.textContent
  )

const findModalHeader = (document: Document, header: string) =>
  Array.from(document.querySelectorAll('header')).find(
    (e) => e.textContent === header
  )

tap.test('Login form starts empty', (test) => {
  // given
  const container = document.createElement('div')
  const { queryByText, queryByLabelText } = render(
    <LoginPresentation
      loggedIn={false}
      onExit={doNothing}
      doCheckEmailAvailability={doNothing}
      doLoginUser={doNothing}
      doSendPasswordResetEmail={doNothing}
    />,
    { container }
  )
  const emailInput = queryByLabelText('Email Address') as HTMLInputElement
  const passwordInput = queryByLabelText('Password') as HTMLInputElement
  const forgottenPasswordCheckbox = queryByLabelText(
    'Forgotten password'
  ) as HTMLInputElement
  const formActionButton = queryByText('Login') as HTMLButtonElement
  const formAlerts = getFormAlerts(document)
  const warningModal = findModalHeader(document, "You're already logged in")

  // then
  test.equals(emailInput.placeholder, 'Email address')
  test.equals(emailInput.value, '')
  test.equals(passwordInput.placeholder, 'Enter password')
  test.equals(passwordInput.value, '')
  test.equals(forgottenPasswordCheckbox.checked, false)
  test.equals(formActionButton.disabled, true)
  test.deepEquals(formAlerts, [])
  test.notOk(warningModal)
  test.end()
})

tap.test('Warning modal displayed if user already logged in', (test) => {
  // given
  const container = document.createElement('div')
  render(
    <LoginPresentation
      loggedIn={true}
      onExit={doNothing}
      doCheckEmailAvailability={doNothing}
      doLoginUser={doNothing}
      doSendPasswordResetEmail={doNothing}
    />,
    { container }
  )
  const warningModal = findModalHeader(document, "You're already logged in")

  // then
  test.ok(warningModal)
  test.end()
})

tap.test('Visiting inputs causes validation errors to display', (test) => {
  // given
  const container = document.createElement('div')
  document.body.appendChild(container)
  const { queryByText, queryByLabelText } = render(
    <LoginPresentation
      loggedIn={false}
      onExit={doNothing}
      doCheckEmailAvailability={doNothing}
      doLoginUser={doNothing}
      doSendPasswordResetEmail={doNothing}
    />,
    { container }
  )
  const emailInput = queryByLabelText('Email Address') as HTMLInputElement
  const passwordInput = queryByLabelText('Password') as HTMLInputElement
  const formActionButton = queryByText('Login') as HTMLButtonElement

  // when
  fireEvent.blur(emailInput)
  fireEvent.blur(passwordInput)
  const formAlerts = getFormAlerts(document)
  document.body.removeChild(container)

  // then
  test.deepEquals(formAlerts, [
    'Valid email address is required.',
    'Password must be provided.',
  ])
  test.equals(formActionButton.disabled, true)
  test.end()
})

tap.test(
  'Visiting inputs causes validation errors to display (forgotten password)',
  (test) => {
    // given
    const container = document.createElement('div')
    document.body.appendChild(container)
    const { queryByText, queryByLabelText } = render(
      <LoginPresentation
        loggedIn={false}
        onExit={doNothing}
        doCheckEmailAvailability={doNothing}
        doLoginUser={doNothing}
        doSendPasswordResetEmail={doNothing}
      />,
      { container }
    )
    const emailInput = queryByLabelText('Email Address') as HTMLInputElement
    const forgottenPasswordCheckbox = queryByLabelText(
      'Forgotten password'
    ) as HTMLInputElement

    // when
    fireEvent.click(forgottenPasswordCheckbox)
    const passwordInput = queryByLabelText('New Password') as HTMLInputElement
    const confirmPasswordInput = queryByLabelText(
      'Confirm Password'
    ) as HTMLInputElement
    const resetPasswordButton = queryByText(
      'Reset Password'
    ) as HTMLButtonElement
    fireEvent.blur(emailInput)
    fireEvent.change(passwordInput, { target: { value: 'pass' } })
    fireEvent.blur(passwordInput)
    fireEvent.blur(confirmPasswordInput)
    const formAlerts = getFormAlerts(document)
    document.body.removeChild(container)

    // then
    test.deepEquals(formAlerts, [
      'Valid email address is required.',
      'Password strength meter must be green.',
      'Confirmed password must match.',
    ])
    test.equals(resetPasswordButton.disabled, true)
    test.end()
  }
)

tap.test(
  'Visiting email input causes email validation to trigger',
  async (test) => {
    // given
    const container = document.createElement('div')
    document.body.appendChild(container)
    const { queryByLabelText } = render(
      <LoginPresentation
        loggedIn={false}
        onExit={doNothing}
        doCheckEmailAvailability={() =>
          Promise.resolve({
            type: 'EMAIL_REGISTERED_CHECK_RECEIVED',
            notRegistered: true,
          })
        }
        doLoginUser={doNothing}
        doSendPasswordResetEmail={doNothing}
      />,
      { container }
    )
    const emailInput = queryByLabelText('Email Address') as HTMLInputElement

    // when
    fireEvent.change(emailInput, { target: { value: 'user@acme.com' } })
    fireEvent.blur(emailInput)

    // then
    test.deepEquals(getFormAlerts(document), [])
    await sleep(0)
    test.deepEquals(getFormAlerts(document), ['Email address not registered.'])
    document.body.removeChild(container)
    test.end()
  }
)

tap.test('Login button enabled once form is completed', (test) => {
  // given
  const container = document.createElement('div')
  document.body.appendChild(container)
  const { queryByText, queryByLabelText } = render(
    <LoginPresentation
      loggedIn={false}
      onExit={doNothing}
      doCheckEmailAvailability={doNothing}
      doLoginUser={doNothing}
      doSendPasswordResetEmail={doNothing}
    />,
    { container }
  )
  const emailInput = queryByLabelText('Email Address') as HTMLInputElement
  const passwordInput = queryByLabelText('Password') as HTMLInputElement
  const formActionButton = queryByText('Login') as HTMLButtonElement

  // when
  fireEvent.change(emailInput, { target: { value: 'user@acme.com' } })
  fireEvent.change(passwordInput, { target: { value: '0aB$🔒' } })
  document.body.removeChild(container)

  // then
  test.equals(formActionButton.disabled, false)
  test.end()
})

tap.test(
  'Login button enabled once form is completed (forgotten password)',
  (test) => {
    // given
    const container = document.createElement('div')
    document.body.appendChild(container)
    const { queryByText, queryByLabelText } = render(
      <LoginPresentation
        loggedIn={false}
        onExit={doNothing}
        doCheckEmailAvailability={doNothing}
        doLoginUser={doNothing}
        doSendPasswordResetEmail={doNothing}
      />,
      { container }
    )
    const emailInput = queryByLabelText('Email Address') as HTMLInputElement
    const forgottenPasswordCheckbox = queryByLabelText(
      'Forgotten password'
    ) as HTMLInputElement

    // when
    fireEvent.click(forgottenPasswordCheckbox)
    const passwordInput = queryByLabelText('New Password') as HTMLInputElement
    const confirmPasswordInput = queryByLabelText(
      'Confirm Password'
    ) as HTMLInputElement
    const resetPasswordButton = queryByText(
      'Reset Password'
    ) as HTMLButtonElement
    fireEvent.change(emailInput, { target: { value: 'user@acme.com' } })
    fireEvent.change(passwordInput, { target: { value: '0aB$🔒' } })
    fireEvent.change(confirmPasswordInput, { target: { value: '0aB$🔒' } })
    document.body.removeChild(container)

    // then
    test.equals(resetPasswordButton.disabled, false)
    test.end()
  }
)

tap.test('Blurring email field triggers email verification', (test) => {
  // given
  const checkEmailAvailabilityMock = sinon.fake(doNothing)
  const loginUserMock = sinon.fake(doNothing)
  const sendPasswordResetEmailMock = sinon.fake(doNothing)
  const container = document.createElement('div')
  document.body.appendChild(container)
  const { queryByLabelText } = render(
    <LoginPresentation
      loggedIn={false}
      onExit={doNothing}
      doCheckEmailAvailability={checkEmailAvailabilityMock}
      doLoginUser={loginUserMock}
      doSendPasswordResetEmail={sendPasswordResetEmailMock}
    />,
    { container }
  )
  const emailInput = queryByLabelText('Email Address') as HTMLInputElement

  // when
  fireEvent.change(emailInput, { target: { value: 'user@acme.com' } })
  fireEvent.blur(emailInput)
  document.body.removeChild(container)

  // then
  test.equals(checkEmailAvailabilityMock.calledOnce, true)
  test.equals(loginUserMock.calledOnce, false)
  test.equals(sendPasswordResetEmailMock.calledOnce, false)
  test.end()
})

tap.test('Clicking login button triggers login', (test) => {
  // given
  const checkEmailAvailabilityMock = sinon.fake(doNothing)
  const loginUserMock = sinon.fake(doNothing)
  const sendPasswordResetEmailMock = sinon.fake(doNothing)
  const container = document.createElement('div')
  document.body.appendChild(container)
  const { queryByText, queryByLabelText } = render(
    <LoginPresentation
      loggedIn={false}
      onExit={doNothing}
      doCheckEmailAvailability={checkEmailAvailabilityMock}
      doLoginUser={loginUserMock}
      doSendPasswordResetEmail={sendPasswordResetEmailMock}
    />,
    { container }
  )
  const emailInput = queryByLabelText('Email Address') as HTMLInputElement
  const passwordInput = queryByLabelText('Password') as HTMLInputElement
  const formActionButton = queryByText('Login') as HTMLButtonElement

  // when
  fireEvent.change(emailInput, { target: { value: 'user@acme.com' } })
  fireEvent.change(passwordInput, { target: { value: '0aB$🔒' } })
  fireEvent.click(formActionButton)
  document.body.removeChild(container)

  // then
  test.equals(formActionButton.disabled, true)
  test.equals(checkEmailAvailabilityMock.calledOnce, false)
  test.equals(loginUserMock.calledOnce, true)
  test.equals(sendPasswordResetEmailMock.calledOnce, false)
  test.end()
})

tap.test(
  'Password reset email sent modal pops up once password reset message is received',
  async (test) => {
    // given
    const container = document.createElement('div')
    document.body.appendChild(container)
    const { queryByText, queryByLabelText } = render(
      <LoginPresentation
        loggedIn={false}
        onExit={doNothing}
        doCheckEmailAvailability={doNothing}
        doLoginUser={doNothing}
        doSendPasswordResetEmail={() =>
          Promise.resolve({ type: 'PASSWORD_RESET_EMAIL_SENT' })
        }
      />,
      { container }
    )
    const emailInput = queryByLabelText('Email Address') as HTMLInputElement
    const forgottenPasswordCheckbox = queryByLabelText(
      'Forgotten password'
    ) as HTMLInputElement
    const formActionButton = queryByText('Login') as HTMLButtonElement

    // when
    fireEvent.change(emailInput, { target: { value: 'user@acme.com' } })
    fireEvent.click(forgottenPasswordCheckbox)
    const passwordInput = queryByLabelText('New Password') as HTMLInputElement
    const confirmPasswordInput = queryByLabelText(
      'Confirm Password'
    ) as HTMLInputElement
    fireEvent.change(passwordInput, { target: { value: '0aB$🔒' } })
    fireEvent.change(confirmPasswordInput, { target: { value: '0aB$🔒' } })
    fireEvent.click(formActionButton)
    document.body.removeChild(container)

    // then
    test.notOk(findModalHeader(document, 'Password reset email sent'))
    await sleep(0)
    test.ok(findModalHeader(document, 'Password reset email sent'))
    test.end()
  }
)
