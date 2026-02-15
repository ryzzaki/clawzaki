import 'dotenv/config';
import { bot, handleMessage } from './agent';

const main = async () => {
  handleMessage();

  bot.start();
};

main().catch((e) => {
  console.log('Ran into issues', e);
  process.exit(1);
});
