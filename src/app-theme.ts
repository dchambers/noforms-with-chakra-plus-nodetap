import { extendTheme } from '@chakra-ui/react'

const appTheme = extendTheme({
  styles: {
    global: {
      'html, body, #__next': {
        height: '100%',
      },
    },
  },
})

export default appTheme
