import 'dotenv/config';
import { bot, handleMessage } from './bot';

const main = async () => {
  handleMessage();

  bot.start();
};

main().catch((e) => {
  console.log('Ran into issues', e);
  process.exit(1);
});
