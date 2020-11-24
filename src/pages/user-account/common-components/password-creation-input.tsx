import {
  Badge,
  CircularProgress,
  CircularProgressLabel,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Tooltip,
} from '@chakra-ui/react'
import useVisited from '../../../lib/use-visited'
import React from 'react'

import type {
  DurationColor as PasswordStrengthColor,
  DurationUnit as PasswordStrengthUnit,
} from '../common-utils/entropy-duration'
import { Password } from './password-input'
import passwordTooltip from './password-tooltip'

export type NewPassword = Password & {
  passwordTokenSets: string[]
  passwordStrengthPercent: number
  passwordStrengthDuration: number
  passwordStrengthUnit: PasswordStrengthUnit
  passwordStrengthColor: PasswordStrengthColor
}

type PasswordCreationInputProps = {
  password: NewPassword
  label: string
  onChange: (password: string) => void
}

const colorSchemes = ['green', 'purple', 'red']
const variants = ['subtle', 'solid', 'outline']

const PasswordCreationInput = ({
  password,
  label,
  onChange,
}: PasswordCreationInputProps) => {
  const [hasVisited, recordVisit] = useVisited()
  const unitIndicator = password.passwordStrengthUnit.charAt(0)

  return (
    <FormControl
      id="password"
      isInvalid={Boolean(password.passwordError) && hasVisited('password')}
    >
      <FormLabel>{label}</FormLabel>
      <InputGroup>
        <Input
          type="password"
          placeholder="Enter password"
          value={password.password}
          onChange={(event) => {
            onChange(event.target.value)
          }}
          onBlur={() => recordVisit('password')}
        />
        <Tooltip
          label={passwordTooltip(
            password.passwordStrengthDuration,
            password.passwordStrengthUnit
          )}
          aria-label="Password strength"
        >
          <InputRightElement _hover={{ cursor: 'default' }}>
            <CircularProgress
              value={password.passwordStrengthPercent}
              color={`${password.passwordStrengthColor}.400`}
              size="30px"
            >
              <CircularProgressLabel>{`${password.passwordStrengthDuration}${unitIndicator}`}</CircularProgressLabel>
            </CircularProgress>
          </InputRightElement>
        </Tooltip>
      </InputGroup>
      <Stack direction="row" margin="4px">
        {password.passwordTokenSets.map((tokenSet, i) => (
          <Badge
            key={tokenSet}
            colorScheme={colorSchemes[Math.floor((i / 3) % 3)]}
            variant={variants[i % 3]}
          >
            {tokenSet}
          </Badge>
        ))}
      </Stack>
      <FormErrorMessage>{password.passwordError}</FormErrorMessage>
      <FormHelperText>
        Include numbers, capitals and symbols for strength.
      </FormHelperText>
    </FormControl>
  )
}

export default PasswordCreationInput
