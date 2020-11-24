import makeError from 'make-error'

import { registerViewModel } from './register-view-model'

const InvalidStateError = makeError('InvalidStateError')

export type RegisterFormState = {
  email: string
  password: string
  confirmationPassword: string
  emailAlreadyRegistered: boolean
  actionUnderway: boolean
  verificationEmailSent: boolean
}

type EmailUpdateAction = {
  type: 'EMAIL_UPDATED'
  email: string
}

type EmailRegisteredCheckReceived = {
  type: 'EMAIL_REGISTERED_CHECK_RECEIVED'
  alreadyRegistered: boolean
}

type PasswordUpdateAction = {
  type: 'PASSWORD_UPDATED'
  password: string
}

type ConfirmationPasswordUpdateAction = {
  type: 'CONFIRMATION_PASSWORD_UPDATED'
  confirmationPassword: string
}

type RegisterButtonClickedAction = {
  type: 'REGISTER_BUTTON_CLICKED'
}

type VerificationEmailSentAction = {
  type: 'VERIFICATION_EMAIL_SENT'
}

export type RegisterFormAction =
  | EmailUpdateAction
  | EmailRegisteredCheckReceived
  | PasswordUpdateAction
  | ConfirmationPasswordUpdateAction
  | RegisterButtonClickedAction
  | VerificationEmailSentAction

export const defaultState: RegisterFormState = {
  email: '',
  password: '',
  confirmationPassword: '',
  emailAlreadyRegistered: false,
  actionUnderway: false,
  verificationEmailSent: false,
}

const registerReducer = (
  state: RegisterFormState,
  action: RegisterFormAction
): RegisterFormState => {
  switch (action.type) {
    case 'EMAIL_UPDATED': {
      return {
        ...state,
        email: action.email,
        emailAlreadyRegistered: false,
      }
    }

    case 'EMAIL_REGISTERED_CHECK_RECEIVED': {
      return {
        ...state,
        emailAlreadyRegistered: action.alreadyRegistered,
      }
    }

    case 'PASSWORD_UPDATED': {
      return {
        ...state,
        password: action.password,
      }
    }

    case 'CONFIRMATION_PASSWORD_UPDATED': {
      return {
        ...state,
        confirmationPassword: action.confirmationPassword,
      }
    }

    case 'REGISTER_BUTTON_CLICKED': {
      const view = registerViewModel(state)

      if (!view.registerButtonEnabled) {
        throw new InvalidStateError(
          'Form can not be submitted while incomplete or invalid'
        )
      }

      return {
        ...state,
        actionUnderway: true,
      }
    }

    case 'VERIFICATION_EMAIL_SENT': {
      const view = registerViewModel(state)

      if (!view.registerButtonLoading) {
        throw new InvalidStateError(
          'Verification email should be sent after register button is clicked'
        )
      }

      return {
        ...state,
        verificationEmailSent: true,
      }
    }
  }
}

export default registerReducer
