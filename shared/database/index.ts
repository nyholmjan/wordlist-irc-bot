import { initializeApp, applicationDefault, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import WordService from './wordService'
import LoginService from './loginService'

const privateKey = process.env.GCP_SERVICE_ACCOUNT_KEY
const projectId = process.env.GCP_SERVICE_ACCOUNT_PROJECT_ID
const clientEmail = process.env.GCP_SERVICE_ACCOUNT_CLIENT_EMAIL

const serviceAccount = {
    privateKey,
    projectId,
    clientEmail,
}

initializeApp({
    credential:
        privateKey && projectId ? cert(serviceAccount) : applicationDefault(),
})

export const db = getFirestore()

const wordService = new WordService(db)
const loginService = new LoginService(db)

export { wordService, loginService }
