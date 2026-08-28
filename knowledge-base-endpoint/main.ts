import { flow, Message, Custom } from '@robomotion/sdk';

// Knowledge Base Endpoint — your own documents, with an answer in them.
//
// A Robomotion Knowledge Base turns a folder of documents into something a flow can
// ask a question. The documents are parsed, chunked and embedded by a connected
// workspace agent on your own machine, and the built index is downloaded and searched
// by the robot that runs this flow. The only thing that ever leaves is the question,
// and only to be turned into a vector.
//
// This flow is not a script that runs once. Http In makes it a service: it holds the
// request open, and Http Out replies on the same one. Anything that can make an HTTP
// request can ask your documents a question — a terminal, a chat window, another
// automation. `assets/ask.py` is a thirty-line client with no dependencies.
//
// The interesting property is Min Score. Query Knowledge Base returns nothing at all
// below it, which is what makes the "I could not find that" branch reachable: against
// the sample corpus a real question scores 97 or better and an unrelated one tops out
// near 50, so 0.6 is a fence rather than a decoration. Answers are the passage itself,
// with the document and heading it came from — nothing is summarised or invented.
flow.create('7862039e-7946-4bb9-96a0-d4808e64a3d5', 'Knowledge Base Endpoint', (f) => {
  f.addDependency('Robomotion.KnowledgeBase', '0.1.7');

  f.node('c30001', 'Core.Flow.Comment', 'Comment', { optText: '#### Knowledge Base Endpoint\nAsk your own documents a question over HTTP. *Query Knowledge Base* searches the index your workspace agent built and returns the passages that answer it, each with the document and heading it came from.\n\n**Min Score** is the fence: below it the node returns nothing, and the flow says it does not know instead of inventing an answer.\n\nNothing is summarised. What comes back is the passage, and where it lives.' });

  f.node('c30002', 'Core.Flow.Comment', 'Setup Guide', { optText: '#### 🚀 Setup Guide\n\n**1.** Connect a **workspace agent** on your machine: `robomotion-agent connect -i <email> -w <workspace>`. The index is built there, not on the robot. Without one, Build Index is disabled.\n\n**2.** Designer > **Knowledge** > New Knowledge Base. Name it `Kestrel Support`, keep the default embedding model. The model is locked after the first build.\n\n**3.** Open it and drop in the four documents from `assets/docs`. PDF, Word, Excel, Markdown, text and images are read, up to 64 MB each.\n\n**4.** **Build Index**, and wait for *Index built successfully*. Try the **Retrieval Test** box: ask for `E-27` in Keyword, Vector and Hybrid and watch the scores differ.\n\n**5.** Run this flow on a robot. It listens on `http://127.0.0.1:9090/ask` and waits.\n\n**6.** Ask it something: `python3 assets/ask.py` then `what nozzle temperature should I use for PETG?`' });

  // Http In holds the request open until Http Out answers it. Port and path are
  // properties, so the same flow can serve any endpoint you like.
  f.node('a10001', 'Core.Net.HttpIn', 'Ask Endpoint', {
    optMethod: 'POST',
    optEndpointV2: Custom('/ask'),
    optIPv2: Custom('127.0.0.1'),
    optPortv2: Custom('9090'),
  })
    .then('a10002', 'Core.Programming.Function', 'Read The Question', {
      func:
        "msg.question = (msg.body && msg.body.question ? msg.body.question : '').trim();\n" +
        "return msg;",
    })
    // Knowledge Base takes the name exactly as the Knowledge page spells it (an id
    // works too). Hybrid fuses vector and keyword scoring, which is what lets an exact
    // term like an error code survive next to a question asked in a whole sentence.
    .then('a10003', 'Robomotion.KnowledgeBase.QueryKnowledgeBase', 'Search The Documents', {
      optKnowledgeBase: Custom('Kestrel Support'),
      inQuery: Message('question'),
      optTopK: 3,
      optMode: 'hybrid',
      optMinScore: 0.6,
    })
    .then('a10004', 'Core.Programming.Switch', 'Did We Find Anything', {
      optConditions: [Custom('msg.chunks.length > 0'), Custom('msg.chunks.length == 0')],
      optUseBreak: true,
    });

  // The answer is the passage, not a paraphrase — and it says where it came from.
  f.node('a10005', 'Core.Programming.Function', 'Build The Answer', {
    func:
      "var top = msg.chunks[0];\n" +
      "var where = top.heading_path ? top.heading_path : (top.page ? 'page ' + top.page : '');\n" +
      "msg.body = {\n" +
      "  answer: top.text,\n" +
      "  document: top.document.name,\n" +
      "  section: where,\n" +
      "  score: Math.round(top.score * 100)\n" +
      "};\n" +
      "return msg;",
  });

  // Nothing cleared Min Score. Saying so is the honest answer, and it is why the
  // fence is worth setting.
  f.node('a10006', 'Core.Programming.Function', 'Say We Do Not Know', {
    func:
      "msg.body = {\n" +
      "  answer: 'I could not find that in the Kestrel documents.',\n" +
      "  document: '',\n" +
      "  section: '',\n" +
      "  score: 0\n" +
      "};\n" +
      "return msg;",
  });

  f.node('a10007', 'Core.Net.HttpOut', 'Send It Back', {
    inBody: Message('body'),
    inStatus: Custom('200'),
  });

  f.edge('a10004', 0, 'a10005', 0);
  f.edge('a10004', 1, 'a10006', 0);
  f.edge('a10005', 0, 'a10007', 0);
  f.edge('a10006', 0, 'a10007', 0);
}).start();
