# RAG with DeepSeek

RAG with DeepSeek answers questions about your own documents — the ones no model was trained on. Documents in `~/Knowledge/docs` are read, split into chunks, embedded and written to a **LanceDB** table on disk. A DeepSeek Agent then answers questions against them through a `search_knowledge` tool built from ordinary flow nodes.

The part worth studying is what the agent is given. Most RAG pipelines search once with the user's question, paste the results into the prompt, and ask the model to summarise. This flow hands the agent the **search tool itself** and lets it decide what to look for. A question that spans several documents becomes several searches, each one phrased by the agent, and every fact in the answer carries the document it came from.

That difference is measurable. Against the sample corpus in `assets/docs`, a single search on the raw question returns three of the six facts the answer needs — including the €180 hotel cap, but *not* that Berlin is a tier-1 city, so it cannot tell you which cap applies. Letting the agent write its own queries returns all six.

Run on a robot, the agent issued **five, seven and nine searches across three runs** of the same question — the count is not fixed, and that is the point. Its answer named the document behind every figure, said explicitly which parts the documents *do not* cover, and caught something nobody asked it for: that claiming the client dinner under EXP-114 forfeits that day's per diem — a rule that only exists by reading the travel policy and the expense policy together.

## What RAG with DeepSeek can do

- Turn a folder of PDFs, Word files, Markdown or text into a searchable knowledge base
- Store it in LanceDB — an embedded vector database that is a directory on disk, with no server to run
- Skip the whole ingest on later runs: the table is already there
- Let the agent write its own search queries and search as many times as a question needs
- Search by meaning and by keyword at once, so an exact term like a policy number survives alongside the semantics
- Name the source document behind every fact, and say when the documents do not cover something
- Run the embedding side with no API key at all, on Robomotion AI Credits

## Behind the scenes

The flow lists the tables in the LanceDB database first. If `policies` is already there it jumps straight to the question; if not, it builds it.

The ingest loop reads each document with **Read Document**, splits it with **Chunk Text** at 500 characters with 100 of overlap, and collects the chunks with the filename kept against each one. When every document has been read, all the chunks are embedded in a **single batch call** and written to LanceDB as one table by **Create Table**, with the embedding stored in a `vector` column.

Then two indexes, and the difference between them matters. The **full-text index** on `text` is not optional: keyword and hybrid search return nothing at all without it. The **vector index** is optional, and the flow checks before building it — LanceDB's IVF_PQ index trains a codebook from the data and needs at least 256 rows to do it. Below that the flow skips it deliberately, and LanceDB scans the column instead, which at that size is the faster answer anyway. The sample corpus lands at 82 chunks as PDFs (67 as Markdown), so the index is skipped and the flow says so rather than failing.

The question goes to the agent, and the agent's `search_knowledge` tool is plain flow: **Tool In** receives the query the agent wrote, **Generate Embedding** turns it into a vector, **Search** runs a hybrid vector-plus-keyword query against LanceDB, a Function node shapes the passages with their source filenames, and **Tool Out** hands them back. The agent calls it as many times as it wants before answering. Its reply leaves on the response port.

The tool's description is the whole of what the agent knows about it. It says to search once per idea rather than once per question, that short topical phrases beat whole sentences, and that nothing in the knowledge base is in its training data — so it must not answer from memory.

## Setup Guide

1. **Put your documents in place:** `mkdir -p ~/Knowledge/docs` and copy your files in. PDF, DOCX, PPTX, Markdown, HTML and plain text are all read. To try it with the bundled corpus, copy `assets/docs/*.md` there.
2. **Configure the API key:** put an OpenRouter API key into a Vault item (type: API Key) and select it in the **Policy Agent** node's **API Key** property. The node's default Base URL and model already match OpenRouter.
3. **Embeddings need no key.** *Embed Chunks* and *Embed Query* are set to **Use Robomotion AI Credits**. If you would rather pay OpenAI directly, clear that option and select your own OpenAI key on both nodes.
4. **Edit the question** in the **Ask A Question** node.
5. **Run the flow** on a robot and watch the turn in the Dev Console's **Agents** tab — one question, several searches, one answer.

Re-running never re-reads the documents. Delete `~/Knowledge/lancedb` to rebuild the knowledge base from scratch, or add documents and delete the directory to pick them up.

## Customization

**Point it at your own documents** by changing `msg.docs_dir` in *Prepare Paths*; the database directory and table name are set in the same node.

**Tune the chunking** in *Chunk Text*. Smaller chunks retrieve more precisely and cost more calls; larger ones carry more context per hit but blur what a search actually matched. 500 with 100 of overlap is a reasonable default for policy prose.

**Change the search behaviour** in *Search Knowledge Base*: `Search Type` switches between vector, full-text and hybrid, `Limit` sets how many passages come back per call, and `Filter` takes a SQL predicate over the table's own columns — `source = 'Travel-Policy.md'` scopes a search to one document.

**Add metadata** by extending the row objects in *Build Rows* — a department, an effective date, a document version. Anything you add becomes a column you can filter on at search time, which is how you keep superseded documents out of an answer without deleting them.

**Swap the embedding model** on both embedding nodes; they must match, since a query vector is only comparable to vectors made by the same model. If you change it, delete the database so the table is rebuilt.

**Give the agent the whole database** instead of one tool by wiring the LanceDB **Toolkit** node to the agent's tools port. It exposes eleven tools — search, filtered reads, counts, inserts, indexing — with an operating contract shipped as its skill. Use it when you want the agent to explore the data rather than answer from one kind of lookup.

## Requirements

- `Robomotion.LanceDB` 0.1.0 — the embedded vector database
- `Robomotion.DeepSeekAgent` 0.7.5 — the agent, its tool ports and memory
- `Robomotion.DocumentProcessor` 1.0.14 — document reading and chunking. **1.0.13 could not read any file on Linux or macOS**; if you are pinned to it, upgrade.
- `Robomotion.OpenAI` 3.3.2 — embeddings
- An OpenRouter API key in a Vault item, for the agent
- Robomotion AI Credits for embeddings, or your own OpenAI key
