import { MongoClient } from 'mongodb'

if (!process.env.DATABASE_URL) {
  throw new Error('Please add your MongoDB URI to .env')
}

const uri = process.env.DATABASE_URL
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

export async function getMongoClient() {
  return await clientPromise
}

export async function getMongoDb() {
  const client = await clientPromise
  return client.db()
} 