import json
import os
import subprocess

# --- Configuration ---
# Default LLM endpoint and model
DEFAULT_LLM_URL = "http://localhost:11434"
DEFAULT_LLM_MODEL = "mistral"  # As defined in Dockerfile


def get_ollama_response(prompt: str) -> str:
    """
    Sends a prompt to the local Ollama instance and returns the response.
    """
    try:
        # Construct the command to run ollama directly
        # This assumes the ollama CLI is available in the PATH within the container
        # or that the ollama service is accessible via the specified URL.
        # For simplicity, we'll use subprocess to call the ollama CLI.
        # A more robust approach might use the ollama Python library if installed.

        # Check if ollama CLI is available and can be called
        # If not, we might need to use the ollama Python library or a direct HTTP call.
        # For now, let's assume the ollama CLI is available or we can simulate.

        # Using subprocess to call the ollama CLI
        # The command format is `ollama run <model> <prompt>`
        command = ["ollama", "run", DEFAULT_LLM_MODEL, prompt]

        # Execute the command
        # We need to capture stdout and stderr
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            check=False,  # Don't raise an exception for non-zero exit codes immediately
        )

        if result.returncode == 0:
            return result.stdout.strip()
        else:
            print(f"Ollama CLI command failed with exit code {result.returncode}")
            print(f"Stderr: {result.stderr}")
            # Fallback or error handling
            return f"Error: Ollama CLI failed. Stderr: {result.stderr}"

    except FileNotFoundError:
        print("Error: 'ollama' command not found. Is Ollama installed and in PATH?")
        # Fallback to a simulated response if ollama CLI is not found
        return f"Simulated response for prompt: '{prompt}' (Ollama CLI not found)"
    except Exception as e:
        print(f"An unexpected error occurred while calling Ollama: {e}")
        return f"Simulated response for prompt: '{prompt}' (Error: {e})"


def review_code_diff(diff_content: str) -> str:
    """
    Analyzes a code diff using Ollama and provides a review.
    """
    print("Analyzing code diff for review...")

    # Construct a prompt for code review
    # The prompt should guide the LLM to act as a code reviewer.
    review_prompt = f"""
You are an expert code reviewer. Analyze the following code diff and provide a concise review.
Focus on potential bugs, security vulnerabilities, style inconsistencies, and areas for improvement.
Provide your feedback in a clear, structured format.

Code Diff:
```diff
{diff_content}
```

Review:
"""

    # Get response from Ollama
    review_response = get_ollama_response(review_prompt)

    return review_response


if __name__ == "__main__":
    # Example usage:
    # This script is intended to be called by ai_dev_loop.py or directly for testing.

    # Simulate a code diff for testing
    sample_diff = """
--- a/backend/app/main.py
+++ b/backend/app/main.py
@@ -1,5 +1,5 @@
 from fastapi import FastAPI
-from app.api.v1.endpoints import items
+from app.api.v1.endpoints import items, users

 app = FastAPI()

@@ -7,3 +7,4 @@
 app.include_router(items.router)
+# Include users router
+app.include_router(users.router)
"""

    print("--- Testing scripts/ai_review.py ---")

    # Perform code review on the sample diff
    review_result = review_code_diff(sample_diff)

    print("\n--- Code Review Result ---")
    print(review_result)

    # Example of a different prompt
    # another_prompt = "Explain the concept of GitOps in simple terms."
    # another_response = get_ollama_response(another_prompt)
    # print(f"\n--- Response for '{another_prompt}' ---")
    # print(another_response)
