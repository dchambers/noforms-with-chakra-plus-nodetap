import browserEnv from 'jsdom-global'

browserEnv('', { url: 'https://acme.com/', pretendToBeVisual: true })

global.requestAnimationFrame = window.requestAnimationFrame
global.cancelAnimationFrame = window.cancelAnimationFrame
