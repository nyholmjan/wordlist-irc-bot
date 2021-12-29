import { firestore } from 'firebase-admin'
import Firestore = firestore.Firestore

export default class WordService {
    private collection
    private collectionPath =
        process.env.FIRESTORE_COLLECTION_NAME || 'paska-lista'

    constructor(db: Firestore) {
        this.collection = db.collection(this.collectionPath)
    }

    public async get(value: string) {
        const result = await this.collection.where('value', '==', value).get()

        return result.docs.map((doc) => doc.get('value'))
    }

    public async getAll() {
        const result = await this.collection.get()

        return result.docs.map((doc) => doc.get('value'))
    }

    public async add(word: string) {
        const exists = await this.get(word)
        if (exists.length > 0) {
            throw new Error('Word already exists')
        }

        await this.collection.add({ value: word })

        return word
    }

    public async delete(word: string) {
        const documentsToDelete = await this.collection
            .where('value', '==', word)
            .get()
        documentsToDelete.forEach((snapshot) => snapshot.ref.delete())

        return word
    }
}
