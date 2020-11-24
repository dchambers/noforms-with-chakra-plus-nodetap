import { CheckIcon, EmailIcon } from '@chakra-ui/icons'
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from '@chakra-ui/react'
import useVisited from '../../../lib/use-visited'
import React from 'react'

type Email = {
  email: string
  emailError: string
}

type EmailInputProps = {
  email: Email
  helperText: string
  onChange: (email: string) => void
  onBlur: () => void
}

const EmailInput = ({
  email,
  helperText,
  onChange,
  onBlur,
}: EmailInputProps) => {
  const [hasVisited, recordVisit] = useVisited()

  return (
    <FormControl
      id="email"
      isInvalid={Boolean(email.emailError) && hasVisited('email')}
    >
      <FormLabel>Email Address</FormLabel>
      <InputGroup>
        <InputLeftElement>
          <EmailIcon size="20px" color="gray.300" />
        </InputLeftElement>
        <Input
          type="email"
          placeholder="Email address"
          value={email.email}
          onChange={(event) => onChange(event.target.value)}
          onBlur={async () => {
            recordVisit('email')
            onBlur()
          }}
        />
        <InputRightElement>
          {Boolean(email.emailError) ? null : <CheckIcon color="green.400" />}
        </InputRightElement>
      </InputGroup>
      <FormErrorMessage>{email.emailError}</FormErrorMessage>
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  )
}

export default EmailInput
