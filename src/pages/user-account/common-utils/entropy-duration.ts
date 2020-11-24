const BILLION = 1000 * 1000 * 1000
const GUESSES_PER_SECOND = 10 * BILLION

const MINUTES = 60
const HOURS = MINUTES * 60
const DAYS = HOURS * 24
const YEARS = DAYS * 365.25
const MONTHS = YEARS / 12
const CENTURIES = YEARS * 100

export type DurationUnit =
  | 'seconds'
  | 'minutes'
  | 'hours'
  | 'days'
  | 'months'
  | 'years'
  | 'centuries'

export const entropyDuration = (entropy: number): [number, DurationUnit] => {
  const requiredGuesses = Math.pow(2, entropy)
  const secondsToGuess = Math.ceil(requiredGuesses / GUESSES_PER_SECOND)

  if (secondsToGuess / CENTURIES >= 1) {
    return [Math.min(Math.round(secondsToGuess / CENTURIES), 100), 'centuries']
  } else if (secondsToGuess / YEARS >= 1) {
    return [Math.round(secondsToGuess / YEARS), 'years']
  } else if (secondsToGuess / MONTHS >= 1) {
    return [Math.min(Math.round(secondsToGuess / MONTHS), 100), 'months']
  } else if (secondsToGuess / DAYS >= 1) {
    return [Math.round(secondsToGuess / DAYS), 'days']
  } else if (secondsToGuess / HOURS >= 1) {
    return [Math.round(secondsToGuess / HOURS), 'hours']
  } else if (secondsToGuess / MINUTES >= 1) {
    return [Math.round(secondsToGuess / MINUTES), 'minutes']
  } else {
    return [secondsToGuess, 'seconds']
  }
}

export type DurationColor = 'red' | 'orange' | 'green'

export const entropyDurationColor: Record<DurationUnit, DurationColor> = {
  seconds: 'red',
  minutes: 'red',
  hours: 'orange',
  days: 'orange',
  months: 'green',
  years: 'green',
  centuries: 'green',
}
