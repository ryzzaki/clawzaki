### OpenClaw Re-implementation

This is a bare-bones re-implementation of OpenClaw in pure TypeScript. Written with the intent to gain a better grasp of the mental model required to understand how it works under the hood. Feel free to fork & modify.

All code was written by a human.

🫡 to [@dabit3](https://github.com/dabit3) for writing the comprehensive article.

#### Gateway

###### REST

```bash
curl -H "Content-Type: application/json" --request POST --url http://localhost:3000/chat --data '{"userId": "<your-user-id>", "message": "describe what you have done previously"}'
```

###### TG

1. Create a bot on TG using BotFather
2. Use `.env.example` and paste the credentials
3. Run app with `pnpm dev`

#### Tool Call Example

> Create a file "hello.py" into a folder called "sessions" which will print "Hello World from <your name>" and include your name there. Make sure you create the file in the path of the current workspace where the sessions folder already is.

#### Checklist

- [x] Persistent sessions
- [x] Tool calling
- [x] Permission/Approval mechanism
- [x] Gateway implementation
- [x] Compaction / Context pruning
- [x] Long-term memory
- [ ] Message lock
- [ ] Heartbeat
- [ ] Multi-agents
