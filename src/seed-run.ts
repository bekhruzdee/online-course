import { AppDataSource } from './data-source';
import { seed } from './seed/seed';

AppDataSource.initialize()
  .then(async () => {
    console.log('DB connected');
    await seed(AppDataSource);
    console.log('Seed finished ✅');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
