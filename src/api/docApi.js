const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Streams document generation progress events.
 * Calls onEvent with each parsed SSE event.
 * Returns the final agent text summary.
 */
export async function streamGenerate(documentType, formData, onEvent) {
  const res = await fetch(`${API_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_type: documentType, form_data: formData }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Network error' }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let fullText = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n\n')
    buffer = lines.pop() ?? ''

    for (const chunk of lines) {
      if (!chunk.startsWith('data: ')) continue
      try {
        const event = JSON.parse(chunk.slice(6))
        onEvent(event)
        if (event.type === 'text_delta') fullText += event.text
      } catch {
        // skip malformed lines
      }
    }
  }

  return fullText
}

export async function fetchDocuments() {
  const res = await fetch(`${API_BASE}/api/documents`)
  if (!res.ok) throw new Error('Failed to fetch documents')
  return res.json()
}

export async function fetchTemplates() {
  const res = await fetch(`${API_BASE}/api/templates`)
  if (!res.ok) throw new Error('Failed to fetch templates')
  return res.json()
}

export async function uploadTemplate(file) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API_BASE}/api/templates/upload`, { method: 'POST', body: form })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }))
    throw new Error(err.detail || 'Upload failed')
  }
  return res.json()
}

export async function fetchSignatures() {
  const res = await fetch(`${API_BASE}/api/signatures`)
  if (!res.ok) throw new Error('Failed to fetch signatures')
  return res.json()
}
