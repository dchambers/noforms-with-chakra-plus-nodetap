import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
} from '@chakra-ui/react'
import useVisited from '../../../lib/use-visited'
import React from 'react'

export type Password = {
  password: string
  passwordError: string
}

type PasswordInputProps = {
  password: Password
  onChange: (password: string) => void
}

const PasswordInput = ({ password, onChange }: PasswordInputProps) => {
  const [hasVisited, recordVisit] = useVisited()

  return (
    <FormControl
      id="password"
      isInvalid={Boolean(password.passwordError) && hasVisited('password')}
    >
      <FormLabel>Password</FormLabel>
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
      </InputGroup>
      <FormErrorMessage>{password.passwordError}</FormErrorMessage>
      <FormHelperText>
        We can send a reset email if you've forgotten.
      </FormHelperText>
    </FormControl>
  )
}

export default PasswordInput
