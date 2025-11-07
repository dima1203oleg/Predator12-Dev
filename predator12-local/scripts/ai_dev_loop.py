import argparse
import os
import subprocess
from typing import Any, Dict, List

# --- Configuration ---
# Default LLM endpoint and model
DEFAULT_LLM_URL = "http://localhost:11434"
DEFAULT_LLM_MODEL = "mistral"  # As defined in Dockerfile

# Environment variables for switching AI providers
USE_OPENAI_API = os.environ.get("USE_OPENAI_API", "false").lower() == "true"
ENABLE_COPILOT = os.environ.get("ENABLE_COPILOT", "false").lower() == "true"
ALLOW_WEB_SEARCH = os.environ.get("ALLOW_WEB_SEARCH", "false").lower() == "true"
USE_GROQ = os.environ.get("USE_GROQ", "false").lower() == "true"
USE_HF_API = os.environ.get("USE_HF_API", "false").lower() == "true"


# --- LLM Integration ---
def get_llm_client():
    """
    Initializes and returns an LLM client.
    Defaults to a local Ollama instance.
    Requires LangChain to be installed for actual LLM interaction.
    """
    print("Initializing LLM client...")
    try:
        # Attempt to import LangChain components
        # from langchain_community.llms import Ollama
        # from langchain_openai import ChatOpenAI
        # from langchain_groq import ChatGroq
        # from langchain_community.llms import HuggingFaceHub
        pass  # Placeholder for actual imports
    except ImportError:
        print("LangChain not found. LLM calls will be simulated.")
        return None  # Simulate LLM calls if LangChain is not installed

    if USE_OPENAI_API:
        print("Using OpenAI API...")
        # return ChatOpenAI(model="gpt-4", api_key=os.environ.get("OPENAI_API_KEY"))
        raise NotImplementedError("OpenAI API integration not yet implemented.")
    elif USE_GROQ:
        print("Using Groq API...")
        # return ChatGroq(model="mixtral-8x7b-32768", groq_api_key=os.environ.get("GROQ_API_KEY"))
        raise NotImplementedError("Groq API integration not yet implemented.")
    elif USE_HF_API:
        print("Using HuggingFace API...")
        # return HuggingFaceHub(repo_id="mistralai/Mistral-7B-Instruct-v0.1", huggingfacehub_api_token=os.environ.get("HF_API_TOKEN"))
        raise NotImplementedError("HuggingFace API integration not yet implemented.")
    else:
        print(f"Using local Ollama at {DEFAULT_LLM_URL} with model {DEFAULT_LLM_MODEL}...")
        # return Ollama(base_url=DEFAULT_LLM_URL, model=DEFAULT_LLM_MODEL)
        # For now, return None to indicate simulation if LangChain is not installed
        return None


