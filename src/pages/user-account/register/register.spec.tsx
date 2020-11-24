import '../../../lib/browser-test-env'

import { fireEvent, render } from '@testing-library/react'
import React from 'react'
import sinon from 'sinon'
import sleep from 'sleep-promise'
import tap from 'tap'

import RegisterPresentation from './register'
import { RegisterFormAction } from './register-view-model'

const doNothing = (): Promise<RegisterFormAction> => new Promise(() => {})

const getFormAlerts = (document: Document) =>
  Array.from(document.querySelectorAll('*[aria-live]')).map(
    (e) => e.textContent
  )

const findModalHeader = (document: Document, header: string) =>
  Array.from(document.querySelectorAll('header')).find(
    (e) => e.textContent === header
  )

tap.test('Register form starts empty', (test) => {
  // given
  const container = document.createElement('div')
  const { queryByText, queryByLabelText } = render(
    <RegisterPresentation
      loggedIn={false}
      onExit={doNothing}
      doCheckEmailAvailability={doNothing}
      doRegisterUser={doNothing}
    />,
    { container }
  )
  const emailInput = queryByLabelText('Email Address') as HTMLInputElement
  const passwordInput = queryByLabelText('Password') as HTMLInputElement
  const confirmPasswordInput = queryByLabelText(
    'Confirm Password'
  ) as HTMLInputElement
  const registerButton = queryByText('Register') as HTMLButtonElement
  const formAlerts = getFormAlerts(document)
  const warningModal = findModalHeader(document, "You're already logged in")

  // then
  test.equals(emailInput.placeholder, 'Email address')
  test.equals(emailInput.value, '')
  test.equals(passwordInput.placeholder, 'Enter password')
  test.equals(passwordInput.value, '')
  test.equals(confirmPasswordInput.placeholder, 'Re-enter password')
  test.equals(confirmPasswordInput.value, '')
  test.equals(registerButton.disabled, true)
  test.deepEquals(formAlerts, [])
  test.notOk(warningModal)
  test.end()
})

tap.test('Warning modal displayed if user already logged in', (test) => {
  // given
  const container = document.createElement('div')
  render(
    <RegisterPresentation
      loggedIn={true}
      onExit={doNothing}
      doCheckEmailAvailability={doNothing}
      doRegisterUser={doNothing}
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
    <RegisterPresentation
      loggedIn={false}
      onExit={doNothing}
      doCheckEmailAvailability={doNothing}
      doRegisterUser={doNothing}
    />,
    { container }
  )
  const emailInput = queryByLabelText('Email Address') as HTMLInputElement
  const passwordInput = queryByLabelText('Password') as HTMLInputElement
  const confirmPasswordInput = queryByLabelText(
    'Confirm Password'
  ) as HTMLInputElement
  const registerButton = queryByText('Register') as HTMLButtonElement

  // when
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
  test.equals(registerButton.disabled, true)
  test.end()
})

