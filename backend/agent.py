"""Agent loop with SSE streaming using the Groq tool-calling API."""

import re
import json
import asyncio
from typing import AsyncGenerator

from groq import Groq

from tools import TOOL_DEFINITIONS, execute_tool


def _to_snake(name: str) -> str:
    s = re.sub(r'([A-Z][a-z]+)', r'_\1', name)
    return re.sub(r'([a-z0-9])([A-Z])', r'\1_\2', s).lower().lstrip('_')

MODEL = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """You are an intelligent document generation agent. When a user asks you to create a document, you must:

1. Call fetch_client_data to retrieve the client's details from the CRM.
2. Call fill_template with the document type and all collected data to generate the .docx file.
3. Call convert_to_pdf to produce a PDF from the filled document.
4. Call upload_to_storage to save the document to Google Drive or S3.
5. Call send_email to deliver the document to the client.
6. For contracts and NDAs, also call request_signature.

Always complete the full pipeline. Be concise in your final summary."""


async def run_agent_stream(
    document_type: str,
    form_data: dict,
    client_sdk: Groq,
) -> AsyncGenerator[str, None]:
    """
    Yields SSE-formatted strings.
    Event shapes:
      {"type": "tool_start",  "tool_name": str, "tool_input": dict}
      {"type": "tool_result", "tool_name": str, "result": dict}
      {"type": "text_delta",  "text": str}
      {"type": "done"}
      {"type": "error",       "message": str}
    """

    def emit(event: dict) -> str:
        return f"data: {json.dumps(event)}\n\n"

    # Normalise keys to snake_case so fill_template receives client_name, due_date, etc.
    form_data = {_to_snake(k): v for k, v in form_data.items()}
    details = "\n".join(f"- {k}: {v}" for k, v in form_data.items() if v)
    user_message = (
        f"Generate a {document_type} document by executing the full tool pipeline. "
        f"You MUST call fetch_client_data first, then fill_template, then the remaining steps.\n"
        f"Details:\n{details if details else '(none provided — use defaults from the CRM)'}"
    )

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_message},
    ]

    try:
        first_call = True
        while True:
            response = client_sdk.chat.completions.create(
                model=MODEL,
                max_tokens=2048,
                tools=TOOL_DEFINITIONS,
                # Force tool use on the first call so the pipeline always starts
                tool_choice="required" if first_call else "auto",
                messages=messages,
            )
            first_call = False

            choice = response.choices[0]
            msg = choice.message

            assistant_entry = {"role": "assistant", "content": msg.content}
            if msg.tool_calls:
                assistant_entry["tool_calls"] = [
                    {
                        "id": tc.id,
                        "type": tc.type,
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments,
                        },
                    }
                    for tc in msg.tool_calls
                ]
            messages.append(assistant_entry)

            if choice.finish_reason == "stop":
                if msg.content:
                    yield emit({"type": "text_delta", "text": msg.content})
                break

            elif choice.finish_reason == "tool_calls":
                if msg.content:
                    yield emit({"type": "text_delta", "text": msg.content})

                for tc in msg.tool_calls or []:
                    tool_name = tc.function.name
                    tool_input = json.loads(tc.function.arguments)

                    yield emit({"type": "tool_start", "tool_name": tool_name, "tool_input": tool_input})

                    result = await asyncio.get_event_loop().run_in_executor(
                        None, execute_tool, tool_name, tool_input
                    )

                    yield emit({"type": "tool_result", "tool_name": tool_name, "result": result})

                    messages.append({
                        "role": "tool",
                        "tool_call_id": tc.id,
                        "content": json.dumps(result),
                    })

            else:
                break

        yield emit({"type": "done"})

    except Exception as exc:
        yield emit({"type": "error", "message": str(exc)})
