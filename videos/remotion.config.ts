import { Config } from '@remotion/cli/config'

// Chromium de la sesión (no se descarga otro). En otro equipo, comenta la línea o apunta a tu Chrome.
const SHELL = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell'
import { existsSync } from 'node:fs'
if (existsSync(SHELL)) Config.setBrowserExecutable(SHELL)

Config.setVideoImageFormat('png')
Config.setCodec('h264')
Config.setCrf(16)
Config.setPixelFormat('yuv420p')
