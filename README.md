# LegalMind AI
### AI-Powered Legal Document Management & Research Assistant

An educational project inspired by enterprise applications such as SiSo Suite.

The purpose of this project is to learn how modern AI-powered applications are designed and developed, particularly applications that process large collections of documents, extract structured information, perform semantic searches, and generate intelligent responses.

This project will be developed incrementally. Each phase introduces new concepts and technologies before using them in a practical feature.

---

# 1. Project Goals

Build an application that helps lawyers manage legal cases and documents using AI.

The application should eventually support:

- Client and case management.
- PDF and DOCX document uploads.
- Automatic document text extraction.
- AI-powered document summarization.
- Semantic document search.
- Ask Your Documents chatbot.
- Retrieval-Augmented Generation (RAG).
- Legal information extraction.
- Potential risk identification.
- AI-powered report generation.

### Primary learning objectives

By completing this project, I should understand:

1. How LLMs work at an application-integration level.
2. How to integrate OpenAI into an application.
3. How documents are processed before reaching an LLM.
4. How text chunking works.
5. How embeddings work.
6. How vector databases work.
7. How RAG works internally.
8. How LangChain simplifies AI development.
9. How structured outputs work.
10. How AI agents and tool calling work.
11. How to evaluate AI-generated responses.

**Important:** This is an educational project, not a production-ready legal advisory platform.

# 2. Technology Stack

Use the following technologies throughout the project.

| Component | Technology | Purpose |
|---|---|---|
| Frontend | React + TypeScript | User interface |
| UI Library | Material UI | UI components |
| Main Backend | Express.js + TypeScript | Business logic and REST APIs |
| AI Backend | Python + FastAPI | AI processing service |
| Main Database | PostgreSQL | Application data |
| Vector Database | PostgreSQL + pgvector | Vector storage and similarity search |
| LLM Provider | OpenAI API | Text generation and reasoning |
| Embedding Model | text-embedding-3-small | Generate embeddings |
| AI Framework | LangChain (Python) | AI application orchestration |
| Document Processing | PyMuPDF | PDF text extraction |
| DOCX Processing | python-docx | Word document processing |
| OCR | Tesseract | Scanned document processing |
| Background Jobs | BullMQ + Redis | Asynchronous processing |
| AI Service Jobs | Python background tasks when needed | Long-running AI operations |
| Report Generation | docx | Generate Word reports |
| AI Evaluation | RAGAS | Evaluate RAG performance |
| Version Control | Git | Source control |

## Technology selection rules

1. Use PostgreSQL with pgvector instead of introducing Pinecone or another vector database.
2. Use OpenAI API initially.
3. Use Python for the AI service and LangChain.
4. Keep Express.js responsible for business logic and application APIs.
5. Keep AI processing inside the Python service.
6. Use LangChain Python, not LangChain.js, for this project.
7. Do not introduce additional databases without discussing the reasons.
8. Do not introduce unnecessary microservices.
9. Do not replace selected technologies without explaining the alternatives and trade-offs.

### Why use two backends?

Express.js and Python have different responsibilities.

**Express.js:**
- Client management.
- Case management.
- Document metadata.
- Application database operations.
- Frontend-facing REST APIs.
- Business logic.
- Background jobs for application workflows.

**Python + FastAPI:**
- Document processing.
- Embedding generation.
- Vector search orchestration.
- LangChain pipelines.
- RAG.
- AI extraction.
- AI evaluation.

React communicates with Express.js. Express.js communicates with the Python AI service when AI processing is required.

# 3. Application Modules

## Module 1: Client Management

- Create clients.
- Edit client information.
- View client details.
- Associate legal cases with clients.

## Module 2: Case Management

- Create legal cases.
- Add case descriptions.
- Associate cases with clients.
- View associated documents.
- View extracted information.
- View AI-generated findings.

Example:

Client: ABC Corporation

Case: Company Acquisition

Description: Legal due diligence for the acquisition of ABC Corporation.

## Module 3: Document Management

Supported formats:
- PDF
- DOCX
- TXT

Features:
- Upload documents.
- Associate documents with cases.
- Track document processing status.
- Extract text.
- Preserve page numbers.
- View extracted text.
- Generate summaries.

## Module 4: AI Document Summarization

Generate summaries using an LLM.

Example:

Input: Shareholder Agreement.pdf

Output:
- Document type.
- Parties involved.
- Important dates.
- Shareholding arrangements.
- Voting rights.
- Important clauses.
- Potential concerns.

