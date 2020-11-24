import tap from 'tap'

import {
  defaultState,
  registerReducer,
  registerViewModel,
} from './register-view-model'

tap.test(
  'The email field is considered valid if a legitimate email address is provided',
  (test) => {
    // given
    const formState = registerReducer(defaultState, {
      type: 'EMAIL_UPDATED',
      email: 'user@acme.com',
    })

    // then
    test.deepEquals(registerViewModel(formState), {
      ...registerViewModel(defaultState),
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
    const formState = registerReducer(defaultState, {
      type: 'EMAIL_UPDATED',
      email: 'user@acme',
    })

    // then
    test.deepEquals(registerViewModel(formState), {
      ...registerViewModel(defaultState),
      email: 'user@acme',
      emailError: 'Valid email address is required.',
    })
    test.end()
  }
)

tap.test('No change if already-registered check passes', (test) => {
  // given
  const validEmailState = registerReducer(defaultState, {
    type: 'EMAIL_UPDATED',
    email: 'already-registered@acme.com',
  })

  // when
  const formState = registerReducer(validEmailState, {
    type: 'EMAIL_REGISTERED_CHECK_RECEIVED',
    alreadyRegistered: false,
  })

  // then
  test.deepEquals(
    registerViewModel(formState),
    registerViewModel(validEmailState)
  )
  test.end()
})

tap.test(
  'An already-registered message is displayed if already-registered check is unsuccessful',
  (test) => {
    // given
    const validEmailState = registerReducer(defaultState, {
      type: 'EMAIL_UPDATED',
      email: 'already-registered@acme.com',
    })

    // when
    const formState = registerReducer(validEmailState, {
      type: 'EMAIL_REGISTERED_CHECK_RECEIVED',
      alreadyRegistered: true,
    })

    // then
    test.deepEquals(registerViewModel(formState), {
      ...registerViewModel(validEmailState),
      emailError: 'Email address already registered.',
    })
    test.end()
  }
)

tap.test(
  'The already-registered message is immediately removed if the email is changed',
  (test) => {
    // given
    const validEmailState = registerReducer(defaultState, {
      type: 'EMAIL_UPDATED',
      email: 'already-registered@acme.com',
    })
    const alreadyRegisteredEmailState = registerReducer(validEmailState, {
      type: 'EMAIL_REGISTERED_CHECK_RECEIVED',
      alreadyRegistered: true,
    })

    // when
    const formState = registerReducer(alreadyRegisteredEmailState, {
      type: 'EMAIL_UPDATED',
      email: 'already-registered@acme.co',
    })

    // then
    test.deepEquals(registerViewModel(formState), {
      ...registerViewModel(alreadyRegisteredEmailState),
      email: 'already-registered@acme.co',
      emailError: '',
    })
    test.end()
  }
)

tap.test('The weakest password takes only a second to guess', (test) => {
  // given
  const formState = registerReducer(defaultState, {
    type: 'PASSWORD_UPDATED',
    password: 'a',
  })

  // then
  test.deepEquals(registerViewModel(formState), {
    ...registerViewModel(defaultState),
    password: 'a',
    passwordTokenSets: ['latin-small'],
    passwordStrengthPercent: 5,
    confirmationPasswordError: 'Confirmed password must match.',
  })
  test.end()
})

tap.test('More complex passwords take longer 😁', (test) => {
  // given
  const formState = registerReducer(defaultState, {
    type: 'PASSWORD_UPDATED',
    password: '0aB$🔒',
  })

  // then
  test.deepEquals(registerViewModel(formState), {
    ...registerViewModel(defaultState),
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
  })
  test.end()
})

tap.test('Amber passwords are not acceptable', (test) => {
  // given
  const formState = registerReducer(defaultState, {
    type: 'PASSWORD_UPDATED',
    password: '0aB$',
  })

  // then
  test.deepEquals(registerViewModel(formState), {
    ...registerViewModel(defaultState),
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
  })
  test.end()
})

tap.test('Matching confirmation passwords verify', (test) => {
  // given
  const initialState = registerReducer(defaultState, {
    type: 'PASSWORD_UPDATED',
    password: 'pass',
  })

  // when
  const formState = registerReducer(initialState, {
    type: 'CONFIRMATION_PASSWORD_UPDATED',
    confirmationPassword: 'pass',
  })

  // then
  test.deepEquals(registerViewModel(formState), {
    ...registerViewModel(initialState),
    confirmationPassword: 'pass',
    confirmationPasswordError: '',
  })
  test.end()
})

tap.test('A non-matching confirmation passwords does NOT verify', (test) => {
  // given
  const initialState = registerReducer(defaultState, {
    type: 'PASSWORD_UPDATED',
    password: 'pass',
  })

  // when
  const formState = registerReducer(initialState, {
    type: 'CONFIRMATION_PASSWORD_UPDATED',
    confirmationPassword: 'password',
  })

  // then
  test.deepEquals(registerViewModel(formState), {
    ...registerViewModel(initialState),
    confirmationPassword: 'password',
    confirmationPasswordError: 'Confirmed password must match.',
  })
  test.end()
})

tap.test('Password confirmation re-appraised on password update', (test) => {
  // given
  const initialState = registerReducer(defaultState, {
    type: 'PASSWORD_UPDATED',
    password: 'pass',
  })
  const matchingPasswordState = registerReducer(initialState, {
    type: 'CONFIRMATION_PASSWORD_UPDATED',
    confirmationPassword: 'pass',
  })

  // when
  const formState = registerReducer(matchingPasswordState, {
    type: 'PASSWORD_UPDATED',
    password: 'passw',
  })

  // then
  test.deepEquals(registerViewModel(formState), {
    ...registerViewModel(matchingPasswordState),
    password: 'passw',
    passwordStrengthPercent: 18,
    confirmationPasswordError: 'Confirmed password must match.',
  })
  test.end()
})

tap.test('A complete form with invalid email can not be sent', (test) => {
  // given
  const emailProvidedState = registerReducer(defaultState, {
    type: 'EMAIL_UPDATED',
    email: 'user@acme',
  })
  const passwordProvidedState = registerReducer(emailProvidedState, {
    type: 'PASSWORD_UPDATED',
    password: '0aB$🔒',
  })

  // when
  const formState = registerReducer(passwordProvidedState, {
    type: 'CONFIRMATION_PASSWORD_UPDATED',
    confirmationPassword: '0aB$🔒',
  })

  // then
  const view = registerViewModel(formState)
  test.equals(view.registerButtonEnabled, false)
  test.end()
})

tap.test('A complete form with weak password can not be sent', (test) => {
  // given
  const emailProvidedState = registerReducer(defaultState, {
    type: 'EMAIL_UPDATED',
    email: 'user@acme.com',
  })
  const passwordProvidedState = registerReducer(emailProvidedState, {
    type: 'PASSWORD_UPDATED',
    password: '0aB$',
  })

  // when
  const formState = registerReducer(passwordProvidedState, {
    type: 'CONFIRMATION_PASSWORD_UPDATED',
    confirmationPassword: '0aB$',
  })

  // then
  const view = registerViewModel(formState)
  test.equals(view.registerButtonEnabled, false)
  test.end()
})

tap.test('Register button enabled once form completed correctly', (test) => {
  // given
  const emailProvidedState = registerReducer(defaultState, {
    type: 'EMAIL_UPDATED',
    email: 'user@acme.com',
  })
  const passwordProvidedState = registerReducer(emailProvidedState, {
    type: 'PASSWORD_UPDATED',
    password: '0aB$🔒',
  })

  // when
  const formState = registerReducer(passwordProvidedState, {
    type: 'CONFIRMATION_PASSWORD_UPDATED',
    confirmationPassword: '0aB$🔒',
  })

  // then
  const view = registerViewModel(formState)
  test.equals(view.registerButtonEnabled, true)
  test.end()
})

tap.test(
  'Attempting to submit an invalid form causes unexpected error',
  (test) => {
    const formState = registerReducer(defaultState, {
      type: 'EMAIL_UPDATED',
      email: 'invalid-email',
    })

    // when / then
    test.throws(() => {
      registerReducer(formState, {
        type: 'REGISTER_BUTTON_CLICKED',
      })
    }, 'InvalidStateError')
    test.end()
  }
)

tap.test('Submitting form disables register button', (test) => {
  // given
  const emailProvidedState = registerReducer(defaultState, {
    type: 'EMAIL_UPDATED',
    email: 'user@acme.com',
  })
  const passwordProvidedState = registerReducer(emailProvidedState, {
    type: 'PASSWORD_UPDATED',
    password: '0aB$🔒',
  })
  const confirmationPasswordProvidedState = registerReducer(
    passwordProvidedState,
    {
      type: 'CONFIRMATION_PASSWORD_UPDATED',
      confirmationPassword: '0aB$🔒',
    }
  )

  // when
  const formState = registerReducer(confirmationPasswordProvidedState, {
    type: 'REGISTER_BUTTON_CLICKED',
  })

  // then
  const view = registerViewModel(formState)
  test.equals(view.registerButtonEnabled, false)
  test.equals(view.registerButtonLoading, true)
  test.end()
})

tap.test('A "check email" modal is displayed once email sent', (test) => {
  // given
  const emailProvidedState = registerReducer(defaultState, {
    type: 'EMAIL_UPDATED',
    email: 'user@acme.com',
  })
  const passwordProvidedState = registerReducer(emailProvidedState, {
    type: 'PASSWORD_UPDATED',
    password: '0aB$🔒',
  })
  const confirmationPasswordProvidedState = registerReducer(
    passwordProvidedState,
    {
      type: 'CONFIRMATION_PASSWORD_UPDATED',
      confirmationPassword: '0aB$🔒',
    }
  )
  const registerButtonClickedState = registerReducer(
    confirmationPasswordProvidedState,
    {
      type: 'REGISTER_BUTTON_CLICKED',
    }
  )

  // when
  const formState = registerReducer(registerButtonClickedState, {
    type: 'VERIFICATION_EMAIL_SENT',
  })

  // then
  test.deepEquals(registerViewModel(formState), {
    ...registerViewModel(registerButtonClickedState),
    displayCheckEmailModal: true,
  })
  test.end()
})

tap.test(
  'Sending verification email before registering users causes unexpected error',
  (test) => {
    // given
    const emailProvidedState = registerReducer(defaultState, {
      type: 'EMAIL_UPDATED',
      email: 'user@acme.com',
    })
    const passwordProvidedState = registerReducer(emailProvidedState, {
      type: 'PASSWORD_UPDATED',
      password: '0aB$🔒',
    })
    const confirmationPasswordProvidedState = registerReducer(
      passwordProvidedState,
      {
        type: 'CONFIRMATION_PASSWORD_UPDATED',
        confirmationPassword: '0aB$🔒',
      }
    )

    // when / then
    test.throws(() => {
      registerReducer(confirmationPasswordProvidedState, {
        type: 'VERIFICATION_EMAIL_SENT',
      })
    }, 'InvalidStateError')
    test.end()
  }
)
