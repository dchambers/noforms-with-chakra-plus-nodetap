import { DurationUnit } from '../common-utils/entropy-duration'

const singularUnit = (durationUnit: DurationUnit) =>
  durationUnit === 'centuries'
    ? 'century'
    : durationUnit.slice(0, durationUnit.length - 1)

const passwordTooltip = (duration: number, durationUnit: DurationUnit) =>
  `${duration} ${
    duration > 1 ? durationUnit : singularUnit(durationUnit)
  } to guess password at 10 billion guesses per second.`

export default passwordTooltip