## Module 5: Ask Your Documents

Allow lawyers to ask questions about uploaded documents.

Example questions:

- Who are the shareholders?
- What is the company's registration number?
- Are there any termination clauses?
- Identify potential litigation risks.
- Summarize the financial obligations.
- What are the important dates?

The application should retrieve relevant document content and generate answers with document and page references.

If information is unavailable, the AI must communicate that clearly rather than inventing an answer.

## Module 6: Structured Information Extraction

Extract information into structured JSON.

Example:

```json
{
  "document_type": "Shareholder Agreement",
  "parties": ["Company A", "Company B"],
  "effective_date": "2026-01-01",
  "expiration_date": "2028-01-01",
  "key_clauses": [
    "Share transfer",
    "Voting rights",
    "Termination"
  ],
  "potential_risks": [
    {
      "description": "Share transfer restrictions",
      "risk_level": "high"
    }
  ]
}
```

Validate the output before storing it in PostgreSQL.

## Module 7: AI Report Generation

Generate:
- Document Summary Reports.
- Legal Due Diligence Reports.
- Risk Assessment Reports.
- Executive Summaries.

Use structured AI output and application-controlled DOCX templates.

# 4. Development Roadmap

The project must be developed in the following phases.

**Important development rule:** Complete one phase and understand its concepts before moving to the next phase. Do not build the entire application in one attempt.

---

# Phase 0: Environment and Architecture

### Goal

Understand the architecture and prepare the development environment.

### Learn

- React architecture.
- Express.js architecture.
- Python fundamentals for AI development.
- FastAPI fundamentals.
- REST API communication.
- PostgreSQL.
- Docker basics (optional).

### Tasks

- Create the project repository.
- Initialize the React frontend.
- Initialize the Express.js backend.
- Initialize the Python FastAPI service.
- Configure PostgreSQL.
- Configure environment variables.
- Establish communication between Express.js and FastAPI.
- Create initial architecture documentation.

### Expected architecture

```text
                 React Frontend
                       |
                       v
                 Express Backend
                       |
             +---------+---------+
             |                   |
             v                   v
         PostgreSQL         Python FastAPI
                                 |
                                 v
                            AI Services
```

### Acceptance criteria

- React application runs.
- Express.js application runs.
- FastAPI application runs.
- PostgreSQL connection works.
- Express.js can communicate with FastAPI.

---

# Phase 1: Traditional Application Development

### Goal

Build the basic application without AI.

### Learn

- Express.js REST APIs.
- React Query.
- PostgreSQL relationships.
- Database migrations.
- File uploads.
- API validation.
- CRUD operations.

### Tasks

1. Create clients.
2. Create legal cases.
3. Associate cases with clients.
4. Upload documents.
5. Store document metadata.
6. Display uploaded documents.
7. Associate documents with cases.

### Acceptance criteria

- Create and update clients.
- Create and update cases.
- Upload PDF and DOCX files.
- View documents associated with each case.

**Learning outcome:** Understand how a traditional enterprise application works before adding AI.

---

# Phase 2: LLM Fundamentals and OpenAI Integration

### Goal

Understand how an application communicates with an LLM.

Do not use LangChain yet.

Start with the OpenAI API directly.

### Learn

1. What is an LLM?
2. Tokens and tokenization.
3. Context windows.
4. System prompts.
5. User prompts.
6. Prompt engineering.
7. Temperature and model parameters.
8. API requests and responses.
9. Streaming responses.
10. Token usage and API costs.

### Tasks

1. Create an OpenAI API account.
2. Configure the API key securely.
3. Create a basic Python AI service.
4. Send text to OpenAI.
5. Receive generated responses.
6. Implement document summarization.
7. Handle API errors.
8. Track token usage.

### Practical exercise

Send a legal document's extracted text to OpenAI and request a summary.

### Acceptance criteria

- Express.js can request a summary through FastAPI.
- FastAPI can communicate with OpenAI.
- The generated summary appears in React.
- Token usage is recorded.

**Learning outcome:** Understand the LLM request-response cycle without relying on an AI framework.

---

# Phase 3: Document Processing and OCR

### Goal

Understand how documents are converted into machine-readable text.

### Learn

- Document ingestion.
- PDF parsing.
- DOCX parsing.
- OCR.
- Digital PDF vs scanned PDF.
- Page-level extraction.
- Document metadata.
- Background processing.

