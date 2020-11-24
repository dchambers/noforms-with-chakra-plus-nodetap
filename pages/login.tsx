import { useToast } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import React from 'react'
import sleep from 'sleep-promise'

import LoginPresentation from '../src/pages/user-account/login'
import type { LoginFormAction } from '../src/pages/user-account/login/login-reducer'

export const getStaticProps = async () => ({ props: {} })

const registeredEmails = ['alice@acme.com', 'bob@acme.com']

const LoginContainer = () => {
  const router = useRouter()
  const toast = useToast()
  const onExit = () => {
    router.replace('/')
  }
  const doCheckEmailAvailability = async (
    email: string
  ): Promise<LoginFormAction> => {
    await sleep(1000)
    return {
      type: 'EMAIL_REGISTERED_CHECK_RECEIVED',
      notRegistered: !registeredEmails.includes(email),
    }
  }
  const doLoginUser = async (
    email: string,
    password: string
  ): Promise<LoginFormAction> => {
    try {
      await sleep(750)
      if (password !== 'HappyPassword5') {
        throw new Error('Incorrect Password')
      }
      onExit()
      return new Promise(() => {})
    } catch (e) {
      toast({
        title: 'Login Error',
        description: e.message,
        status: 'error',
        isClosable: true,
      })
      return { type: 'LOGIN_FAILED' }
    }
  }
  const doSendPasswordResetEmail = async (
    email: string,
    password: string
  ): Promise<LoginFormAction> => {
    await sleep(2000)
    return { type: 'PASSWORD_RESET_EMAIL_SENT' }
  }

  return (
    <LoginPresentation
      loggedIn={false}
      onExit={onExit}
      doCheckEmailAvailability={doCheckEmailAvailability}
      doLoginUser={doLoginUser}
      doSendPasswordResetEmail={doSendPasswordResetEmail}
    />
  )
}

export default LoginContainer
