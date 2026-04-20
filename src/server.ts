import 'dotenv/config';

import createApp from './app.ts';

const PORT = 3001;

const bootstrap = async (): Promise<void> => {
  const app = createApp();

  app.listen(PORT, () => {
   console.log(`Server is running on http://localhost:${PORT}`);
  });
};

bootstrap().catch(error => {
  console.error({ err: error }, 'Application run failed');
  process.exit(2);
});
