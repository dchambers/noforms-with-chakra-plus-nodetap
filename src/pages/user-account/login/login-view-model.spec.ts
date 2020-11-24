import tap from 'tap'

import { defaultState, loginReducer, loginViewModel } from './login-view-model'

tap.test(
  'The email field is considered valid if a legitimate email address is provided',
  (test) => {
    // given
    const formState = loginReducer(defaultState, {
      type: 'EMAIL_UPDATED',
      email: 'user@acme.com',
    })

    // then
    test.deepEquals(loginViewModel(formState), {
      ...loginViewModel(defaultState),
      email: 'user@acme.com',
      emailError: '',
    })
    test.end()
  }
)

tap.test(
  'The email field is not considered valid if an illegitimate email address is provided',
  (test) => {
    // given
    const formState = loginReducer(defaultState, {
      type: 'EMAIL_UPDATED',
      email: 'user@acme',
    })

    // then
    test.deepEquals(loginViewModel(formState), {
      ...loginViewModel(defaultState),
      email: 'user@acme',
      emailError: 'Valid email address is required.',
    })
    test.end()
  }
)

tap.test('No change if not-registered check passes', (test) => {
  // given
  const validEmailState = loginReducer(defaultState, {
    type: 'EMAIL_UPDATED',
    email: 'not-registered@acme.com',
  })

  // when
  const formState = loginReducer(validEmailState, {
    type: 'EMAIL_REGISTERED_CHECK_RECEIVED',
    notRegistered: false,
  })

  // then
  test.deepEquals(loginViewModel(formState), loginViewModel(validEmailState))
  test.end()
})

tap.test(
  'An already-registered message is displayed if already-registered check is unsuccessful',
  (test) => {
    // given
    const validEmailState = loginReducer(defaultState, {
      type: 'EMAIL_UPDATED',
      email: 'already-registered@acme.com',
    })

    // when
    const formState = loginReducer(validEmailState, {
      type: 'EMAIL_REGISTERED_CHECK_RECEIVED',
      notRegistered: true,
    })

    // then
    test.deepEquals(loginViewModel(formState), {
      ...loginViewModel(validEmailState),
      emailError: 'Email address not registered.',
    })
    test.end()
  }
)

tap.test(
  'The not-registered message is immediately removed if the email is changed',
  (test) => {
    // given
    const validEmailState = loginReducer(defaultState, {
      type: 'EMAIL_UPDATED',
      email: 'not-registered@acme.com',
    })
    const notRegisteredEmailState = loginReducer(validEmailState, {
      type: 'EMAIL_REGISTERED_CHECK_RECEIVED',
      notRegistered: true,
    })

    // when
    const formState = loginReducer(notRegisteredEmailState, {
      type: 'EMAIL_UPDATED',
      email: 'not-registered@acme.co',
    })

    // then
    test.deepEquals(loginViewModel(formState), {
      ...loginViewModel(notRegisteredEmailState),
      email: 'not-registered@acme.co',
      emailError: '',
    })
    test.end()
  }
)

tap.test('Checking Forgotten Password updates the form', (test) => {
  // given
  const validEmailState = loginReducer(defaultState, {
    type: 'EMAIL_UPDATED',
    email: 'user@acme.com',
  })

  // when
  const formState = loginReducer(validEmailState, {
    type: 'FORGOTTEN_PASSWORD_CHECKBOX_CLICKED',
  })

  // then
  const view = loginViewModel(formState)
  test.equals(view.formActionButtonEnabled, false)
  test.equals(view.passwordError, 'Password strength meter must be green.')
  test.end()
})

tap.test('Unchecking Forgotten Password restores the form', (test) => {
  // given
  const validEmailState = loginReducer(defaultState, {
    type: 'EMAIL_UPDATED',
    email: 'user@acme.com',
  })
  const forgottenPasswordCheckedState = loginReducer(validEmailState, {
    type: 'FORGOTTEN_PASSWORD_CHECKBOX_CLICKED',
  })

  // when
  const formState = loginReducer(forgottenPasswordCheckedState, {
    type: 'FORGOTTEN_PASSWORD_CHECKBOX_CLICKED',
  })

  // then
  const view = loginViewModel(formState)
  test.equals(view.formActionButtonEnabled, false)
  test.equals(view.passwordError, 'Password must be provided.')
  test.equals(view.email, 'user@acme.com')
  test.equals(view.password, '')
  test.end()
})

