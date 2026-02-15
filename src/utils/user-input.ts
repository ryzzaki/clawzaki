import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const userInput = async (question: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(question, (ans) => {
      resolve(ans);
      rl.close();
    });
  });
};
