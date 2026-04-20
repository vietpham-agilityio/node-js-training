import 'dotenv/config';

// Datasource
import { AppDataSource } from '@/config/database.ts';

// Constant
import { PORT } from './constants/environments.ts';

import createApp from './app.ts';

const bootstrap = async (): Promise<void> => {
   await AppDataSource.initialize();

   const app = createApp(AppDataSource);

  app.listen(PORT, () => {
   console.log(`Server is running on http://localhost:${PORT}`);
  });
};

bootstrap().catch(error => {
  console.error({ err: error }, 'Application run failed');
  process.exit(2);
});
