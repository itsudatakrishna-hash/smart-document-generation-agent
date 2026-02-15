# Smart Document Generation Agent

An AI-powered document generation dashboard where a Claude agent assembles and delivers documents automatically using real tool calling.

## Features

- **Generate** — Pick document type (Invoice, NDA, Proposal, Weekly Report), fill fields, hit Generate — watch the agent orchestrate the full pipeline live
- **Live Workflow Stepper** — Animated per-step progress: Fetch Data → Fill Template → Convert PDF → Upload → Send Email
- **Document Library** — Browse all generated documents with sortable columns, type badges, status, and PDF download
- **Template Manager** — Grid view of available .docx/.xlsx templates, upload your own, inspect variables
- **e-Signature Tracker** — Visual timeline (Sent → Viewed → Signed) for each document sent for signature
- **Settings** — Configure Google Drive folder, S3 bucket, email addresses, signature provider, and automation toggles

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- lucide-react icons
- Python 3.11+ + FastAPI backend with Anthropic SDK, python-docx, reportlab

## Quick Start

### Frontend

```bash
cd smart-document-generation-agent
npm install
npm run dev
# Opens at http://localhost:5174
```

### Backend (optional — frontend falls back to mock simulation without it)

```bash
cd smart-document-generation-agent/backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env and set ANTHROPIC_API_KEY=sk-ant-...
python main.py
# Runs at http://localhost:8000
```

## Architecture

```
Browser → POST /api/generate → Agent loop (Anthropic API)
                             ↓ SSE events:
   { type: "tool_start",  "tool_name": "fetch_client_data", ... }
   { type: "tool_result", "tool_name": "fetch_client_data", result: {...} }
   { type: "tool_start",  "tool_name": "fill_template", ... }
   ... (one pair per tool call)
   { type: "text_delta",  text: "Document generated and sent to..." }
   { type: "done" }
```

The UI maps each `tool_start`/`tool_result` event to the corresponding workflow step node, animating it in real time.

## Available Agent Tools

| Tool | Description |
|------|-------------|
| `fetch_client_data` | Looks up client details from mock CRM |
| `fill_template` | Creates a real .docx using python-docx |
| `convert_to_pdf` | Renders PDF using reportlab |
| `upload_to_storage` | Simulates Google Drive / S3 upload |
| `send_email` | Simulates email delivery |
| `request_signature` | Simulates DocuSign e-signature request |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/generate` | SSE stream: runs the full document pipeline |
| `GET`  | `/api/documents` | All documents in the library |
| `GET`  | `/api/documents/{id}/download` | Download a PDF |
| `GET`  | `/api/templates` | Available templates |
| `POST` | `/api/templates/upload` | Upload a new .docx/.xlsx template |
| `GET`  | `/api/signatures` | e-Signature tracking records |
| `GET`  | `/health` | Status check |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (required) |
| `PORT` | Backend port (default: 8000) |
| `OUTPUT_DIR` | Where generated PDFs are saved (default: outputs/) |
| `UPLOAD_DIR` | Where uploaded templates are stored (default: uploads/) |
| `VITE_API_URL` | Frontend override for backend URL (default: http://localhost:8000) |
