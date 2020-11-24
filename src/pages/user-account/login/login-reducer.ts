import makeError from 'make-error'

import { loginViewModel } from './login-view-model'

const InvalidStateError = makeError('InvalidStateError')

export type LoginFormState = {
  email: string
  password: string
  forgottenPasswordCheckboxEnabled: boolean
  confirmationPassword: string
  emailNotRegistered: boolean
  actionUnderway: boolean
  resetEmailSent: boolean
}

type EmailUpdateAction = {
  type: 'EMAIL_UPDATED'
  email: string
}

type EmailRegisteredCheckReceived = {
  type: 'EMAIL_REGISTERED_CHECK_RECEIVED'
  notRegistered: boolean
}

type PasswordUpdateAction = {
  type: 'PASSWORD_UPDATED'
  password: string
}

type ForgottenPaswordCheckboxClickedAction = {
  type: 'FORGOTTEN_PASSWORD_CHECKBOX_CLICKED'
}

type ConfirmationPasswordUpdateAction = {
  type: 'CONFIRMATION_PASSWORD_UPDATED'
  confirmationPassword: string
}

type FormActionButtonClickedAction = {
  type: 'FORM_ACTION_BUTTON_CLICKED'
}

type LoginFailedAction = {
  type: 'LOGIN_FAILED'
}

type PasswordResetEmailSentAction = {
  type: 'PASSWORD_RESET_EMAIL_SENT'
}

export type LoginFormAction =
  | EmailUpdateAction
  | EmailRegisteredCheckReceived
  | PasswordUpdateAction
  | ForgottenPaswordCheckboxClickedAction
  | ConfirmationPasswordUpdateAction
  | FormActionButtonClickedAction
  | LoginFailedAction
  | PasswordResetEmailSentAction

export const defaultState: LoginFormState = {
  email: '',
  password: '',
  forgottenPasswordCheckboxEnabled: false,
  confirmationPassword: '',
  emailNotRegistered: false,
  actionUnderway: false,
  resetEmailSent: false,
}

const loginReducer = (
  state: LoginFormState,
  action: LoginFormAction
): LoginFormState => {
  switch (action.type) {
    case 'EMAIL_UPDATED': {
      return {
        ...state,
        email: action.email,
        emailNotRegistered: false,
      }
    }

    case 'EMAIL_REGISTERED_CHECK_RECEIVED': {
      return {
        ...state,
        emailNotRegistered: action.notRegistered,
      }
    }

    case 'PASSWORD_UPDATED': {
      return {
        ...state,
        password: action.password,
      }
    }

    case 'FORGOTTEN_PASSWORD_CHECKBOX_CLICKED': {
      return {
        ...state,
        forgottenPasswordCheckboxEnabled: !state.forgottenPasswordCheckboxEnabled,
      }
    }

    case 'CONFIRMATION_PASSWORD_UPDATED': {
      return {
        ...state,
        confirmationPassword: action.confirmationPassword,
      }
    }

    case 'FORM_ACTION_BUTTON_CLICKED': {
      const view = loginViewModel(state)

      if (!view.formActionButtonEnabled) {
        throw new InvalidStateError(
          'Form can not be submitted while incomplete or invalid'
        )
      }

      return {
        ...state,
        actionUnderway: true,
      }
    }

    case 'LOGIN_FAILED': {
      const view = loginViewModel(state)

      if (!view.formActionButtonLoading) {
        throw new InvalidStateError(
          'Login failure not possible till after reset button is clicked'
        )
      }

      return {
        ...state,
        actionUnderway: false,
      }
    }

    case 'PASSWORD_RESET_EMAIL_SENT': {
      const view = loginViewModel(state)

      if (!view.formActionButtonLoading) {
        throw new InvalidStateError(
          'Password reset email should be sent after reset button is clicked'
        )
      }

      return {
        ...state,
        resetEmailSent: true,
      }
    }
  }
}

export default loginReducer