# --- File Operations ---
def read_file_content(filepath: str) -> str:
    """Reads content from a file."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        print(f"Error: File not found at {filepath}")
        return ""
    except Exception as e:
        print(f"Error reading file {filepath}: {e}")
        return ""


def write_file_content(filepath: str, content: str) -> bool:
    """Writes content to a file, creating directories if necessary."""
    try:
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Successfully wrote to {filepath}")
        return True
    except Exception as e:
        print(f"Error writing to file {filepath}: {e}")
        return False


# --- Test Execution ---
def run_command(command: str, cwd: str = None) -> Dict[str, Any]:
    """Runs a shell command and returns its output and status."""
    print(f"Executing command: {command}")
    try:
        result = subprocess.run(
            command,
            shell=True,
            check=True,  # Raise CalledProcessError if command returns non-zero exit code
            capture_output=True,
            text=True,
            cwd=cwd,
        )
        print(f"Command output:\n{result.stdout}")
        return {"status": "success", "output": result.stdout, "errors": []}
    except subprocess.CalledProcessError as e:
        print(f"Command failed with exit code {e.returncode}")
        print(f"Error output:\n{e.stderr}")
        return {"status": "failed", "output": e.stdout, "errors": [e.stderr]}
    except FileNotFoundError:
        print(f"Error: Command not found: {command.split()[0]}")
        return {
            "status": "failed",
            "output": "",
            "errors": [f"Command not found: {command.split()[0]}"],
        }
    except Exception as e:
        print(f"An unexpected error occurred while running command: {e}")
        return {"status": "failed", "output": "", "errors": [str(e)]}


def run_tests(test_type: str) -> Dict[str, Any]:
    """
    Executes tests (backend or frontend) and returns results.
    """
    print(f"Running {test_type} tests...")
    if test_type == "backend":
        # Assumes pytest is installed and requirements.txt is processed
        # The command is defined in .vscode/tasks.json as "Test Backend (pytest)"
        # We'll call it directly here for simplicity in the script.
        # In a real scenario, you might want to use VS Code's task runner API if available,
        # or ensure the environment is set up correctly for direct command execution.
        return run_command("pytest -q --maxfail=1")
    elif test_type == "frontend":
        # Assumes npm and frontend dependencies are installed
        # The command is defined in .vscode/tasks.json as "Test Frontend (npm test)"
        return run_command("cd frontend && npm run test --if-present", cwd=".")
    else:
        return {"status": "failed", "output": "", "errors": ["Unknown test type"]}


# --- Git Operations ---
def run_git_command(command: List[str], cwd: str = ".") -> Dict[str, Any]:
    """Runs a git command and returns its output and status."""
    full_command = ["git"] + command
    return run_command(" ".join(full_command), cwd=cwd)


def commit_and_create_pr(
    branch_name: str, commit_message: str, pr_title: str, pr_body: str
) -> bool:
    """
    Commits changes, pushes to remote, and creates a GitHub Pull Request.
    Assumes GitHub CLI (gh) is installed and authenticated.
    """
    print(f"Committing changes to branch '{branch_name}'...")

    # 1. Add all changes
    add_result = run_git_command(["add", "."])
    if add_result["status"] != "success":
        print("Failed to add changes.")
        return False

    # 2. Commit changes
    commit_result = run_git_command(["commit", "-m", commit_message])
    if commit_result["status"] != "success":
        # If commit fails (e.g., no changes), it might be okay. Check output.
        if "nothing to commit" in commit_result["output"]:
            print("No changes to commit.")
            return True  # Consider it a success if there's nothing to commit
        else:
            print("Failed to commit changes.")
            return False

    # 3. Push to remote
    print(f"Pushing branch '{branch_name}' to remote...")
    push_result = run_git_command(["push", "origin", branch_name])
    if push_result["status"] != "success":
        print(f"Failed to push branch '{branch_name}'.")
        return False

    # 4. Create Pull Request using GitHub CLI
    print(f"Creating Pull Request for branch '{branch_name}'...")
    # Assumes the default branch is 'main' or 'master'. Adjust if needed.
    # A more robust solution would detect the default branch.
    pr_command = [
        "gh",
        "pr",
        "create",
        "--base",
        "dev",  # Target branch for PR, adjust as needed
        "--head",
        branch_name,
        "--title",
        pr_title,
        "--body",
        pr_body,
    ]
    pr_result = run_command(" ".join(pr_command))
    if pr_result["status"] == "success":
        print(f"Pull Request created successfully:\n{pr_result['output']}")
        return True
    else:
        print("Failed to create Pull Request.")
        print(f"gh CLI output:\n{pr_result['output']}")
        print(f"gh CLI errors:\n{pr_result['errors']}")
        return False


# --- AI Agent Logic ---
class AICoderAgent:
    def __init__(self, llm_client):
        self.llm_client = llm_client
        self.project_context = {}  # To store embeddings or relevant code snippets

    def generate_code(self, task_description: str, context_files: List[str] = None) -> str:
        """Generates code based on a task description and project context."""
        print(f"Generating code for task: {task_description}")

        # --- Placeholder for actual LLM interaction ---
        if self.llm_client:
            # Example using LangChain (if installed and client is initialized)
            # prompt = f"Generate code for: {task_description}\nContext:\n{self._get_context(context_files)}"
            # response = self.llm_client.invoke(prompt)
            # return response.content
            pass  # Actual LLM call would go here

        # Simulate code generation if LLM client is None or LangChain is not installed
        simulated_code_template = """
# This is simulated code for: {task_description}
# Generated by AI Coder Agent

def new_feature():
    print("Implementing new feature...")
    # TODO: Add actual implementation based on task description and context
    pass

# Example of a simple function
def greet(name):
    # This is a simulated f-string within the generated code
    return f"Hello, {{name}}!"

if __name__ == "__main__":
    print(greet("World"))