tap.test(
  'Unchecking Forgotten Password restores the form (including password)',
  (test) => {
    // given
    const validEmailState = loginReducer(defaultState, {
      type: 'EMAIL_UPDATED',
      email: 'user@acme.com',
    })
    const passwordEnteredState = loginReducer(validEmailState, {
      type: 'PASSWORD_UPDATED',
      password: '0aB$🔒',
    })
    const forgottenPasswordCheckedState = loginReducer(passwordEnteredState, {
      type: 'FORGOTTEN_PASSWORD_CHECKBOX_CLICKED',
    })

    // when
    const formState = loginReducer(forgottenPasswordCheckedState, {
      type: 'FORGOTTEN_PASSWORD_CHECKBOX_CLICKED',
    })

    // then
    const view = loginViewModel(formState)
    test.equals(view.formActionButtonEnabled, true)
    test.equals(view.email, 'user@acme.com')
    test.equals(view.password, '0aB$🔒')
    test.end()
  }
)

tap.test('A complete form with invalid email can not be sent', (test) => {
  // given
  const emailProvidedState = loginReducer(defaultState, {
    type: 'EMAIL_UPDATED',
    email: 'user@acme',
  })

  // when
  const formState = loginReducer(emailProvidedState, {
    type: 'PASSWORD_UPDATED',
    password: '0aB$🔒',
  })

  // then
  const view = loginViewModel(formState)
  test.equals(view.formActionButtonEnabled, false)
  test.equals(view.passwordError, '')
  test.end()
})

tap.test('Register button enabled once email and password provided', (test) => {
  // given
  const emailProvidedState = loginReducer(defaultState, {
    type: 'EMAIL_UPDATED',
    email: 'user@acme.com',
  })

  // when
  const formState = loginReducer(emailProvidedState, {
    type: 'PASSWORD_UPDATED',
    password: '0aB$🔒',
  })

  // then
  const view = loginViewModel(formState)
  test.equals(view.formActionButtonEnabled, true)
  test.end()
})

tap.test('Register button disabled if Forgotten Password checked', (test) => {
  // given
  const emailProvidedState = loginReducer(defaultState, {
    type: 'EMAIL_UPDATED',
    email: 'user@acme.com',
  })
  const passwordProvidedState = loginReducer(emailProvidedState, {
    type: 'PASSWORD_UPDATED',
    password: '0aB$🔒',
  })

  // when
  const formState = loginReducer(passwordProvidedState, {
    type: 'FORGOTTEN_PASSWORD_CHECKBOX_CLICKED',
  })

  // then
  const view = loginViewModel(formState)
  test.equals(view.formActionButtonEnabled, false)
  test.end()
})

tap.test(
  'Register button enabled again once confirmation password provided',
  (test) => {
    // given
    const emailProvidedState = loginReducer(defaultState, {
      type: 'EMAIL_UPDATED',
      email: 'user@acme.com',
    })
    const passwordProvidedState = loginReducer(emailProvidedState, {
      type: 'PASSWORD_UPDATED',
      password: '0aB$🔒',
    })
    const forgottenPasswordCheckedState = loginReducer(passwordProvidedState, {
      type: 'FORGOTTEN_PASSWORD_CHECKBOX_CLICKED',
    })

    // when
    const formState = loginReducer(forgottenPasswordCheckedState, {
      type: 'CONFIRMATION_PASSWORD_UPDATED',
      confirmationPassword: '0aB$🔒',
    })

    // then
    const view = loginViewModel(formState)
    test.equals(view.formActionButtonEnabled, true)
    test.end()
  }
)

tap.test(
  'Attempting to submit an invalid form causes unexpected error',
  (test) => {
    // given
    const formState = loginReducer(defaultState, {
      type: 'EMAIL_UPDATED',
      email: 'invalid-email',
    })

    // when / then
    test.throws(() => {
      loginReducer(formState, {
        type: 'FORM_ACTION_BUTTON_CLICKED',
      })
    }, 'InvalidStateError')
    test.end()
  }
)

tap.test('Submitting form disables form action button', (test) => {
  // given
  const emailProvidedState = loginReducer(defaultState, {
    type: 'EMAIL_UPDATED',
    email: 'user@acme.com',
  })
  const passwordProvidedState = loginReducer(emailProvidedState, {
    type: 'PASSWORD_UPDATED',
    password: '0aB$🔒',
  })

  // when
  const formState = loginReducer(passwordProvidedState, {
    type: 'FORM_ACTION_BUTTON_CLICKED',
  })

  // then
  const view = loginViewModel(formState)
  test.equals(view.formActionButtonEnabled, false)
  test.equals(view.formActionButtonLoading, true)
  test.end()
})

