import json
import urllib.request
import urllib.error
from typing import Dict, Any, List, Optional

OLLAMA_BASE_URL = "http://localhost:11434"
DEFAULT_MODEL = "qwen2.5:0.5b"


def get_ollama_status() -> Dict[str, Any]:
    """Check if local Ollama service is reachable and retrieve available models."""
    try:
        url = f"{OLLAMA_BASE_URL}/api/tags"
        req = urllib.request.Request(url, headers={"User-Agent": "Resumetic-Backend"})
        with urllib.request.urlopen(req, timeout=4) as response:
            if response.status == 200:
                data = json.loads(response.read().decode("utf-8"))
                models = [m.get("name", "") for m in data.get("models", []) if m.get("name")]
                
                # Check if default model or any fallback is available
                active_model = DEFAULT_MODEL if DEFAULT_MODEL in models else (models[0] if models else DEFAULT_MODEL)
                
                return {
                    "online": True,
                    "models": models,
                    "active_model": active_model,
                    "message": f"Ollama is online with {len(models)} model(s) available."
                }
    except Exception as exc:
        return {
            "online": False,
            "models": [],
            "active_model": DEFAULT_MODEL,
            "message": f"Ollama service offline or unreachable on {OLLAMA_BASE_URL}. Ensure Ollama is running locally."
        }
    
    return {
        "online": False,
        "models": [],
        "active_model": DEFAULT_MODEL,
        "message": "Ollama service status unknown."
    }


def chat_with_ollama(
    message: str,
    conversation_history: Optional[List[Dict[str, str]]] = None,
    model: Optional[str] = None,
    resume_context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Send a user message to local Ollama LLM with structured resume context."""
    
    status = get_ollama_status()
    selected_model = model or status.get("active_model") or DEFAULT_MODEL

    if not status.get("online"):
        # Fallback informative message if Ollama daemon isn't active
        return {
            "success": False,
            "response": (
                "⚠️ Ollama is currently offline or unreachable on your system.\n\n"
                "To activate the local AI Chatbot:\n"
                "1. Make sure **Ollama** is installed and running (`ollama serve` or open Ollama app).\n"
                "2. Ensure you have pulled a model (e.g., `ollama pull qwen2.5:0.5b` or `ollama pull llama3.2`).\n"
                "3. Refresh the page or try again once Ollama is active!"
            ),
            "model_used": selected_model,
            "ollama_online": False
        }

    # Build system prompt with resume context if available
    system_prompt = (
        "You are Resumetic AI Assistant, an expert career advisor, resume specialist, and ATS optimization coach. "
        "Your goal is to provide warm, encouraging, concise, highly structured, and actionable career advice. "
        "Format your responses cleanly using markdown (bullet points, bold text, short sections).\n"
    )

    if resume_context:
        candidate_name = resume_context.get("filename", "the candidate's resume")
        ats_score = resume_context.get("ats_score", "N/A")
        profile = resume_context.get("candidate_profile", "Job Seeker")
        skills = resume_context.get("skills", [])
        sections = resume_context.get("sections", {})
        preview_text = resume_context.get("previewText", "")

        system_prompt += f"\n--- CANDIDATE RESUME CONTEXT ---\n"
        system_prompt += f"Document: {candidate_name}\n"
        system_prompt += f"ATS Compatibility Score: {ats_score}/100\n"
        system_prompt += f"Candidate Profile: {profile}\n"
        
        if skills:
            if isinstance(skills, list):
                system_prompt += f"Extracted Skills: {', '.join(skills[:25])}\n"
            elif isinstance(skills, dict):
                items = skills.get("items", [])
                system_prompt += f"Extracted Skills: {', '.join(items[:25])}\n"
        
        if preview_text:
            system_prompt += f"Resume Content Excerpt:\n{preview_text[:1200]}\n"
        system_prompt += "--------------------------------\n"

    messages = [{"role": "system", "content": system_prompt}]

    # Include recent conversation history if provided
    if conversation_history:
        for turn in conversation_history[-6:]:
            role = turn.get("role", "user")
            content = turn.get("content", "")
            if role in ["user", "assistant"] and content:
                messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": message})

    try:
        url = f"{OLLAMA_BASE_URL}/api/chat"
        payload = {
            "model": selected_model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": 0.5,
                "top_p": 0.9
            }
        }
        
        req_data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=req_data,
            headers={"Content-Type": "application/json", "User-Agent": "Resumetic-Backend"}
        )

        with urllib.request.urlopen(req, timeout=30) as response:
            if response.status == 200:
                result = json.loads(response.read().decode("utf-8"))
                assistant_message = result.get("message", {}).get("content", "")
                return {
                    "success": True,
                    "response": assistant_message.strip(),
                    "model_used": selected_model,
                    "ollama_online": True
                }
            else:
                return {
                    "success": False,
                    "response": f"Ollama returned HTTP status {response.status}.",
                    "model_used": selected_model,
                    "ollama_online": True
                }

    except urllib.error.URLError as url_err:
        return {
            "success": False,
            "response": f"Could not connect to Ollama model '{selected_model}'. Error: {str(url_err.reason)}",
            "model_used": selected_model,
            "ollama_online": False
        }
    except Exception as exc:
        return {
            "success": False,
            "response": f"Ollama chat error: {str(exc)}",
            "model_used": selected_model,
            "ollama_online": True
        }