### Technologies

- PyMuPDF.
- python-docx.
- Tesseract OCR.

### Tasks

1. Extract text from PDF files.
2. Extract text from DOCX files.
3. Preserve page numbers.
4. Detect scanned PDFs.
5. Process scanned documents using OCR.
6. Store extracted text.
7. Implement document processing status.

### Acceptance criteria

- Extract text from digital PDFs.
- Extract text from DOCX.
- Process scanned PDFs.
- Preserve document page references.

**Learning outcome:** Understand how documents become usable input for AI systems.

---

# Phase 4: Text Chunking

### Goal

Understand how large documents are divided into smaller pieces.

Do not use LangChain text splitters yet.

Implement a basic chunking algorithm manually.

### Learn

- What is a token?
- Why chunking is necessary.
- Fixed-size chunking.
- Chunk overlap.
- Semantic chunking.
- Token-based chunking.
- Metadata preservation.
- Page and section references.

### Tasks

1. Take extracted document text.
2. Divide the text into chunks.
3. Configure chunk size.
4. Configure chunk overlap.
5. Preserve page numbers.
6. Store chunks in PostgreSQL.
7. Experiment with different chunk sizes.

### Acceptance criteria

- Large documents are divided into chunks.
- Chunks preserve their original document references.
- Page numbers remain available.
- Different chunking strategies can be compared.

**Learning outcome:** Understand why chunking affects retrieval quality.

---

# Phase 5: Embeddings and Vector Databases

### Goal

Understand how semantic search works.

### Learn

- What are embeddings?
- How embedding models work.
- Vector dimensions.
- Cosine similarity.
- Euclidean distance.
- Similarity search.
- Vector indexing.
- Metadata filtering.
- Hybrid search.

### Technologies

- OpenAI text-embedding-3-small.
- PostgreSQL.
- pgvector.

### Tasks

1. Generate embeddings for document chunks.
2. Understand the returned vector.
3. Enable pgvector.
4. Create vector columns.
5. Store embeddings.
6. Generate question embeddings.
7. Perform similarity searches.
8. Retrieve the most relevant chunks.
9. Experiment with different similarity thresholds.

### Example

Document text:

"The company is currently involved in three court proceedings."

User question:

"Does the company have any ongoing lawsuits?"

The system should identify the semantic relationship between the question and the document.

### Acceptance criteria

- Embeddings are generated.
- Embeddings are stored in pgvector.
- Questions can be converted into embeddings.
- Similar document chunks can be retrieved.

**Learning outcome:** Understand vector search before using RAG frameworks.

---

# Phase 6: Manual RAG Implementation

### Goal

Build a complete RAG pipeline without LangChain.

This is one of the most important phases.

### Learn

- Retrieval-Augmented Generation.
- Query embedding.
- Vector retrieval.
- Context construction.
- Prompt templates.
- Context windows.
- Similarity thresholds.
- Source citations.
- Retrieval quality.

### Tasks

1. Accept a user question.
2. Generate a question embedding.
3. Search pgvector.
4. Retrieve relevant chunks.
5. Build an LLM prompt.
6. Send the prompt and context to OpenAI.
7. Generate an answer.
8. Return document references.
9. Return page references.
10. Handle insufficient context.

### Expected workflow

```text
User Question
     |
     v
Question Embedding
     |
     v
Vector Search
     |
     v
Relevant Document Chunks
     |
     v
Context Construction
     |
     v
OpenAI API
     |
     v
Generated Answer
     |
     v
Document Citations
```

### Acceptance criteria

- Users can ask questions about uploaded documents.
- Relevant chunks are retrieved.
- Answers use retrieved information.
- Citations identify the source document and page.
- The application can respond when information is unavailable.

**Learning outcome:** Understand RAG internally before using LangChain.

---

# Phase 7: LangChain Fundamentals

### Goal

Learn LangChain and understand how it simplifies AI application development.

Use Python LangChain.

At this point, the manual RAG implementation should already be working.

### Learn

1. What is LangChain?
2. What problems does it solve?
3. Chat models.
4. Prompt templates.
5. Output parsers.
6. Document loaders.
7. Text splitters.
8. Embeddings integrations.
9. Vector stores.
10. Retrievers.
11. Chains and runnable composition.
12. Tool calling.
13. LangChain tracing and debugging.

### Technologies

- LangChain Python.
- langchain-openai.
- langchain-community where needed.
- PostgreSQL + pgvector.
- OpenAI API.