tap.test('Form is re-enabled if login fails', (test) => {
  // given
  const emailProvidedState = loginReducer(defaultState, {
    type: 'EMAIL_UPDATED',
    email: 'user@acme.com',
  })
  const passwordProvidedState = loginReducer(emailProvidedState, {
    type: 'PASSWORD_UPDATED',
    password: '0aB$🔒',
  })
  const actionButtonClickedState = loginReducer(passwordProvidedState, {
    type: 'FORM_ACTION_BUTTON_CLICKED',
  })

  // when
  const formState = loginReducer(actionButtonClickedState, {
    type: 'LOGIN_FAILED',
  })

  // then
  const view = loginViewModel(formState)
  test.equals(view.formActionButtonEnabled, true)
  test.equals(view.formActionButtonLoading, false)
  test.end()
})

tap.test(
  'Login failure message causes unexpected error if form not submitted',
  (test) => {
    // given
    const emailProvidedState = loginReducer(defaultState, {
      type: 'EMAIL_UPDATED',
      email: 'user@acme.com',
    })
    const passwordProvidedState = loginReducer(emailProvidedState, {
      type: 'PASSWORD_UPDATED',
      password: '0aB$🔒',
    })

    // when / then
    test.throws(() => {
      loginReducer(passwordProvidedState, {
        type: 'LOGIN_FAILED',
      })
    }, 'InvalidStateError')
    test.end()
  }
)

tap.test('A "check email" modal is displayed once email sent', (test) => {
  // given
  const emailProvidedState = loginReducer(defaultState, {
    type: 'EMAIL_UPDATED',
    email: 'user@acme.com',
  })
  const forgottenPasswordCheckedState = loginReducer(emailProvidedState, {
    type: 'FORGOTTEN_PASSWORD_CHECKBOX_CLICKED',
  })
  const passwordProvidedState = loginReducer(forgottenPasswordCheckedState, {
    type: 'PASSWORD_UPDATED',
    password: '0aB$🔒',
  })
  const confirmationasswordProvidedState = loginReducer(passwordProvidedState, {
    type: 'CONFIRMATION_PASSWORD_UPDATED',
    confirmationPassword: '0aB$🔒',
  })
  const registerButtonClickedState = loginReducer(
    confirmationasswordProvidedState,
    {
      type: 'FORM_ACTION_BUTTON_CLICKED',
    }
  )

  // when
  const formState = loginReducer(registerButtonClickedState, {
    type: 'PASSWORD_RESET_EMAIL_SENT',
  })

  // then
  test.deepEquals(loginViewModel(formState), {
    ...loginViewModel(registerButtonClickedState),
    displayCheckEmailModal: true,
  })
  test.end()
})

tap.test(
  'Sending password reset email when not required causes unexpected error',
  (test) => {
    // given
    const emailProvidedState = loginReducer(defaultState, {
      type: 'EMAIL_UPDATED',
      email: 'user@acme.com',
    })
    const formState = loginReducer(emailProvidedState, {
      type: 'PASSWORD_UPDATED',
      password: '0aB$🔒',
    })

    // when / then
    test.throws(() => {
      loginReducer(formState, {
        type: 'PASSWORD_RESET_EMAIL_SENT',
      })
    }, 'InvalidStateError')
    test.end()
  }
)

tap.test('The weakest password takes only a second to guess', (test) => {
  // given
  const forgottenPasswordState = loginReducer(defaultState, {
    type: 'FORGOTTEN_PASSWORD_CHECKBOX_CLICKED',
  })
  const formState = loginReducer(forgottenPasswordState, {
    type: 'PASSWORD_UPDATED',
    password: 'a',
  })

  // then
  test.deepEquals(loginViewModel(formState), {
    ...loginViewModel(defaultState),
    forgottenPasswordCheckboxEnabled: true,
    password: 'a',
    passwordTokenSets: ['latin-small'],
    passwordStrengthPercent: 5,
    passwordStrengthTooltip:
      '1 second to guess password at 10 billion guesses per second.',
    passwordError: 'Password strength meter must be green.',
    confirmationPasswordError: 'Confirmed password must match.',
    formActionButtonLabel: 'Reset Password',
  })
  test.end()
})

tap.test('More complex passwords take longer 😁', (test) => {
  // given
  const forgottenPasswordState = loginReducer(defaultState, {
    type: 'FORGOTTEN_PASSWORD_CHECKBOX_CLICKED',
  })
  const formState = loginReducer(forgottenPasswordState, {
    type: 'PASSWORD_UPDATED',
    password: '0aB$🔒',
  })

  // then
  test.deepEquals(loginViewModel(formState), {
    ...loginViewModel(defaultState),
    forgottenPasswordCheckboxEnabled: true,
    password: '0aB$🔒',
    passwordError: '',
    passwordStrengthPercent: 100,
    passwordTokenSets: [
      'number',
      'latin-small',
      'latin-capital',
      'special',
      'emoji',
    ],
    passwordStrengthDuration: 100,
    passwordStrengthUnit: 'centuries',
    passwordStrengthColor: 'green',
    passwordStrengthTooltip:
      '100 centuries to guess password at 10 billion guesses per second.',
    confirmationPasswordError: 'Confirmed password must match.',
    formActionButtonLabel: 'Reset Password',
  })
  test.end()
})

