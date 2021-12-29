import { config } from 'dotenv'
config()
import irc from './irc'

irc.on('registered', (message: string) => console.log('registered', message))
irc.connect()
