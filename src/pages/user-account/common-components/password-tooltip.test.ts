import tap from 'tap'

import passwordTooltip from './password-tooltip'

tap.test('Durations of one work correctly', (test) => {
  test.equals(
    passwordTooltip(1, 'seconds'),
    '1 second to guess password at 10 billion guesses per second.'
  )
  test.equals(
    passwordTooltip(1, 'minutes'),
    '1 minute to guess password at 10 billion guesses per second.'
  )
  test.equals(
    passwordTooltip(1, 'hours'),
    '1 hour to guess password at 10 billion guesses per second.'
  )
  test.equals(
    passwordTooltip(1, 'days'),
    '1 day to guess password at 10 billion guesses per second.'
  )
  test.equals(
    passwordTooltip(1, 'months'),
    '1 month to guess password at 10 billion guesses per second.'
  )
  test.equals(
    passwordTooltip(1, 'years'),
    '1 year to guess password at 10 billion guesses per second.'
  )
  test.equals(
    passwordTooltip(1, 'centuries'),
    '1 century to guess password at 10 billion guesses per second.'
  )
  test.end()
})

tap.test('Durations of greater than one work correctly', (test) => {
  test.equals(
    passwordTooltip(2, 'seconds'),
    '2 seconds to guess password at 10 billion guesses per second.'
  )
  test.equals(
    passwordTooltip(2, 'minutes'),
    '2 minutes to guess password at 10 billion guesses per second.'
  )
  test.equals(
    passwordTooltip(2, 'hours'),
    '2 hours to guess password at 10 billion guesses per second.'
  )
  test.equals(
    passwordTooltip(2, 'days'),
    '2 days to guess password at 10 billion guesses per second.'
  )
  test.equals(
    passwordTooltip(2, 'months'),
    '2 months to guess password at 10 billion guesses per second.'
  )
  test.equals(
    passwordTooltip(2, 'years'),
    '2 years to guess password at 10 billion guesses per second.'
  )
  test.equals(
    passwordTooltip(2, 'centuries'),
    '2 centuries to guess password at 10 billion guesses per second.'
  )
  test.end()
})
