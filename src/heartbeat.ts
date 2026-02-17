import { CronJob } from 'cron';
import { loadSessions, saveSession } from './session';
import { runAgentLoop } from './agent';

// heartbeats use their own session key to keep the main session thread from being cluttered
export const startHeartbeat = () => {
  const sessionKey = 'cron:morning-briefing';

  const job = new CronJob(
    '30 7 * * *', // every day at 7:30
    async () => {
      const sessionMessages = loadSessions(sessionKey);
      sessionMessages.push({ role: 'user', content: "Good morning, check today's date and give a motivational quote" });

      const { text, messages } = await runAgentLoop(sessionMessages);
      saveSession(sessionKey, messages);

      console.log(`Ran CRON job, output: ${text}`);
    },
  );

  job.start();
};
