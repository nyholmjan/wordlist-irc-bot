import { firestore } from 'firebase-admin'
import Firestore = firestore.Firestore

export default class LoginService {
    private collection
    private collectionPath = "user"

    constructor(db: Firestore) {
        this.collection = db.collection(this.collectionPath)
    }

    public async get(value = "default") {
        const result = await this.collection.where('user', '==', value).get()

        return result.docs.map((doc) => doc.data())[0]
    }
}