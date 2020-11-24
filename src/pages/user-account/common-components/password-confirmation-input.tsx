import { CheckIcon } from '@chakra-ui/icons'
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react'
import useVisited from '../../../lib/use-visited'
import React from 'react'

type ConfirmationPassword = {
  confirmationPassword: string
  confirmationPasswordError: string
}

type ConfirmationPasswordInput = {
  confirmationPassword: ConfirmationPassword
  onChange: (confirmationPassword: string) => void
}

const ConfirmationPasswordInput = ({
  confirmationPassword,
  onChange,
}: ConfirmationPasswordInput) => {
  const [hasVisited, recordVisit] = useVisited()

  return (
    <FormControl
      id="confirm-password"
      isInvalid={
        Boolean(confirmationPassword.confirmationPasswordError) &&
        hasVisited('confirm-password')
      }
    >
      <FormLabel>Confirm Password</FormLabel>
      <InputGroup>
        <Input
          type="password"
          placeholder="Re-enter password"
          value={confirmationPassword.confirmationPassword}
          onChange={(event) => {
            onChange(event.target.value)
          }}
          onBlur={() => recordVisit('confirm-password')}
        />
        <InputRightElement>
          {Boolean(confirmationPassword.confirmationPasswordError) ? null : (
            <CheckIcon color="green.400" />
          )}
        </InputRightElement>
      </InputGroup>
      <FormErrorMessage>
        {confirmationPassword.confirmationPasswordError}
      </FormErrorMessage>
      <FormHelperText>Ensure password is same in both boxes.</FormHelperText>
    </FormControl>
  )
}

export default ConfirmationPasswordInput
