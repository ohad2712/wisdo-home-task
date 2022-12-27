import mongoose from 'mongoose';

export function connectToDb (mongodbUri?) {
  (async () => {
    try {
      await connect(mongodbUri);
    } catch (e) {
      console.error(e);
    }
  })();  
}

export async function connect (mongodbUri?) {
  const mongodbDefaultUri = 'mongodb://localhost:27017/my-db';

  // Connect to MongoDB using Mongoose
  await mongoose.connect(process?.env?.MONGODB_URI || mongodbUri || mongodbDefaultUri);

  const db = mongoose.connection;

  db.on('error', (err) => {
    // DB connection errors
    console.error('An error occurred while connecting to the DB', { err });
  });
}

export async function disconnectFromDb () {
  await mongoose.connection.close();
}