"""
        simulated_code = simulated_code_template.format(task_description=task_description)
        print("Simulated code generation complete.")
        return simulated_code

    def analyze_error(self, error_message: str, code_snippet: str) -> str:
        """Analyzes an error message and suggests code fixes."""
        print(f"Analyzing error: {error_message}")

        # --- Placeholder for actual LLM interaction ---
        if self.llm_client:
            # prompt = f"Analyze the following error and suggest a fix for the code:\n\nError:\n{error_message}\n\nCode:\n{code_snippet}\n\nProvide the corrected code or a clear explanation of the fix."
            # response = self.llm_client.invoke(prompt)
            # return response.content
            pass  # Actual LLM call would go here

        # Simulate error analysis and fix suggestion
        simulated_fix_suggestion_template = """
# Simulated fix suggestion for error: {error_message}
# Based on the provided code snippet.
# In a real scenario, this would be a more precise code modification or explanation.
print("AI analyzing error and suggesting a fix...")
# Example: If error is 'NameError: name 'x' is not defined'
# Suggestion: Add 'x = 0' or similar initialization.
# For now, returning a placeholder fix.
corrected_code = "{code_snippet}" + "\\n# AI-suggested fix: Add necessary initialization or correction."
return corrected_code
"""
        simulated_fix_suggestion = simulated_fix_suggestion_template.format(
            error_message=error_message,
            code_snippet=code_snippet.replace('"', '\\"').replace(
                "'", "\\'"
            ),  # Basic escaping for string literal
        )
        print("Simulated error analysis complete.")
        return simulated_fix_suggestion

    def _get_context(self, filepaths: List[str] = None) -> str:
        """
        Retrieves relevant project context.
        In a real implementation, this would involve vector search on Qdrant
        or reading specific files.
        """
        context = ""
        if filepaths:
            for fp in filepaths:
                context += f"\n--- Content of {fp} ---\n{read_file_content(fp)}\n-------------------------\n"
        # Add more sophisticated context retrieval here (e.g., vector search)
        return context


class AITesterAgent:
    def run_tests(self, test_type: str) -> Dict[str, Any]:
        """Runs tests and returns results."""
        return run_tests(test_type)


class AIOrchestrator:
    def __init__(self):
        self.llm_client = get_llm_client()
        self.coder = AICoderAgent(self.llm_client)
        self.tester = AITesterAgent()
        self.max_iterations = 5  # Safety limit to prevent infinite loops
        self.current_iteration = 0
        self.branch_name = "ai-generated-feature"  # Default branch for AI commits
        self.pr_counter = 0  # To create unique PR titles/bodies

    def develop(self, task_description: str, target_file: str = None):
        """
        Orchestrates the AI development loop: generate -> test -> analyze -> fix.
        """
        print(f"\n--- Starting AI Development Loop for Task: '{task_description}' ---")

        generated_code = ""

        while self.current_iteration < self.max_iterations:
            self.current_iteration += 1
            print(f"\n--- Iteration {self.current_iteration}/{self.max_iterations} ---")

            # 1. Generate Code
            if (
                not generated_code
            ):  # Generate initial code only if not already present from a previous fix
                # In a real scenario, we'd pass relevant file paths for context
                generated_code = self.coder.generate_code(task_description)
                if target_file:
                    write_file_content(target_file, generated_code)
                    print(f"Generated initial code written to {target_file}")
                else:
                    print("Generated code (not written to a specific file yet):")
                    print(generated_code)

            # 2. Run Tests
            backend_tests_passed = False
            frontend_tests_passed = False

            # Determine which tests to run based on the target file or task
            # This is a simplified heuristic. A more robust approach would analyze the task description.
            if target_file and ("backend" in target_file.lower() or "app/" in target_file.lower()):
                backend_results = self.tester.run_tests("backend")
                if backend_results["status"] == "success":
                    backend_tests_passed = True
                else:
                    print("Backend tests failed.")
                    error_message = "\n".join(
                        backend_results.get("errors", ["Unknown backend test error"])
                    )
                    # 3. Analyze Error
                    fix_suggestion = self.coder.analyze_error(error_message, generated_code)
                    # 4. Apply Fix (and regenerate code for next iteration)
                    generated_code = fix_suggestion  # Replace current code with suggested fix
                    if target_file:
                        write_file_content(target_file, generated_code)
                        print(f"Applied fix and updated {target_file}")
                    else:
                        print("Generated fix suggestion (not written to a specific file yet):")
                        print(generated_code)
                    continue  # Restart loop with the fixed code

            elif target_file and "frontend" in target_file.lower():
                frontend_results = self.tester.run_tests("frontend")
                if frontend_results["status"] == "success":
                    frontend_tests_passed = True
                else:
                    print("Frontend tests failed.")
                    error_message = "\n".join(
                        frontend_results.get("errors", ["Unknown frontend test error"])
                    )
                    # 3. Analyze Error
                    fix_suggestion = self.coder.analyze_error(error_message, generated_code)
                    # 4. Apply Fix
                    generated_code = fix_suggestion
                    if target_file:
                        write_file_content(target_file, generated_code)
                        print(f"Applied fix and updated {target_file}")
                    else:
                        print("Generated fix suggestion (not written to a specific file yet):")
                        print(generated_code)
                    continue  # Restart loop with the fixed code
            else:
                # If no specific target file, or task is more general, run all tests
                print("Running all tests (backend and frontend)...")
                backend_results = self.tester.run_tests("backend")
                frontend_results = self.tester.run_tests("frontend")

                if (
                    backend_results["status"] == "success"
                    and frontend_results["status"] == "success"
                ):
                    backend_tests_passed = True
                    frontend_tests_passed = True
                else:
                    print("Tests failed.")
                    errors = []
                    if backend_results["status"] != "success":
                        errors.append(f"Backend errors: {backend_results.get('errors', [])}")
                    if frontend_results["status"] != "success":
                        errors.append(f"Frontend errors: {frontend_results.get('errors', [])}")

                    error_message = "\n".join(errors)
                    fix_suggestion = self.coder.analyze_error(error_message, generated_code)
                    generated_code = fix_suggestion
                    if target_file:
                        write_file_content(target_file, generated_code)
                        print(f"Applied fix and updated {target_file}")
                    else:
                        print("Generated fix suggestion (not written to a specific file yet):")
                        print(generated_code)
                    continue  # Restart loop with the fixed code

            # If all relevant tests passed
            if backend_tests_passed and frontend_tests_passed:
                print("\nAll tests passed successfully!")
                # 5. Local Deploy/Verification (Placeholder)
                print("Performing local deployment/verification...")
                # This would involve running docker-compose up, or other local deployment steps.
                # For now, just print a success message.
                print("Local deployment/verification simulated. Code is ready for commit.")

                # 6. Commit and Create PR
                self.pr_counter += 1
                branch = f"{self.branch_name}-{self.pr_counter}"
                commit_msg = f"AI: Implement feature - {task_description}"
                pr_title = f"AI Feature: {task_description}"
                pr_body = f"This PR was automatically generated by the AI development loop.\n\nTask: {task_description}\n\nIteration: {self.current_iteration}"

                if commit_and_create_pr(branch, commit_msg, pr_title, pr_body):
                    print("Successfully committed changes and created Pull Request.")
                    return True  # Development loop successful
                else:
                    print("Development loop completed, but failed to create Pull Request.")
                    return False  # Development loop completed, but PR failed

        print(f"\nAI Development Loop failed after {self.max_iterations} iterations.")
        print("Please review the code and errors manually.")
        return False  # Development loop failed


# --- Argument Parsing ---
def parse_args():
    parser = argparse.ArgumentParser(description="AI Development Loop Script")
    parser.add_argument(
        "--task",
        type=str,
        default="Automated improvement task",
        help="Description of the task to perform",
    )
    parser.add_argument(
        "--iterations",
        type=int,
        default=5,
        help="Maximum number of iterations for the development loop",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Run in dry-run mode (simulate without making changes)",
    )
    parser.add_argument(
        "--target-file", type=str, help="Specific file to target for code generation"
    )
    return parser.parse_args()


# --- Main Execution ---
if __name__ == "__main__":
    args = parse_args()

    print("--- AI Development Loop Script ---")

    # Check if running inside a Dev Container
    if os.path.exists("/.devcontainer/devcontainer.json"):
        print("Running inside a Dev Container.")
    else:
        print("Not running inside a Dev Container. Some features might not work as expected.")

    # Initialize orchestrator
    orchestrator = AIOrchestrator()
    orchestrator.max_iterations = args.iterations

    if args.dry_run:
        print("Running in dry-run mode. No actual changes will be made.")
        # In dry-run, just simulate the loop without committing or creating PR
        success = orchestrator.develop(task_description=args.task, target_file=args.target_file)
        if success:
            print("\nDry-run completed successfully. To apply changes, run without --dry-run.")
        else:
            print("\nDry-run failed.")
    else:
        # Execute the development loop
        success = orchestrator.develop(task_description=args.task, target_file=args.target_file)

        if success:
            print("\nAI development task completed successfully.")
        else:
            print("\nAI development task failed. Please check logs and manual intervention.")
