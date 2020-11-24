import { Box, ChakraProvider } from '@chakra-ui/react'
import React, { ReactElement } from 'react'

import appTheme from '../src/app-theme'

export type AppProps<PP> = {
  pageProps: PP
  Component: (pageProps: PP) => ReactElement
}

function App<PP>({ Component, pageProps }: AppProps<PP>) {
  return (
    <ChakraProvider theme={appTheme}>
      <Box maxWidth="1200px" marginX="auto" paddingX="1.5em" paddingY="3em">
        <Component {...pageProps} />
      </Box>
    </ChakraProvider>
  )
}

export default App
