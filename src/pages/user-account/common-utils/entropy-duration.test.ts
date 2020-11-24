import tap from 'tap'

import { entropyDuration } from './entropy-duration'

tap.test('seconds', (test) => {
  test.deepEquals(entropyDuration(0), [1, 'seconds'])
  test.deepEquals(entropyDuration(1), [1, 'seconds'])
  test.deepEquals(entropyDuration(33), [1, 'seconds'])
  test.deepEquals(entropyDuration(34), [2, 'seconds'])
  test.deepEquals(entropyDuration(39), [55, 'seconds'])
  test.end()
})

tap.test('minutes', (test) => {
  test.deepEquals(entropyDuration(40), [2, 'minutes'])
  test.deepEquals(entropyDuration(45), [59, 'minutes'])
  test.end()
})

tap.test('hours', (test) => {
  test.deepEquals(entropyDuration(46), [2, 'hours'])
  test.deepEquals(entropyDuration(49), [16, 'hours'])
  test.end()
})

tap.test('days', (test) => {
  test.deepEquals(entropyDuration(50), [1, 'days'])
  test.deepEquals(entropyDuration(54), [21, 'days'])
  test.end()
})

tap.test('months', (test) => {
  test.deepEquals(entropyDuration(55), [1, 'months'])
  test.deepEquals(entropyDuration(58), [11, 'months'])
  test.end()
})

tap.test('years', (test) => {
  test.deepEquals(entropyDuration(59), [2, 'years'])
  test.deepEquals(entropyDuration(64), [58, 'years'])
  test.end()
})

tap.test('centuries', (test) => {
  test.deepEquals(entropyDuration(65), [1, 'centuries'])
  test.deepEquals(entropyDuration(71), [75, 'centuries'])
  test.deepEquals(entropyDuration(72), [100, 'centuries'])
  test.deepEquals(entropyDuration(100), [100, 'centuries'])
  test.end()
})
