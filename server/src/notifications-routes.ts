import { FastifyInstance } from 'fastify'
import WebPush from 'web-push'
import { z } from 'zod'

// Public Key e o Private Key muda toda vez q inicia o server
const publicKey = 'BJabOAr9x6q7lmk3zFcPZ9lvEZB_5nNWDj2Q2hoXroYxR-7gMS7ABOfdoptQDZCPNSyEEoFS7EqkriQ0FVyTcbw'
const privateKey = 'XQc4-Q9FCmImH4LIuxvz6ksDwtRwi3nrB-PK2J70ue0'
// console.log(WebPush.generateVAPIDKeys())

WebPush.setVapidDetails(
    'http://localhost:3333',
    publicKey,
    privateKey
)

export const notificationRoutes = async (app: FastifyInstance) => {
    app.get('/push/public_key', () => {
        return { publicKey }
    })

    // Conectar
    app.post('/push/register', (req, res) => {
        console.log(req.body)

        return res.status(201).send()
    })

    // Enviar Notificação
    // Obs: Mesmo q o user ñ esteja com o app aberto
    // Obs: Apenas abrindo o Browser
    app.post('/push/send', async(req, res) => {
        const sendPushBody = z.object({
            subscription: z.object({
                endpoint: z.string(),
                keys: z.object({
                    p256dh: z.string(),
                    auth: z.string()
                })
            })
        })
        const { subscription } = sendPushBody.parse(req.body)

        setTimeout(() => {
            WebPush.sendNotification(subscription, 'Hello do Back-end :) ')
        }, 5000) // 5 minutes

        return res.status(201).send()
    })
}