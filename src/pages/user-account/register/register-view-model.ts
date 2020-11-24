import omit from '../../../lib/omit'
import { validate as isValidEmail } from 'email-validator'
import entropy from 'ideal-password'

import passwordTooltip from '../common-components/password-tooltip'
import type {
  DurationColor as PasswordStrengthColor,
  DurationUnit as PasswordStrengthUnit,
} from '../common-utils/entropy-duration'
import {
  entropyDuration,
  entropyDurationColor,
} from '../common-utils/entropy-duration'
import type { RegisterFormState } from './register-reducer'

export { default as registerReducer, defaultState } from './register-reducer'
export type { RegisterFormAction } from './register-reducer'

const registerFormStateFlags = [
  'emailAlreadyRegistered',
  'actionUnderway',
  'verificationEmailSent',
] as const

type RegisterFormStateFlags = typeof registerFormStateFlags[number]

export type RegisterFormModel = Omit<
  RegisterFormState,
  RegisterFormStateFlags
> & {
  emailError: string
  passwordError: string
  passwordTokenSets: string[]
  passwordStrengthPercent: number
  passwordStrengthDuration: number
  passwordStrengthUnit: PasswordStrengthUnit
  passwordStrengthColor: PasswordStrengthColor
  passwordStrengthTooltip: string
  confirmationPasswordError: string
  registerButtonEnabled: boolean
  registerButtonLoading: boolean
  displayCheckEmailModal: boolean
}

export const registerViewModel = (
  state: RegisterFormState
): RegisterFormModel => {
  const emailInvalid = !isValidEmail(state.email)
  const entropyInfo = entropy(state.password)
  const [passwordStrengthDuration, passwordStrengthUnit] = entropyDuration(
    entropyInfo.entropy
  )
  const passwordStrengthColor = entropyDurationColor[passwordStrengthUnit]
  const passwordStrengthUnacceptable = passwordStrengthColor !== 'green'
  const confirmationPasswordMismatch =
    state.password !== state.confirmationPassword

  return {
    ...omit(state, ...registerFormStateFlags),
    emailError: emailInvalid
      ? 'Valid email address is required.'
      : state.emailAlreadyRegistered
      ? 'Email address already registered.'
      : '',

    passwordError: passwordStrengthUnacceptable
      ? 'Password strength meter must be green.'
      : '',
    passwordStrengthPercent: Math.round(
      Math.min(entropyInfo.entropy / 72, 1) * 100
    ),
    passwordStrengthTooltip: passwordTooltip(
      passwordStrengthDuration,
      passwordStrengthUnit
    ),
    passwordTokenSets: entropyInfo.sets,
    passwordStrengthDuration,
    passwordStrengthUnit,
    passwordStrengthColor,
    confirmationPasswordError: confirmationPasswordMismatch
      ? 'Confirmed password must match.'
      : '',
    registerButtonEnabled:
      !emailInvalid &&
      !state.emailAlreadyRegistered &&
      !passwordStrengthUnacceptable &&
      !confirmationPasswordMismatch &&
      !state.actionUnderway,
    registerButtonLoading: state.actionUnderway,
    displayCheckEmailModal: state.verificationEmailSent,
  }
}
