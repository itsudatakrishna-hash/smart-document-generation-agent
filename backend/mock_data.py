from datetime import datetime
import uuid

CLIENT_DATA = {
    "acme corporation": {
        "id": "CLT-001",
        "name": "Acme Corporation",
        "address": "500 Enterprise Blvd, New York, NY 10001",
        "contact": "procurement@acme.com",
        "phone": "+1 212-555-0100",
        "past_invoices": ["INV-2024-0038", "INV-2024-0031", "INV-2024-0025"],
    },
    "veritas technologies": {
        "id": "CLT-002",
        "name": "Veritas Technologies",
        "address": "200 Innovation Dr, San Francisco, CA 94105",
        "contact": "legal@veritas.tech",
        "phone": "+1 415-555-0200",
        "past_invoices": [],
    },
    "nexgen media": {
        "id": "CLT-003",
        "name": "NexGen Media",
        "address": "88 Creative Ave, Austin, TX 78701",
        "contact": "ceo@nexgenmedia.io",
        "phone": "+1 512-555-0300",
        "past_invoices": ["INV-2024-0035"],
    },
    "bright labs": {
        "id": "CLT-004",
        "name": "Bright Labs",
        "address": "12 Research Park, Boston, MA 02115",
        "contact": "projects@brightlabs.com",
        "phone": "+1 617-555-0400",
        "past_invoices": ["INV-2024-0030", "INV-2024-0022"],
    },
    "pinnacle group": {
        "id": "CLT-005",
        "name": "Pinnacle Group",
        "address": "9 Financial Sq, Chicago, IL 60601",
        "contact": "ap@pinnaclegroup.com",
        "phone": "+1 312-555-0500",
        "past_invoices": ["INV-2024-0039"],
    },
}

TEMPLATES = {
    "invoice": {
        "id": "tpl-001",
        "name": "Standard Invoice",
        "file": "templates/invoice_template.docx",
        "variables": ["client_name", "client_address", "invoice_number", "amount", "due_date", "description"],
    },
    "nda": {
        "id": "tpl-002",
        "name": "Mutual NDA",
        "file": "templates/nda_template.docx",
        "variables": ["party_a", "party_b", "effective_date", "jurisdiction"],
    },
    "proposal": {
        "id": "tpl-003",
        "name": "Project Proposal",
        "file": "templates/proposal_template.docx",
        "variables": ["client_name", "project_title", "scope", "total_amount", "delivery_date"],
    },
    "report": {
        "id": "tpl-004",
        "name": "Weekly Status Report",
        "file": "templates/report_template.docx",
        "variables": ["client_name", "week_ending", "completed_items", "next_steps"],
    },
}

# In-memory document store
documents_db: list[dict] = [
    {
        "id": "doc-001",
        "name": "Invoice #INV-2024-0042 — Acme Corp",
        "type": "invoice",
        "client": "Acme Corporation",
        "created_at": "2026-06-08 14:22",
        "status": "sent",
        "file_size": "148 KB",
        "file_path": "outputs/doc-001.pdf",
        "signature_status": "not_required",
        "drive_url": "https://drive.google.com/mock/doc-001",
        "amount": "$12,500.00",
    },
    {
        "id": "doc-002",
        "name": "NDA — Veritas Technologies",
        "type": "nda",
        "client": "Veritas Technologies",
        "created_at": "2026-06-07 09:45",
        "status": "signed",
        "file_size": "204 KB",
        "file_path": "outputs/doc-002.pdf",
        "signature_status": "signed",
        "drive_url": "https://drive.google.com/mock/doc-002",
        "amount": None,
    },
]

signatures_db: list[dict] = [
    {
        "id": "sig-001",
        "document_id": "doc-002",
        "document_name": "NDA — Veritas Technologies",
        "recipient": "legal@veritas.tech",
        "sent_at": "2026-06-07 09:48",
        "viewed_at": "2026-06-07 14:22",
        "signed_at": "2026-06-08 11:30",
        "status": "signed",
        "tracking_id": "DS-77412",
    },
]
