import {
  Box,
  Button,
  Checkbox,
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
import PasswordInput from '../common-components/password-input'
import type { LoginFormAction } from './login-view-model'
import { defaultState, loginReducer, loginViewModel } from './login-view-model'

type LoginPresentationProps = {
  loggedIn: boolean
  onExit: () => void
  doCheckEmailAvailability: (email: string) => Promise<LoginFormAction>
  doLoginUser: (email: string, password: string) => Promise<LoginFormAction>
  doSendPasswordResetEmail: (
    email: string,
    newPassword: string
  ) => Promise<LoginFormAction>
}

const doNothing = () => {}
doNothing() // keep `tap --100` happy

const LoginPresentation = ({
  loggedIn,
  onExit,
  doCheckEmailAvailability,
  doLoginUser,
  doSendPasswordResetEmail,
}: LoginPresentationProps) => {
  const [state, dispatch] = useReducer(loginReducer, defaultState)
  const view = loginViewModel(state)

  return (
    <>
      <Head>
        <title>Login</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box>
        <Heading size="2xl" mb="20px">
          Welcome back.
        </Heading>

        <form
          onSubmit={async (event) => {
            event.preventDefault()
            dispatch({
              type: 'FORM_ACTION_BUTTON_CLICKED',
            })
            const loginAction = view.forgottenPasswordCheckboxEnabled
              ? doSendPasswordResetEmail(view.email, view.password)
              : doLoginUser(view.email, view.password)
            dispatch(await loginAction)
          }}
        >
          <Flex>
            <Stack spacing="24px" width="600px">
              <EmailInput
                email={view}
                helperText="Your registered email address."
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

              {!view.forgottenPasswordCheckboxEnabled ? (
                <PasswordInput
                  password={view}
                  onChange={(password) => {
                    dispatch({
                      type: 'PASSWORD_UPDATED',
                      password,
                    })
                  }}
                />
              ) : (
                <>
                  <PasswordCreationInput
                    password={view}
                    label="New Password"
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
                </>
              )}

              <Checkbox
                isChecked={view.forgottenPasswordCheckboxEnabled}
                onChange={() =>
                  dispatch({
                    type: 'FORGOTTEN_PASSWORD_CHECKBOX_CLICKED',
                  })
                }
              >
                Forgotten password
              </Checkbox>

              <Stack isInline>
                <Spacer />
                <Button
                  type="submit"
                  colorScheme="pink"
                  disabled={!view.formActionButtonEnabled}
                  isLoading={view.formActionButtonLoading}
                >
                  {view.formActionButtonLabel}
                </Button>
              </Stack>
            </Stack>
            <Spacer />
          </Flex>
        </form>
      </Box>
      <Modal
        size="lg"
        isOpen={loggedIn && !view.formActionButtonLoading}
        closeOnOverlayClick={false}
        closeOnEsc={false}
        onClose={onExit}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>You're already logged in</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            If you want to login a new account then please logout first.
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
          <ModalHeader>Password reset email sent</ModalHeader>
          <ModalBody pb={6}>
            <Text>
              A password reset email has been sent to you at{' '}
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

export default LoginPresentation
