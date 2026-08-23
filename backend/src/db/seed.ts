import { seedDev } from './seed-dev.js';
import { queryClient } from './index.js';

seedDev()
  .then(async () => {
    await queryClient.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('❌ Seed execution failed:', err);
    await queryClient.end();
    process.exit(1);
  });
