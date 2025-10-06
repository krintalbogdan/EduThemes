#import llama_analysis_llm
#import openai_analysis
from src.llm.claude_analysis import claude_llm
from src.llm.openai_analysis import openai_frame

def serve_llm(choice):
    if choice == "chatgpt":
        return openai_frame
    if choice == "llama":
        return None
    if choice == "claude":
        return claude_llm