tap.test(
  'Visiting email input causes email validation to trigger',
  async (test) => {
    // given
    const container = document.createElement('div')
    document.body.appendChild(container)
    const { queryByLabelText } = render(
      <RegisterPresentation
        loggedIn={false}
        onExit={doNothing}
        doCheckEmailAvailability={() =>
          Promise.resolve({
            type: 'EMAIL_REGISTERED_CHECK_RECEIVED',
            alreadyRegistered: true,
          })
        }
        doRegisterUser={doNothing}
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
    test.deepEquals(getFormAlerts(document), [
      'Email address already registered.',
    ])
    document.body.removeChild(container)
    test.end()
  }
)

tap.test('Register button enabled once form is completed', (test) => {
  // given
  const container = document.createElement('div')
  document.body.appendChild(container)
  const { queryByText, queryByLabelText } = render(
    <RegisterPresentation
      loggedIn={false}
      onExit={doNothing}
      doCheckEmailAvailability={doNothing}
      doRegisterUser={doNothing}
    />,
    { container }
  )
  const emailInput = queryByLabelText('Email Address') as HTMLInputElement
  const passwordInput = queryByLabelText('Password') as HTMLInputElement
  const confirmPasswordInput = queryByLabelText(
    'Confirm Password'
  ) as HTMLInputElement
  const registerButton = queryByText('Register') as HTMLButtonElement

  // when
  fireEvent.change(emailInput, { target: { value: 'user@acme.com' } })
  fireEvent.change(passwordInput, { target: { value: '0aB$🔒' } })
  fireEvent.change(confirmPasswordInput, { target: { value: '0aB$🔒' } })
  document.body.removeChild(container)

  // then
  test.equals(registerButton.disabled, false)
  test.end()
})

tap.test('Blurring email field triggers email verification', (test) => {
  // given
  const checkEmailAvailabilityMock = sinon.fake(doNothing)
  const registerUserMock = sinon.fake(doNothing)
  const container = document.createElement('div')
  document.body.appendChild(container)
  const { queryByLabelText } = render(
    <RegisterPresentation
      loggedIn={false}
      onExit={doNothing}
      doCheckEmailAvailability={checkEmailAvailabilityMock}
      doRegisterUser={registerUserMock}
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
  test.equals(registerUserMock.calledOnce, false)
  test.end()
})

tap.test('Clicking register button triggers user registration', (test) => {
  // given
  const checkEmailAvailabilityMock = sinon.fake(doNothing)
  const registerUserMock = sinon.fake(doNothing)
  const container = document.createElement('div')
  document.body.appendChild(container)
  const { queryByText, queryByLabelText } = render(
    <RegisterPresentation
      loggedIn={false}
      onExit={doNothing}
      doCheckEmailAvailability={checkEmailAvailabilityMock}
      doRegisterUser={registerUserMock}
    />,
    { container }
  )
  const emailInput = queryByLabelText('Email Address') as HTMLInputElement
  const passwordInput = queryByLabelText('Password') as HTMLInputElement
  const confirmPasswordInput = queryByLabelText(
    'Confirm Password'
  ) as HTMLInputElement
  const registerButton = queryByText('Register') as HTMLButtonElement

  // when
  fireEvent.change(emailInput, { target: { value: 'user@acme.com' } })
  fireEvent.change(passwordInput, { target: { value: '0aB$🔒' } })
  fireEvent.change(confirmPasswordInput, { target: { value: '0aB$🔒' } })
  fireEvent.click(registerButton)
  document.body.removeChild(container)

  // then
  test.equals(registerButton.disabled, true)
  test.equals(checkEmailAvailabilityMock.calledOnce, false)
  test.equals(registerUserMock.calledOnce, true)
  test.end()
})

tap.test(
  'Email confirmation sent modal pops up once message is received',
  async (test) => {
    // given
    const container = document.createElement('div')
    document.body.appendChild(container)
    const { queryByText, queryByLabelText } = render(
      <RegisterPresentation
        loggedIn={false}
        onExit={doNothing}
        doCheckEmailAvailability={doNothing}
        doRegisterUser={() =>
          Promise.resolve({ type: 'VERIFICATION_EMAIL_SENT' })
        }
      />,
      { container }
    )
    const emailInput = queryByLabelText('Email Address') as HTMLInputElement
    const passwordInput = queryByLabelText('Password') as HTMLInputElement
    const confirmPasswordInput = queryByLabelText(
      'Confirm Password'
    ) as HTMLInputElement
    const registerButton = queryByText('Register') as HTMLButtonElement

    // when
    fireEvent.change(emailInput, { target: { value: 'user@acme.com' } })
    fireEvent.change(passwordInput, { target: { value: '0aB$🔒' } })
    fireEvent.change(confirmPasswordInput, { target: { value: '0aB$🔒' } })
    fireEvent.click(registerButton)
    document.body.removeChild(container)

    // then
    test.notOk(findModalHeader(document, 'Email confirmation sent'))
    await sleep(0)
    test.ok(findModalHeader(document, 'Email confirmation sent'))
    test.end()
  }
)
