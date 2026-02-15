# Smart Document Generation Agent — Backend

Python + FastAPI server that powers the document generation agent using the Anthropic SDK, python-docx, and reportlab.

## Setup

```bash
python -m venv venv
venv\Scripts\activate      # Windows
source venv/bin/activate   # macOS / Linux

pip install -r requirements.txt
cp .env.example .env
# Add ANTHROPIC_API_KEY to .env
python main.py
```

Server starts at `http://localhost:8000`. Auto-reloads on code changes.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/generate` | Stream SSE events for document generation pipeline |
| `GET`  | `/api/documents` | List all generated documents |
| `GET`  | `/api/documents/{id}/download` | Download generated PDF |
| `GET`  | `/api/templates` | List available templates |
| `POST` | `/api/templates/upload` | Upload .docx or .xlsx template |
| `GET`  | `/api/signatures` | List e-signature records |
| `GET`  | `/health` | Health check |

## SSE Event Format

```json
data: {"type": "tool_start",  "tool_name": "fetch_client_data", "tool_input": {...}}
data: {"type": "tool_result", "tool_name": "fetch_client_data", "result": {...}}
data: {"type": "tool_start",  "tool_name": "fill_template",     "tool_input": {...}}
data: {"type": "tool_result", "tool_name": "fill_template",     "result": {...}}
...
data: {"type": "text_delta",  "text": "Document generated..."}
data: {"type": "done"}
```

## Agent Tools

- **fetch_client_data** — Mock CRM lookup by client name
- **fill_template** — Generates a real `.docx` file using python-docx
- **convert_to_pdf** — Converts to PDF using reportlab
- **upload_to_storage** — Simulates Google Drive / S3 upload (returns mock URL)
- **send_email** — Simulates email delivery (returns confirmation ID)
- **request_signature** — Simulates DocuSign request (returns tracking ID)

## Environment Variables

```
ANTHROPIC_API_KEY=sk-ant-...   # Required
PORT=8000                       # Optional
OUTPUT_DIR=outputs              # Where PDFs are written
UPLOAD_DIR=uploads              # Where template uploads are saved
```
