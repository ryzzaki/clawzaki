const sessionLocks = new Map<string, { acquire: <T>(fn: () => Promise<T>) => Promise<T> }>();

const createMutex = () => {
  let lock = Promise.resolve();

  return {
    acquire: async <T>(fn: () => Promise<T>) => {
      let release: () => void = () => {};
      // save the previous lock
      const prev = lock;
      // assign a new lock to the current runner
      lock = new Promise<void>((resolve) => (release = resolve));
      // wait for the previous lock to finish
      await prev;
      // do our thing and then release at the end so that the promise is resolved
      try {
        return await fn();
      } finally {
        release();
      }
    },
  };
};

export const getLock = (userId: string) => {
  if (!sessionLocks.has(userId)) {
    sessionLocks.set(userId, createMutex());
  }

  const sharedMutex = sessionLocks.get(userId);
  if (!sharedMutex) {
    throw new Error('Failed to initialize user scoped session lock');
  }

  return sharedMutex;
};
