import app from './app';
import { connectToDb, disconnectFromDb } from './dbUtils';

connectToDb();

app.listen(process?.env?.PORT || 8080, () => {
  console.log(`Server is listening on port ${process?.env?.PORT || 8080}.`);
});

app.on('error', async () => {
  disconnectFromDb();
  process.exit(1);
})
