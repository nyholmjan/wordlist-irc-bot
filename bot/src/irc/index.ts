import { wordService } from '../../../shared/database'

// no types for the module. using require for now
const irc = require('irc-upd')

const channel = process.env.IRC_BOT_CHANNEL || '#testifoorumi'
const network = process.env.IRC_BOT_NETWORK || 'irc.ircnet.com'

const admins =
    process.env.IRC_BOT_ADMINS !== undefined
        ? process.env.IRC_BOT_ADMINS.split(',')
        : ['kolistelija']

const bot = {
    nick: process.env.IRC_BOT_NICK || 'w-bot',
    userName: process.env.IRC_BOT_USERNAME || 'Paskalista',
    realName: process.env.IRC_BOT_REALNAME || 'Paska Lista Bot',
}

const client = new irc.Client(network, bot.nick, {
    channels: [channel],
    userName: bot.userName,
    realName: bot.realName,
    debug: true,
    autoConnect: false,
    millisecondsOfSilenceBeforePingSent: 300 * 1000,
    floodProtection: true,
})

client.addListener('error', (message: string) => {
    console.log('error: ', message)
})

client.on(
    'message',
    async (nick: string, to: string, text: string, _message: string) => {
        if (text.startsWith(`${bot.nick}:`) || to === bot.nick) {
            const command =
                to === bot.nick ? text : text.split(' ').slice(1).join(' ')
            const toWhom = to === bot.nick ? nick : to
            console.log(nick, to, command)
            if (admins.some((admin) => nick === admin)) {
                if (
                    command.startsWith('lisää paskasana') &&
                    command.split(' ').length === 3
                ) {
                    try {
                        await wordService.add(command.split(' ')[2])
                        client.say(
                            toWhom,
                            `Paskasana lisätty: ${command.split(' ')[2]}`
                        )
                        return
                    } catch (error) {
                        if (error instanceof Error) {
                            client.say(admins[0], error.message)
                        } else {
                            console.log(error)
                        }
                    }
                } else if (
                    command.startsWith('poista paskasana') &&
                    command.split(' ').length === 3
                ) {
                    try {
                        await wordService.delete(command.split(' ')[2])
                        client.say(
                            toWhom,
                            `Paskasana poistettu: ${command.split(' ')[2]}`
                        )
                        return
                    } catch (error) {
                        if (error instanceof Error) {
                            client.say(admins[0], error.message)
                        } else {
                            console.log(error)
                        }
                    }
                } else if (command === 'luettele paskasanat') {
                    const words = await wordService.getAll()
                    const wordsAsString = words.join(', ')
                    if (wordsAsString.length < 500) {
                        client.say(toWhom, wordsAsString)
                    } else {
                        client.say(
                            toWhom,
                            'Liikaa paskasanoja, koedi koodaa rivityksen tai tarkistaa koodit'
                        )
                    }
                }
            }
        } else if (to === channel) {
            try {
                const words = await wordService.getAll()
                const wordsRegexp = new RegExp(`${words.join('|')}`, 'ig')
                const regexpMatchArray = [...text.matchAll(wordsRegexp)]
                if (regexpMatchArray.length > 0) {
                    const matches = regexpMatchArray
                        .map((match) => match[0])
                        .join(', ')
                    const errorMessage = `${nick}: ethän käytä seuraavia sanoja: ${matches}`
                    client.say(channel, errorMessage)
                }
            } catch (error) {
                if (error instanceof Error) {
                    client.say(admins[0], error.message)
                } else {
                    console.log(error)
                }
            }
        }
    }
)

export default client