Use the current official LangChain integrations rather than outdated tutorials.

### Tasks

1. Connect LangChain to OpenAI.
2. Implement a prompt template.
3. Use LangChain document loaders.
4. Experiment with LangChain text splitters.
5. Generate embeddings through LangChain.
6. Connect LangChain to pgvector.
7. Implement a retriever.
8. Rebuild the manual RAG pipeline using LangChain.
9. Compare both implementations.

### Comparison exercise

Implement the same question-answering functionality in two ways.

**Implementation A:**
- Direct OpenAI API calls.
- Manual chunking.
- Manual embedding generation.
- SQL vector search.
- Manual context construction.

**Implementation B:**
- LangChain document loaders.
- LangChain text splitters.
- LangChain embeddings.
- LangChain vector store integration.
- LangChain retriever.
- LangChain prompt templates.

Compare:

- Lines of code.
- Flexibility.
- Debugging.
- Maintainability.
- Performance.
- Control over retrieval.

### Acceptance criteria

- LangChain communicates with OpenAI.
- LangChain connects to pgvector.
- The LangChain RAG implementation works.
- Both implementations produce comparable results.

**Learning outcome:** Understand what LangChain abstracts and when using it makes sense.

---

# Phase 8: Advanced RAG

### Goal

Improve the quality of document retrieval and generated answers.

### Learn

- Hybrid search.
- Keyword search.
- Semantic search.
- Reranking.
- Query rewriting.
- Multi-query retrieval.
- Metadata filtering.
- Parent-child retrieval.
- Context compression.
- Retrieval evaluation.

### Tasks

1. Implement hybrid search.
2. Experiment with different retrieval strategies.
3. Introduce reranking.
4. Experiment with query rewriting.
5. Compare retrieval quality.
6. Improve citation accuracy.

### Acceptance criteria

- Search results improve over basic vector search.
- Relevant chunks are ranked effectively.
- Answers contain useful source references.

**Learning outcome:** Understand how production RAG systems improve retrieval quality.

---

# Phase 9: Structured Outputs and Information Extraction

### Goal

Convert unstructured legal documents into structured data.

### Learn

- JSON Schema.
- OpenAI Structured Outputs.
- LangChain structured output capabilities.
- Pydantic.
- Data validation.
- Entity extraction.
- Clause extraction.
- Classification.

### Tasks

Extract:

- Contract name.
- Parties.
- Effective date.
- Expiration date.
- Contract value.
- Termination clauses.
- Change of control provisions.
- Potential risks.

Use Pydantic models to validate the generated information.

### Acceptance criteria

- The AI generates structured JSON.
- The backend validates the output.
- Extracted information is stored in PostgreSQL.
- Invalid outputs are handled properly.

**Learning outcome:** Understand how LLMs interact with structured business data.

---

# Phase 10: Function Calling and AI Agents

### Goal

Understand how AI can interact with application functionality.

### Learn

- Function calling.
- Tool calling.
- LangChain tools.
- Tool execution.
- Agent concepts.
- Multi-step workflows.
- Agent stopping conditions.

### Practical example

User asks:

"Generate a summary of all high-risk findings in this case."

The AI can request tools to:

1. Retrieve case findings.
2. Filter high-risk records.
3. Retrieve related documents.
4. Summarize the findings.
5. Generate a report.

The backend executes the requested operations and returns their results to the LLM.

### Tasks

- Create a database search tool.
- Create a case findings retrieval tool.
- Create a document search tool.
- Connect tools to LangChain.
- Implement a controlled multi-step workflow.
- Track tool execution and failures.

### Acceptance criteria

- The AI can request available tools.
- The backend executes the requested operations.
- Results are returned to the LLM.
- Multi-step workflows produce useful results.

**Learning outcome:** Understand the difference between ordinary LLM calls, function calling and agents.

---

# Phase 11: AI Report Generation

### Goal

Generate structured legal reports.

### Learn

- AI-generated content.
- Structured report data.
- Document templates.
- DOCX generation.
- Data aggregation.
- Report formatting.

### Tasks

1. Retrieve case information.
2. Retrieve structured findings.
3. Generate executive summaries.
4. Create report templates.
5. Populate DOCX files.
6. Add source references.
7. Allow report downloads.

### Technologies

- Express.js.
- docx.
- OpenAI.
- LangChain where useful.

### Acceptance criteria

