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
import type { LoginFormState } from './login-reducer'

export { default as loginReducer, defaultState } from './login-reducer'
export type { LoginFormAction } from './login-reducer'

const loginFormStateFlags = [
  'actionUnderway',
  'emailNotRegistered',
  'resetEmailSent',
] as const

type LoginFormStateFlags = typeof loginFormStateFlags[number]

export type LoginFormModel = Omit<LoginFormState, LoginFormStateFlags> & {
  emailError: string
  passwordError: string
  passwordTokenSets: string[]
  passwordStrengthPercent: number
  passwordStrengthDuration: number
  passwordStrengthUnit: PasswordStrengthUnit
  passwordStrengthColor: PasswordStrengthColor
  passwordStrengthTooltip: string
  confirmationPasswordError: string
  formActionButtonLabel: string
  formActionButtonEnabled: boolean
  formActionButtonLoading: boolean
  displayCheckEmailModal: boolean
}

export const loginViewModel = (state: LoginFormState): LoginFormModel => {
  const emailInvalid = !isValidEmail(state.email)
  const emailError = emailInvalid
    ? 'Valid email address is required.'
    : state.emailNotRegistered
    ? 'Email address not registered.'
    : ''
  const entropyInfo = entropy(state.password)
  const [passwordStrengthDuration, passwordStrengthUnit] = entropyDuration(
    entropyInfo.entropy
  )
  const passwordStrengthColor = entropyDurationColor[passwordStrengthUnit]
  const passwordStrengthUnacceptable = passwordStrengthColor !== 'green'
  const passwordError =
    state.password.length === 0 ? 'Password must be provided.' : ''
  const newPasswordError = passwordStrengthUnacceptable
    ? 'Password strength meter must be green.'
    : ''
  const confirmationPasswordError =
    state.password !== state.confirmationPassword
      ? 'Confirmed password must match.'
      : ''
  const baseFormActionButtonRequirements =
    !emailError && !state.emailNotRegistered && !state.actionUnderway
  const formActionButtonEnabled =
    baseFormActionButtonRequirements &&
    (state.forgottenPasswordCheckboxEnabled
      ? !newPasswordError && !confirmationPasswordError
      : !passwordError)

  return {
    ...omit(state, ...loginFormStateFlags),
    emailError,
    passwordError: state.forgottenPasswordCheckboxEnabled
      ? newPasswordError
      : passwordError,
    passwordStrengthTooltip: passwordTooltip(
      passwordStrengthDuration,
      passwordStrengthUnit
    ),
    confirmationPasswordError,
    formActionButtonEnabled,
    formActionButtonLabel: state.forgottenPasswordCheckboxEnabled
      ? 'Reset Password'
      : 'Login',
    formActionButtonLoading: state.actionUnderway,
    passwordStrengthPercent: Math.round(
      Math.min(entropyInfo.entropy / 72, 1) * 100
    ),
    passwordTokenSets: entropyInfo.sets,
    passwordStrengthDuration,
    passwordStrengthUnit,
    passwordStrengthColor,
    displayCheckEmailModal: state.resetEmailSent,
  }
}
