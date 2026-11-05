# AI concepts

No AI library is installed in Phase 0. The AI service exists so later phases have a place to put that work without mixing it into Express.

## Why LangChain is Python, and why it waits

LangChain will orchestrate document loading, retrieval, and model calls. Those steps sit next to PyMuPDF and the other Python document tools, so the project uses LangChain Python rather than LangChain.js.

It is not installed yet on purpose. Phase 2 sends text to the OpenAI API directly, so the request and the response are visible without a framework. Phase 6 builds retrieval-augmented generation by hand. Phase 7 rebuilds that pipeline with LangChain, which makes the abstraction easier to see.

## What the model will eventually see

Later phases will send document text, or retrieved chunks of that text, to a model. Phase 0 sends nothing. The health check is an ordinary HTTP call and does not contain a prompt, an embedding, or a vector search.

## Where each idea shows up

- Phase 2: a model request, a response, and token usage.
- Phase 3: turning PDF and DOCX files into text.
- Phase 4: splitting that text into chunks.
- Phase 5: embeddings and pgvector. The database image already includes pgvector. The extension is still off.
- Phase 6: manual retrieval-augmented generation.
- Phase 7: the same flow through LangChain.
- Phase 9: structured JSON from documents.
- Phase 10: tool calling.
- Phase 12: measuring answer quality.