- A lawyer can generate a report for a case.
- The report contains structured findings.
- The report can be downloaded as DOCX.
- Source information is preserved.

---

# Phase 12: AI Evaluation and Testing

### Goal

Measure the quality and reliability of the AI system.

### Learn

- Hallucination.
- Retrieval precision.
- Retrieval recall.
- Context relevance.
- Answer faithfulness.
- Citation correctness.
- LLM evaluation.
- Token and cost monitoring.

### Technologies

- RAGAS.
- Pytest.
- Custom evaluation datasets.

### Tasks

1. Create a set of legal documents.
2. Prepare questions with known answers.
3. Create expected source references.
4. Evaluate retrieval results.
5. Evaluate generated answers.
6. Test citation correctness.
7. Identify hallucinations.
8. Compare manual RAG with LangChain RAG.
9. Track API costs.

### Acceptance criteria

- The application has a repeatable evaluation dataset.
- Retrieval quality can be measured.
- Answer quality can be evaluated.
- Incorrect answers and citations can be identified.

**Learning outcome:** Understand how to test AI systems beyond ordinary software unit testing.

---

# 5. Recommended Project Architecture

The target architecture is:

```text
                   React Frontend
                         |
                         v
                   Express Backend
                         |
              +----------+----------+
              |                     |
              v                     v
          PostgreSQL           Python FastAPI
              |                     |
              |                     v
              |                LangChain
              |                     |
              |          +----------+----------+
              |          |                     |
              v          v                     v
          pgvector    OpenAI API        Document Processing
                         |
                         v
                    AI Responses
                         |
                         v
                    Express Backend
                         |
                         v
                    React Frontend
```

The document processing workflow:

```text
PDF / DOCX Upload
       |
       v
Express File Storage
       |
       v
Python Processing Service
       |
       v
Text Extraction / OCR
       |
       v
Text Chunking
       |
       v
Embedding Generation
       |
       v
PostgreSQL + pgvector
```

The question-answering workflow:

```text
User Question
       |
       v
React Frontend
       |
       v
Express API
       |
       v
Python FastAPI
       |
       v
LangChain Retriever
       |
       v
PostgreSQL + pgvector
       |
       v
Relevant Document Chunks
       |
       v
LangChain Prompt
       |
       v
OpenAI LLM
       |
       v
Answer + Source References
       |
       v
React Frontend
```

This is the planned architecture, not a claim about SiSo's actual internal implementation.

# 6. Suggested Database Structure

Start with these tables:

| Table | Purpose |
|---|---|
| clients | Client information |
| cases | Legal case information |
| documents | Uploaded document metadata |
| document_pages | Extracted page information |
| document_chunks | Text chunks and embeddings |
| conversations | AI conversation sessions |
| messages | User questions and AI responses |
| extracted_entities | Structured extracted information |
| case_findings | Potential risks and findings |
| generated_reports | Generated report metadata |

Use PostgreSQL with the pgvector extension.

Initially, use the OpenAI `text-embedding-3-small` model with its default 1536-dimensional embeddings.

Keep document content and its metadata connected so that the application can identify the original source and page number of every retrieved chunk.

# 7. Project Directory Structure

Use a monorepo:

```text
legalmind-ai/
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── hooks/
│       └── types/
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── jobs/
│   │   ├── middleware/
│   │   └── server.ts
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── package.json
│   └── tsconfig.json
│
├── ai-service/
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── document_processing/
│   │   ├── embeddings/
│   │   ├── vector_store/
│   │   ├── rag/
│   │   ├── chains/
│   │   ├── agents/
│   │   └── evaluation/
│   │
│   ├── tests/
│   ├── requirements.txt
│   └── main.py
│
├── docs/
│   ├── architecture.md
│   ├── learning-notes.md
│   ├── ai-concepts.md
│   └── decisions.md
│
├── README.md
└── .gitignore
```

The directory structure can evolve as the project grows.

# 8. Instructions for Cursor AI

This is an educational project. My priority is learning the underlying engineering concepts, not simply generating working code.

Follow these rules throughout development.

## Teaching Rules

1. Explain every important concept before implementation.
2. Explain why a technology is needed.
3. Explain alternative technologies and their trade-offs.
4. Explain the data flow.
5. Use practical examples.
6. Explain what happens internally.
7. Avoid unnecessary abstractions.
8. Never assume I understand an AI concept simply because a library implements it.

## Implementation Rules

Before implementing each task:

