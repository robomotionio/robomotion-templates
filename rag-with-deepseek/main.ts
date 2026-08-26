import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

// RAG with DeepSeek — retrieval-augmented generation over your own documents, with the
// retrieval handed to the agent instead of done for it.
//
// Drop policy documents into ~/Knowledge/docs and run. On the first run the flow reads
// every document, splits it into chunks, embeds them and writes them to a LanceDB table
// on disk. On every run after that the table is already there and the flow goes straight
// to the question.
//
// The part worth studying is the tool. The agent is not handed a block of retrieved text
// and asked to summarise it — it is handed a *search tool* and left to decide what to
// look for. A question that spans several documents becomes several searches, each one
// phrased by the agent, and the answer is assembled from all of them with the source
// document named against every fact.
//
// Agent ports: 0 = tools, 1 = callbacks, 2 = response. The response leaves on an explicit
// edge from port 2 — never chain .then() off the agent.
flow.create('7d3e1a94-2c6b-4f08-9a51-8be4d7c02f13', 'RAG with DeepSeek', (f) => {
  f.addDependency('Robomotion.LanceDB', '0.1.0');
  f.addDependency('Robomotion.DeepSeekAgent', '0.7.5');
  f.addDependency('Robomotion.DocumentProcessor', '1.0.16');
  f.addDependency('Robomotion.OpenAI', '3.3.2');

  f.node('c10001', 'Core.Flow.Comment', 'Comment', { optText: '#### RAG with DeepSeek\nPut your documents in `~/Knowledge/docs` and run. The first run turns them into a searchable knowledge base in **LanceDB** — an embedded vector database that is just a directory on disk, with no server to run. Every run after that answers straight away.\n\nThe agent is given a **search tool**, not a pile of retrieved text. It writes its own queries, searches as many times as the question needs, and names the document behind every fact.' });

  f.node('c10002', 'Core.Flow.Comment', 'Setup Guide', { optText: '#### 🚀 Setup Guide\n\n1. `mkdir -p ~/Knowledge/docs` and copy your PDFs, Word files, Markdown or text files into it.\n2. Put an OpenRouter API key into a Vault item (type: API Key), then select it in the **Policy Agent** node API Key property. The default Base URL and model already match OpenRouter.\n3. Embeddings need no key of their own — **Embed Chunks** and **Embed Query** are set to *Use Robomotion AI Credits*. Switch them to your own OpenAI key if you would rather pay OpenAI directly.\n4. Edit the question in **Ask a Question** and run the flow on a robot.\n5. Watch the agent work in the Dev Console **Agents** tab: one question, several searches, one answer.\n\nRe-running never re-reads the documents. Delete `~/Knowledge/lancedb` to rebuild from scratch.' });

  // ---- setup -----------------------------------------------------------
  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Programming.Function', 'Prepare Paths', {
      func:
        "var home = global.get('$Home$');\n" +
        "msg.docs_dir = home + '/Knowledge/docs';\n" +
        "msg.db_uri = home + '/Knowledge/lancedb';\n" +
        "msg.table = 'policies';\n" +
        'return msg;',
    })
    .then('a10003', 'Core.FileSystem.Create', 'Create Docs Folder', {
      inPath: Message('docs_dir'),
      outPath: Message('docs_dir_created'),
      optType: 'directory',
      continueOnError: true,
    })
    .then('a10004', 'Robomotion.LanceDB.Tables.List', 'List Tables', {
      optUri: Message('db_uri'),
    })
    .then('a10005', 'Core.Programming.Function', 'Knowledge Base Built?', {
      outputs: 2,
      func:
        'var tables = msg.tables || [];\n' +
        'var found = false;\n' +
        'for (var i = 0; i < tables.length; i++) {\n' +
        '  if (tables[i] === msg.table) { found = true; }\n' +
        '}\n' +
        '// Port 0 builds it, port 1 skips straight to the question.\n' +
        'if (found) { return [null, msg]; }\n' +
        'return [msg, null];',
    });

  // Already built — go and ask.
  f.node('a10006', 'Core.Flow.GoTo', 'Skip To Question', {
    optNodes: { ids: ['d30001'], type: 'goto', all: false },
  });
  f.edge('a10005', 1, 'a10006', 0);

  // ---- ingest ----------------------------------------------------------
  // Chunks from every document are collected first and embedded in one batch call,
  // which is both fewer round trips and the shape LanceDB wants to create a table from.
  f.node('b20001', 'Core.Programming.Function', 'Start Collecting', {
    func:
      'msg.pending = [];\n' +
      'msg.doc_count = 0;\n' +
      'return msg;',
  })
    .then('b20002', 'Core.FileSystem.List', 'List Documents', {
      inDirPath: Message('docs_dir'),
      inNameFilter: Custom('\\.(pdf|docx|pptx|md|txt|html)$'),
      outFiles: Message('doc_files'),
      optAbsolutePath: true,
      optTop: 500,
    })
    // A Label has no input port — the only way into the loop is a jump.
    .then('b20015', 'Core.Flow.GoTo', 'Enter Document Loop', {
      optNodes: { ids: ['b20003'], type: 'goto', all: false },
    });
  f.edge('a10005', 0, 'b20001', 0);

  f.node('b20003', 'Core.Flow.Label', 'Next Document', {})
    .then('b20004', 'Core.Programming.ForEach', 'For Each Document', {
      optInput: Message('doc_files'),
      optOutput: Message('doc_entry'),
    })
    .then('b20005', 'Core.Programming.Function', 'Document Path', {
      func:
        'var e = msg.doc_entry;\n' +
        "var p = '';\n" +
        "if (typeof e === 'string') { p = e; }\n" +
        'else if (e) { p = e.AbsolutePath || e.absolute_path || e.Name || e.name || \'\'; }\n' +
        'msg.filePath = p;\n' +
        "var parts = p.split('/');\n" +
        'msg.source = parts[parts.length - 1];\n' +
        'return msg;',
    })
    // Deliberately NOT continueOnError. An earlier version of this template swallowed
    // parse failures here; when Read Document then failed on every single document, the
    // run still reported success — having indexed nothing at all. A knowledge base that
    // is quietly empty is worse than a run that stops, because every answer built on it
    // afterwards is confidently wrong.
    .then('b20006', 'Robomotion.DocumentProcessor.ReadDocument', 'Read Document', {
      inFilePath: Message('filePath'),
    })
    .then('b20007', 'Robomotion.DocumentProcessor.ChunkText', 'Chunk Text', {
      inText: Message('text'),
      // Small chunks retrieve precisely. A 900-character chunk covers so much ground
      // that one search drags back half an answer and hides what it missed; at 500 a
      // search either finds the clause or visibly does not.
      optMaxCharacters: Custom('500'),
      optOverlap: Custom('100'),
    })
    .then('b20008', 'Core.Programming.Function', 'Collect Chunks', {
      func:
        'var chunks = msg.chunks || [];\n' +
        'var pending = msg.pending || [];\n' +
        'for (var i = 0; i < chunks.length; i++) {\n' +
        '  var c = chunks[i];\n' +
        "  var body = typeof c === 'string' ? c : (c && (c.text || c.content)) || '';\n" +
        '  body = body.replace(/\\s+/g, \' \');\n' +
        '  if (body.length < 40) { continue; }\n' +
        '  pending.push({\n' +
        "    id: msg.source + '#' + i,\n" +
        '    source: msg.source,\n' +
        '    chunk: i,\n' +
        '    text: body\n' +
        '  });\n' +
        '}\n' +
        'msg.pending = pending;\n' +
        'msg.doc_count = (msg.doc_count || 0) + 1;\n' +
        'msg.chunk_total = pending.length;\n' +
        'delete msg.chunks;\n' +
        'delete msg.text;\n' +
        'delete msg.elements;\n' +
        'return msg;',
    })
    .then('b20009', 'Core.Flow.GoTo', 'Continue Documents', {
      optNodes: { ids: ['b20003'], type: 'goto', all: false },
    });

  f.node('b2000d', 'Core.Programming.Debug', 'Show Chunk Total', {
    optDebugData: Message('chunk_total'),
  });
  f.edge('b20008', 0, 'b2000d', 0);

  // Every document read — port 1 of the ForEach.
  f.node('b2000a', 'Core.Programming.Function', 'Anything To Embed?', {
    outputs: 2,
    func:
      'var pending = msg.pending || [];\n' +
      'msg.chunk_total = pending.length;\n' +
      'if (pending.length === 0) {\n' +
      '  // Two very different situations, and saying which one it is saves an hour:\n' +
      '  // an empty folder, or documents that were read but yielded nothing.\n' +
      '  if ((msg.doc_count || 0) === 0) {\n' +
      "    msg.summary = 'No documents found in ' + msg.docs_dir + ' - nothing to index.';\n" +
      '  } else {\n' +
      "    msg.summary = 'Read ' + msg.doc_count + ' document(s) from ' + msg.docs_dir +\n" +
      "      ' but extracted no text from any of them. Check that the files are readable.';\n" +
      '  }\n' +
      '  return [null, msg];\n' +
      '}\n' +
      'var texts = [];\n' +
      'for (var i = 0; i < pending.length; i++) { texts.push(pending[i].text); }\n' +
      'msg.texts = texts;\n' +
      'return [msg, null];',
  });
  f.edge('b20004', 1, 'b2000a', 0);

  f.node('b2000b', 'Core.Flow.Log', 'Log Nothing Found', { inText: Message('summary') });
  f.node('b2000c', 'Core.Flow.Stop', 'Nothing To Index', {});
  f.edge('b2000a', 1, 'b2000b', 0);
  f.edge('b2000a', 1, 'b2000c', 0);

  // One batch call for the whole corpus. Robomotion AI Credits means no OpenAI key.
  f.edge('b2000a', 0, 'b2000e', 0);

  f.node('b2000e', 'Robomotion.OpenAI.Embeddings.GenerateBatchEmbeddings', 'Embed Chunks', {
    inTexts: Message('texts'),
    outEmbeddings: Message('embeddings'),
    optUseRobomotionCredits: true,
  })
    .then('b2000f', 'Core.Programming.Function', 'Build Rows', {
      func:
        'var pending = msg.pending || [];\n' +
        'var vectors = msg.embeddings || [];\n' +
        'var rows = [];\n' +
        'for (var i = 0; i < pending.length; i++) {\n' +
        '  var v = vectors[i];\n' +
        '  if (!v || !v.length) { continue; }\n' +
        '  rows.push({\n' +
        '    id: pending[i].id,\n' +
        '    source: pending[i].source,\n' +
        '    chunk: pending[i].chunk,\n' +
        '    text: pending[i].text,\n' +
        '    vector: v\n' +
        '  });\n' +
        '}\n' +
        'msg.rows = rows;\n' +
        'msg.row_count = rows.length;\n' +
        'delete msg.pending;\n' +
        'delete msg.texts;\n' +
        'delete msg.embeddings;\n' +
        'return msg;',
    })
    .then('b20010', 'Robomotion.LanceDB.Tables.Create', 'Create Knowledge Table', {
      optUri: Message('db_uri'),
      inTable: Message('table'),
      inRows: Message('rows'),
      optMode: 'overwrite',
    })
    // Keyword and hybrid search return nothing at all without this one. The vector
    // index below is optional; this is not.
    .then('b20011', 'Robomotion.LanceDB.Tables.CreateIndex', 'Index Text For Keywords', {
      optUri: Message('db_uri'),
      inTable: Message('table'),
      inColumn: Custom('text'),
      optIndexKind: 'fts',
    })
    .then('b20012', 'Core.Programming.Function', 'Enough Rows To Index Vectors?', {
      outputs: 2,
      func:
        '// IVF_PQ trains a codebook from the data and needs at least 256 rows to do it.\n' +
        '// Below that LanceDB scans the column instead, which at this size is the faster\n' +
        '// answer anyway - so a small corpus skips the index rather than failing on it.\n' +
        'if ((msg.row_count || 0) >= 256) { return [msg, null]; }\n' +
        'return [null, msg];',
    });

  f.node('b20013', 'Robomotion.LanceDB.Tables.CreateIndex', 'Index Vectors', {
    optUri: Message('db_uri'),
    inTable: Message('table'),
    inColumn: Custom('vector'),
    optIndexKind: 'vector',
    optMetric: 'cosine',
  });
  f.edge('b20012', 0, 'b20013', 0);

  f.node('b20014', 'Core.Flow.GoTo', 'To The Question', {
    optNodes: { ids: ['d30001'], type: 'goto', all: false },
  });
  f.edge('b20012', 1, 'b20014', 0);
  f.edge('b20013', 0, 'b20014', 0);

  // ---- ask -------------------------------------------------------------
  f.node('d30001', 'Core.Flow.Label', 'Ask', {})
    .then('d30002', 'Core.Programming.Function', 'Ask A Question', {
      func:
        '// Change this to ask something else. It deliberately spans several documents:\n' +
        '// one search cannot answer it, so the agent has to run several.\n' +
        "msg.query = 'I am flying to Berlin for four nights next month to meet a client, '\n" +
        "  + 'and I will take them to dinner. What are my spending limits, what do I have '\n" +
        "  + 'to do before I travel, and how long do I have to claim it all back? '\n" +
        "  + 'Search the knowledge base for each part of this separately. '\n" +
        "  + 'Name the document behind every figure you give me, and if the documents do '\n" +
        "  + 'not cover something, say so instead of filling the gap.';\n" +
        'return msg;',
    });

  // The API Key property is set from a Vault item after import — see the Setup Guide.
  f.node('d30003', 'Robomotion.DeepSeekAgent.Agent.DeepSeekAgent', 'Policy Agent', {});
  f.edge('d30002', 0, 'd30003', 0);

  // Agent output port 2 is the response.
  f.node('d30004', 'Core.Programming.Debug', 'Show Answer', {
    optDebugData: Message('response'),
  });
  f.node('d30005', 'Core.Flow.Stop', 'Stop', {});
  f.edge('d30003', 2, 'd30004', 0);
  f.edge('d30003', 2, 'd30005', 0);

  // ---- the tool: search_knowledge --------------------------------------
  // The description is the whole interface. The agent never sees these nodes — only this
  // text and the parameter schema under it — so it has to say what a good query looks
  // like and that asking several times is expected.
  f.node('e40001', 'Robomotion.DeepSeekAgent.Tool.ToolIn', 'search_knowledge', {
    inToolName: Custom('search_knowledge'),
    inToolDescription: Custom(
      'Search the company knowledge base and get back the passages that match, each ' +
        'with the document it came from. This is the only place the answer can come ' +
        'from: nothing here is in your training data, so never answer from memory. ' +
        'Search once per idea rather than once per question - a question about travel ' +
        'limits, approvals and deadlines is three searches, not one. Short topical ' +
        'phrases work far better than a whole sentence. If the passages that come back ' +
        'do not cover something, search again with different wording before concluding ' +
        'it is not written down.'
    ),
    inFunc: Custom(
      'b64:ewogICJ0eXBlIjogIm9iamVjdCIsCiAgInByb3BlcnRpZXMiOiB7CiAgICAicXVlcnkiOiB7CiAgICAgICJ0eXBlIjogInN0cmluZyIsCiAgICAgICJkZXNjcmlwdGlvbiI6ICJXaGF0IHRvIGxvb2sgZm9yLCBpbiB5b3VyIG93biB3b3Jkcy4gS2VlcCBvbmUgaWRlYSBwZXIgc2VhcmNoIGFuZCBjYWxsIHRoaXMgc2V2ZXJhbCB0aW1lcyByYXRoZXIgdGhhbiBwYWNraW5nIGEgd2hvbGUgcXVlc3Rpb24gaW50byBvbmUgcXVlcnkuIgogICAgfQogIH0sCiAgInJlcXVpcmVkIjogWwogICAgInF1ZXJ5IgogIF0KfQ=='
    ),
  })
    .then('e40002', 'Core.Programming.Function', 'Read Query', {
      func:
        'var p = msg.parameters || {};\n' +
        "msg.search_text = p.query || '';\n" +
        '// Both nodes below read from the message: the embedder from text, the search\n' +
        '// from query. The same words go to each.\n' +
        'msg.text = msg.search_text;\n' +
        'msg.query = msg.search_text;\n' +
        'return msg;',
    })
    .then('e40003', 'Robomotion.OpenAI.Embeddings.GenerateEmbedding', 'Embed Query', {
      inText: Message('text'),
      outEmbedding: Message('embedding'),
      optUseRobomotionCredits: true,
    })
    // Vector and keyword search at once, fused. The vector half catches a passage that
    // means the same thing in different words; the keyword half catches an exact term
    // like a policy number that an embedding blurs away.
    .then('e40004', 'Robomotion.LanceDB.Rows.Search', 'Search Knowledge Base', {
      optUri: Message('db_uri'),
      inTable: Message('table'),
      inVector: Message('embedding'),
      inText: Message('query'),
      optQueryType: 'hybrid',
      optLimit: 6,
      optColumns: Custom('source,text'),
    })
    .then('e40005', 'Core.Programming.Function', 'Format Passages', {
      func:
        'var hits = msg.results || [];\n' +
        'var passages = [];\n' +
        'for (var i = 0; i < hits.length; i++) {\n' +
        '  passages.push({\n' +
        "    source: hits[i].source || 'unknown',\n" +
        "    text: hits[i].text || ''\n" +
        '  });\n' +
        '}\n' +
        'msg.result = {\n' +
        '  query: msg.search_text,\n' +
        '  passages: passages,\n' +
        '  count: passages.length\n' +
        '};\n' +
        'return msg;',
    })
    .then('e40006', 'Robomotion.DeepSeekAgent.Tool.ToolOut', 'Tool Out', {});

  // The tools port (agent output port 0) discovers the Tool In.
  f.edge('d30003', 0, 'e40001', 0);
}).start();
