import {
  Box,
  Button,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Stack,
  Text,
} from '@chakra-ui/react'
import Head from 'next/head'
import React, { useReducer } from 'react'

import EmailInput from '../common-components/email-input'
import ConfirmationPasswordInput from '../common-components/password-confirmation-input'
import PasswordCreationInput from '../common-components/password-creation-input'
import type { RegisterFormAction } from './register-view-model'
import {
  defaultState,
  registerReducer,
  registerViewModel,
} from './register-view-model'

type RegisterPresentationProps = {
  loggedIn: boolean
  onExit: () => void
  doCheckEmailAvailability: (email: string) => Promise<RegisterFormAction>
  doRegisterUser: (
    email: string,
    password: string
  ) => Promise<RegisterFormAction>
}

const doNothing = () => {}
doNothing() // keep `tap --100` happy

const RegisterPresentation = ({
  loggedIn,
  onExit,
  doCheckEmailAvailability,
  doRegisterUser,
}: RegisterPresentationProps) => {
  const [state, dispatch] = useReducer(registerReducer, defaultState)
  const view = registerViewModel(state)

  return (
    <>
      <Head>
        <title>Register</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box>
        <Heading size="2xl" mb="20px">
          Register now to use the app.
        </Heading>

        <Text mb="40px">That's it children, don't be scared! 🍬🍫</Text>

        <form
          onSubmit={async (event) => {
            event.preventDefault()
            dispatch({
              type: 'REGISTER_BUTTON_CLICKED',
            })
            dispatch(await doRegisterUser(view.email, view.password))
          }}
        >
          <Flex>
            <Stack spacing="24px" width="600px">
              <EmailInput
                email={view}
                helperText="We'll never share your email."
                onChange={(email) =>
                  dispatch({
                    type: 'EMAIL_UPDATED',
                    email,
                  })
                }
                onBlur={async () => {
                  dispatch(await doCheckEmailAvailability(view.email))
                }}
              />

              <PasswordCreationInput
                password={view}
                label="Password"
                onChange={(password) => {
                  dispatch({
                    type: 'PASSWORD_UPDATED',
                    password,
                  })
                }}
              />

              <ConfirmationPasswordInput
                confirmationPassword={view}
                onChange={(confirmationPassword) => {
                  dispatch({
                    type: 'CONFIRMATION_PASSWORD_UPDATED',
                    confirmationPassword,
                  })
                }}
              />

              <Stack isInline>
                <Spacer />
                <Button
                  type="submit"
                  colorScheme="pink"
                  disabled={!view.registerButtonEnabled}
                  isLoading={view.registerButtonLoading}
                >
                  Register
                </Button>
              </Stack>
            </Stack>
            <Spacer />
          </Flex>
        </form>
      </Box>
      <Modal
        size="lg"
        isOpen={loggedIn && !view.registerButtonLoading}
        closeOnOverlayClick={false}
        closeOnEsc={false}
        onClose={onExit}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>You're already logged in</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            If you want to register a new account then please logout first.
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onExit}>
              Okay
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={view.displayCheckEmailModal}
        closeOnOverlayClick={false}
        closeOnEsc={false}
        onClose={doNothing}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Email confirmation sent</ModalHeader>
          <ModalBody pb={6}>
            <Text>
              A confirmation email has been sent to you at{' '}
              <Text as="span" color="blue.500">
                {view.email}
              </Text>
              . Please click on the link within that email to continue.
            </Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default RegisterPresentation