1. Explain the objective.
2. Explain the concepts I need to understand.
3. Explain the architecture.
4. Identify the files that need changes.
5. Explain the implementation steps.
6. Identify potential challenges.
7. Wait for my approval before making substantial changes.

After implementation:

1. Explain what was implemented.
2. Explain how it works internally.
3. Show how to test it.
4. Explain potential problems.
5. Provide a practical exercise.
6. Suggest the next task.

## LangChain-Specific Rules

1. Explain the underlying concept before using a LangChain component.
2. Explain what the LangChain component does internally.
3. Identify which manual operations it replaces.
4. Explain the input and output of each component.
5. Do not use deprecated LangChain APIs.
6. Follow current official documentation.
7. Prefer modular and understandable pipelines.
8. Do not use agents when a simple deterministic chain is sufficient.

## AI Engineering Rules

Whenever implementing an AI feature, explain:

- What information is sent to the LLM?
- What prompt is constructed?
- What does the LLM return?
- How is the response validated?
- Are embeddings involved?
- Is vector search involved?
- How does LangChain participate?
- How is the result stored?
- How does the result reach React?
- What can go wrong?

## Coding Rules

- Write maintainable code.
- Use clear naming conventions.
- Follow Express.js and Python best practices.
- Use Pydantic for Python data validation.
- Write appropriate unit and integration tests.
- Handle API errors.
- Keep API keys in environment variables.
- Avoid unnecessary dependencies.
- Document important architectural decisions.

# 9. Learning Resources

Use official documentation whenever possible.

| Topic | Documentation |
|---|---|
| OpenAI API | https://platform.openai.com/docs/ |
| OpenAI Embeddings | https://platform.openai.com/docs/guides/embeddings |
| LangChain Python | https://docs.langchain.com/oss/python/langchain/overview |
| LangChain Retrieval | https://docs.langchain.com/oss/python/langchain/retrieval |
| LangChain Integrations | https://docs.langchain.com/oss/python/integrations/providers/ |
| FastAPI | https://fastapi.tiangolo.com/ |
| PostgreSQL | https://www.postgresql.org/docs/ |
| pgvector | https://github.com/pgvector/pgvector |
| Express.js | https://expressjs.com/ |
| BullMQ | https://docs.bullmq.io/ |
| docx | https://docx.js.org/ |
| React | https://react.dev/ |
| PyMuPDF | https://pymupdf.readthedocs.io/ |
| Tesseract | https://github.com/tesseract-ocr/tesseract |
| RAGAS | https://docs.ragas.io/ |

# 10. Sample Documents

Use publicly available documents for experimentation.

Suggested sources:

- Bangladesh Laws: http://bdlaws.minlaw.gov.bd/
- Supreme Court of Bangladesh: https://www.supremecourt.gov.bd/
- WorldLII: https://www.worldlii.org/

Start with publicly available judgments, legislation and sample legal agreements.

Do not use confidential client documents.

# 11. Definition of Success

At the end of the project, I should be able to:

- Build a full-stack application using React and Express.js.
- Build an AI service using Python and FastAPI.
- Integrate OpenAI APIs.
- Extract text from PDF and DOCX files.
- Process scanned documents using OCR.
- Implement chunking manually.
- Generate and store embeddings.
- Use PostgreSQL with pgvector.
- Implement vector similarity search.
- Build RAG manually.
- Rebuild RAG using LangChain.
- Understand LangChain components and abstractions.
- Implement advanced retrieval strategies.
- Generate structured JSON from legal documents.
- Implement tool calling and AI agents.
- Generate AI-powered legal reports.
- Evaluate RAG quality and AI-generated answers.

**Ultimate objective:** Understand how enterprise applications like SiSo Suite implement AI capabilities internally and develop the ability to design similar systems independently.

---

# 12. First Instruction to Cursor

Read the complete README.md.

I want to build LegalMind AI as an educational project.

Before writing any code:

1. Analyze the complete project requirements.
2. Explain the proposed architecture.
3. Explain the responsibilities of React, Express.js, PostgreSQL and Python FastAPI.
4. Explain why we are using LangChain Python.
5. Explain how Express.js and Python will communicate.
6. Identify development prerequisites.
7. Propose the initial folder structure.
8. Identify architectural decisions that need to be made.
9. Break Phase 0 into small implementation tasks.

Do not generate application code yet.

I want to understand the architecture and reasoning behind every important technology choice.

Follow the development and teaching instructions in this README throughout the project.