tap.test('Amber passwords are not acceptable', (test) => {
  // given
  const forgottenPasswordState = loginReducer(defaultState, {
    type: 'FORGOTTEN_PASSWORD_CHECKBOX_CLICKED',
  })
  const formState = loginReducer(forgottenPasswordState, {
    type: 'PASSWORD_UPDATED',
    password: '0aB$',
  })

  // then
  test.deepEquals(loginViewModel(formState), {
    ...loginViewModel(defaultState),
    forgottenPasswordCheckboxEnabled: true,
    password: '0aB$',
    passwordStrengthPercent: 63,
    passwordTokenSets: ['number', 'latin-small', 'latin-capital', 'special'],
    passwordStrengthDuration: 1,
    passwordStrengthUnit: 'hours',
    passwordStrengthColor: 'orange',
    passwordStrengthTooltip:
      '1 hour to guess password at 10 billion guesses per second.',
    passwordError: 'Password strength meter must be green.',
    confirmationPasswordError: 'Confirmed password must match.',
    formActionButtonLabel: 'Reset Password',
  })
  test.end()
})

tap.test('A complete form with weak password can not be sent', (test) => {
  // given
  const forgottenPasswordState = loginReducer(defaultState, {
    type: 'FORGOTTEN_PASSWORD_CHECKBOX_CLICKED',
  })
  const emailProvidedState = loginReducer(forgottenPasswordState, {
    type: 'EMAIL_UPDATED',
    email: 'user@acme.com',
  })
  const passwordProvidedState = loginReducer(emailProvidedState, {
    type: 'PASSWORD_UPDATED',
    password: '0aB$',
  })

  // when
  const formState = loginReducer(passwordProvidedState, {
    type: 'CONFIRMATION_PASSWORD_UPDATED',
    confirmationPassword: '0aB$',
  })

  // then
  const view = loginViewModel(formState)
  test.equals(view.formActionButtonEnabled, false)
  test.end()
})

tap.test('Matching confirmation passwords verify', (test) => {
  // given
  const forgottenPasswordState = loginReducer(defaultState, {
    type: 'FORGOTTEN_PASSWORD_CHECKBOX_CLICKED',
  })
  const initialState = loginReducer(forgottenPasswordState, {
    type: 'PASSWORD_UPDATED',
    password: 'pass',
  })

  // when
  const formState = loginReducer(initialState, {
    type: 'CONFIRMATION_PASSWORD_UPDATED',
    confirmationPassword: 'pass',
  })

  // then
  test.deepEquals(loginViewModel(formState), {
    ...loginViewModel(initialState),
    confirmationPassword: 'pass',
    confirmationPasswordError: '',
  })
  test.end()
})

tap.test('A non-matching confirmation passwords does NOT verify', (test) => {
  // given
  const forgottenPasswordState = loginReducer(defaultState, {
    type: 'FORGOTTEN_PASSWORD_CHECKBOX_CLICKED',
  })
  const initialState = loginReducer(forgottenPasswordState, {
    type: 'PASSWORD_UPDATED',
    password: 'pass',
  })

  // when
  const formState = loginReducer(initialState, {
    type: 'CONFIRMATION_PASSWORD_UPDATED',
    confirmationPassword: 'password',
  })

  // then
  test.deepEquals(loginViewModel(formState), {
    ...loginViewModel(initialState),
    confirmationPassword: 'password',
    confirmationPasswordError: 'Confirmed password must match.',
  })
  test.end()
})

tap.test('Password confirmation re-appraised on password update', (test) => {
  // given
  const forgottenPasswordState = loginReducer(defaultState, {
    type: 'FORGOTTEN_PASSWORD_CHECKBOX_CLICKED',
  })
  const initialState = loginReducer(forgottenPasswordState, {
    type: 'PASSWORD_UPDATED',
    password: 'pass',
  })
  const matchingPasswordState = loginReducer(initialState, {
    type: 'CONFIRMATION_PASSWORD_UPDATED',
    confirmationPassword: 'pass',
  })

  // when
  const formState = loginReducer(matchingPasswordState, {
    type: 'PASSWORD_UPDATED',
    password: 'passw',
  })

  // then
  test.deepEquals(loginViewModel(formState), {
    ...loginViewModel(matchingPasswordState),
    password: 'passw',
    passwordStrengthPercent: 18,
    confirmationPasswordError: 'Confirmed password must match.',
  })
  test.end()
})
