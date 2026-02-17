import 'dotenv/config';
import { bot, handleMessage, handleServerReq } from './gateway';
import Fastify from 'fastify';
import { startHeartbeat } from './heartbeat';

const main = async () => {
  const fastify = Fastify({
    logger: true,
  });
  // bind server handler
  fastify.post('/chat', handleServerReq);
  // bind tg bot handler
  handleMessage();
  // start heartbeat, tg bot, and server
  startHeartbeat();
  bot.start();
  fastify.listen({ port: 3000 }, (err, address) => {
    if (err) {
      throw err;
    }

    console.log(`Server listening on: ${address}`);
  });
};

main().catch((e) => {
  console.log('Ran into issues', e);
  process.exit(1);
});
