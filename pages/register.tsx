import { useRouter } from 'next/router'
import React from 'react'
import sleep from 'sleep-promise'

import RegisterPresentation from '../src/pages/user-account/register'
import type { RegisterFormAction } from '../src/pages/user-account/register/register-reducer'

export const getStaticProps = async () => ({ props: {} })

const registeredEmails = ['alice@acme.com', 'bob@acme.com']

const RegisterContainer = () => {
  const router = useRouter()
  const onExit = () => {
    router.replace('/')
  }
  const doCheckEmailAvailability = async (
    email: string
  ): Promise<RegisterFormAction> => {
    await sleep(1000)
    return {
      type: 'EMAIL_REGISTERED_CHECK_RECEIVED',
      alreadyRegistered: registeredEmails.includes(email),
    }
  }
  const doRegisterUser = async (
    email: string,
    password: string
  ): Promise<RegisterFormAction> => {
    await sleep(2000)
    return { type: 'VERIFICATION_EMAIL_SENT' }
  }

  return (
    <RegisterPresentation
      loggedIn={false}
      onExit={onExit}
      doCheckEmailAvailability={doCheckEmailAvailability}
      doRegisterUser={doRegisterUser}
    />
  )
}

export default RegisterContainer
