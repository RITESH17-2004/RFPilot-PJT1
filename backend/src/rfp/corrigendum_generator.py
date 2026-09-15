import logging
import asyncio
import functools
import re
import datetime
from typing import Dict, Any, List
from src.rag.answer_generation_engine import AnswerGenerationEngine
from config import Config

try:
    from mistralai import Mistral
except ImportError:
    Mistral = None

def sanitize_text(text: str) -> str:
    """
    Removes non-ASCII characters that cause encoding issues, but normalizes 
    common punctuation like smart quotes to their ASCII equivalents first.
    """
    if not text: return ""
    
    # Normalize smart quotes and common non-ASCII punctuation
    text = text.replace('“', '"').replace('”', '"')
    text = text.replace('‘', "'").replace('’', "'")
    text = text.replace('—', '-').replace('–', '-') # Em and en dashes
    
    # After normalization, safely strip remaining non-ASCII characters if any
    return re.sub(r'[^\x00-\x7F]+', ' ', text)

class CorrigendumGenerator:
    """
    Identifies changes in RFPs and generates official corrigendum notices.
    """
    def __init__(self, decision_engine: AnswerGenerationEngine):
        self.decision_engine = decision_engine
        self.secondary_client = None
        if getattr(Config, 'MISTRAL_API_KEY_2', None) and Mistral:
            self.secondary_client = Mistral(api_key=Config.MISTRAL_API_KEY_2)
            logging.info("Secondary Mistral Client active! Load balancing enabled.")

    async def extract_deadline(self, current_deadline: str, changes: str) -> str:
        """Uses LLM to determine if the deadline changed and extract the new date."""
        prompt = f"""You are analyzing changes to an RFP document.
CURRENT SUBMISSION DEADLINE: {current_deadline}
CHANGES TO APPLY: {changes}

If the changes explicitly mention extending, delaying, or modifying the submission deadline, calculate or extract the NEW deadline date.
Format it consistently (e.g., YYYY-MM-DD if possible, or copy exactly the new date written).
If the changes DO NOT affect the submission deadline at all, output EXACTLY the CURRENT SUBMISSION DEADLINE shown above.
OUTPUT ONLY THE DEADLINE STRING. No introductory text whatsoever."""
        try:
            if not self.decision_engine.use_mistral: return current_deadline
            client_to_use = self.secondary_client if self.secondary_client else self.decision_engine.client
            messages = [
                {"role": "system", "content": "You extract dates perfectly. Output only the final date."},
                {"role": "user", "content": prompt}
            ]
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                self.decision_engine.executor,
                functools.partial(
                    client_to_use.chat.complete,
                    model="mistral-small-latest",
                    messages=messages,
                    temperature=0.1,
                    max_tokens=60
                )
            )
            return response.choices[0].message.content.strip()
        except:
            return current_deadline

    async def generate_notice(self, original_content: str, updated_content: str, changes: str) -> str:
        """
        Uses LLM to generate a formal corrigendum notice based on specific changes.
        Includes exponential backoff to handle free-tier rate limits.
        """
        logging.info("Generating corrigendum notice.")
        
        # Sanitize inputs to prevent encoding crashes
        safe_changes = sanitize_text(changes)
        
        # Use Diff Data if available, otherwise fallback to the user's string
        diff_text = f"EXACT JSON DIFF (Original vs Updated Sections):\n{sanitize_text(original_content)}" if original_content else f"CHANGES REQUESTED:\n{safe_changes}"
        
        # 1. Automate Issuance Date
        current_date = datetime.datetime.now().strftime("%d %B %Y")
        
        # 2. Retrieve Centralized Institutional Details
        bank_name = Config.BANK_NAME
        division = Config.BANK_DIVISION
        officer = Config.OFFICER_NAME
        contact = f"Email: {Config.OFFICER_CONTACT} | Tel: {Config.OFFICER_PHONE}"
        location = Config.HEADQUARTERS

        prompt = f"""You are a senior banking procurement officer at {bank_name}. 
Generate a formal 'Corrigendum Notice' that clearly communicates RFP updates to all participating vendors.

{diff_text}

USER CHANGE REQUEST:
{safe_changes}

MANDATORY FORMATTING INSTRUCTIONS:
1. Use a professional, institutional structure.
2. HEADER: '{bank_name} - {division}'.
3. INCLUDE: A unique 'Corrigendum Identification Number' (e.g., IB/CORR/2026/00X).
4. DATE OF ISSUANCE: {current_date} (MANDATORY).
5. DYNAMIC SUBJECT LINE: You MUST autonomously generate a highly specific, adaptive Subject Line based on the nature of the requested changes. DO NOT use a generic subject. (e.g., deeply analyze the change and write "SUBJECT: Change in Bid Submission Timeline" or "SUBJECT: Modification of Phase 1 Cloud Strategy Architecture").
6. COMPARISON TABLE: Present changes in a beautifully structured <table>:
   - CRITICAL RULE: You MUST ONLY include rows in the table where the text has ACTUALLY been modified, added, or deleted! 
   - If the Original Provision and Revised Provision are exactly the same, DO NOT include that clause in the table. Exclude all unchanged data.
   - DELETIONS: If a text or clause exists in the Original Provision but was completely removed in the Revised version, you MUST include the row! Put the original text in Column 2, and explicitly write "[DELETED / REMOVED]" in Column 3.
   - Column 1: SECTION / CLAUSE REFERENCE
   - Column 2: ORIGINAL PROVISION
   - Column 3: REVISED PROVISION
6. DEADLINES: Explicitly state if the 'Bid Submission Deadline' has changed.
7. ISSUING AUTHORITY:
   - Name: {officer}
   - Contact: {contact}
   - Location: {location}
8. CLOSING: A standard legal disclaimer stating all other terms and conditions remain unchanged.
9. TONE: Formal, precise, and authoritative. 
10. TONE: Formal, precise, and authoritative. 
11. DO NOT use placeholders like '[Insert Date]'.
12. OUTPUT FORMAT: You must output your response ENTIRELY in beautiful, semantic HTML. Use tags like <h2>, <p>, and a beautifully structured <table> for the comparison. Use Tailwind CSS utility classes inline in the tags to make it look incredibly premium (e.g., <table class="w-full text-sm border-collapse rounded-xl overflow-hidden shadow-sm bg-white">, <th class="bg-[#0033a0] text-white text-left p-4 font-bold uppercase tracking-widest text-[10px]">, <td class="p-4 border-t border-slate-100 text-slate-700 font-medium">, <h2 class="text-xl font-black text-[#0a1628] mb-4">, <p class="mb-4 text-slate-600 leading-relaxed">). 
ABSOLUTELY NO MARKDOWN. Do NOT wrap your response in ```html blocks or any JSON structure. Return ONLY the raw HTML string.
"""

        if self.decision_engine.use_mistral:
            max_retries = 5
            base_delay = 5 # Seconds
            
            for attempt in range(max_retries):
                try:
                    # Determine which API Key/Client to use
                    client_to_use = self.secondary_client if self.secondary_client else self.decision_engine.client
                    
                    if attempt > 0:
                        delay = base_delay * (2 ** attempt)
                        logging.warning(f"Rate limit hit. Retrying in {delay} seconds... (Attempt {attempt+1}/{max_retries})")
                        await asyncio.sleep(delay)
                    else:
                        # Even on first attempt, if no secondary key, sleep a bit as we just did an update
                        if not self.secondary_client:
                            await asyncio.sleep(3)
                        else:
                            logging.info("Using Key #2 for Corrigendum Notice.")

                    messages = [
                        {"role": "system", "content": "You are a senior banking procurement officer expert in contract modifications."},
                        {"role": "user", "content": prompt}
                    ]
                    
                    loop = asyncio.get_event_loop()
                    response = await loop.run_in_executor(
                        self.decision_engine.executor,
                        functools.partial(
                            client_to_use.chat.complete,
                            model="mistral-small-latest",
                            messages=messages,
                            temperature=0.3, 
                            max_tokens=4000
                        )
                    )
                    
                    notice_content = response.choices[0].message.content.strip()
                    # Post-process to remove any accidental bolding/markdown
                    notice_content = notice_content.replace("**", "")
                    logging.info("Corrigendum notice generated successfully and sanitized.")
                    return notice_content
                    
                except Exception as e:
                    if "429" in str(e) and attempt < max_retries - 1:
                        continue
                    logging.error(f"Error generating corrigendum with Mistral: {e}")
                    return f"Error generating corrigendum notice: {str(e)}"
            
            return "Failed to generate corrigendum after multiple retries due to rate limits."
        else:
            return "Mistral API is not configured. Corrigendum generation requires an active LLM API."

    async def apply_intelligent_update(self, original_json_str: str, change_description: str) -> str:
        """
        Uses LLM to take an existing RFP (JSON string) and apply natural language changes.
        Uses a SURGICAL update approach to avoid context limits and data loss.
        """
        logging.info("Applying intelligent surgical update to RFP.")
        
        safe_json = sanitize_text(original_json_str)
        safe_desc = sanitize_text(change_description)

        prompt = f"""You are a precise JSON Patch engine for a banking RFP.
CRITICAL TASK: Based on the `CHANGES TO APPLY`, identify WHICH specific sections from the `EXISTING RFP` need modification.
Output ONLY the sections that require changes. Do not output sections that remain untouched.

CHANGES TO APPLY:
{safe_desc}

EXISTING RFP (JSON):
{safe_json}

MANDATORY INSTRUCTIONS:
1. Output a JSON dictionary where the keys are the exact numeric `section_id` strings (e.g., "3", "5", "10") that need updates.
2. The value for each key must be the fully rewritten, updated JSON object for that specific section.
3. Keep the exact same section schema. ONLY modify the specific dates, amounts, or clauses requested.
4. If the changes affect deadlines, ensure you update the schedule in the relevant sections.
5. CASCADING GLOBAL CONSISTENCY: You MUST scan the ENTIRE document. Whatever changes are requested, you must intelligently hunt for and update ALL related downstream dependencies, figures, context, or cross-references across EVERY single section to ensure absolute logical consistency and zero contradictions anywhere in the RFP!

EXAMPLE FORMAT:
{{
  "2": {{ "section_id": 2, "title": "TENDER SCHEDULE", "executive_summary": "...", "clauses": [...] }},
  "8": {{ "section_id": 8, "title": "BID EVALUATION", "executive_summary": "...", "clauses": [...] }}
}}
"""

        if self.decision_engine.use_mistral:
            max_retries = 3
            base_delay = 5
            
            for attempt in range(max_retries):
                try:
                    if attempt > 0:
                        delay = base_delay * (2 ** attempt)
                        logging.warning(f"Retrying update due to rate limit... {delay}s wait.")
                        await asyncio.sleep(delay)

                    messages = [
                        {"role": "system", "content": "You are a professional JSON editor for banking procurement. You output only valid JSON."},
                        {"role": "user", "content": prompt}
                    ]
                    
                    loop = asyncio.get_event_loop()
                    response = await loop.run_in_executor(
                        self.decision_engine.executor,
                        functools.partial(
                            self.decision_engine.client.chat.complete,
                            model="mistral-small-latest",
                            messages=messages,
                            temperature=0.1, 
                            response_format={"type": "json_object"}
                        )
                    )
                    
                    updated_parts_str = response.choices[0].message.content.strip()
                    import json
                    
                    try:
                        updated_nodes = json.loads(updated_parts_str)
                    except json.JSONDecodeError:
                        raise Exception("Mistral truncated the JSON patch output! Retrying...")

                    # Surgically merge the updated nodes back into the original document!
                    original_sections = json.loads(original_json_str)
                    
                    old_nodes = {}
                    for i, sec in enumerate(original_sections):
                        sec_id = str(sec.get("section_id", sec.get("num", "")))
                        if sec_id in updated_nodes:
                            old_nodes[sec_id] = sec # Capture the 'before' state
                            original_sections[i] = updated_nodes[sec_id]
                            logging.info(f"Surgically applied updates to Section {sec_id}")

                    final_merged_json = json.dumps(original_sections)
                    
                    # Create precise diff for the Notice generator
                    diff_data = {
                        "original_sections": old_nodes,
                        "updated_sections": updated_nodes
                    }
                    
                    logging.info("Intelligent surgical update completed without data loss.")
                    return final_merged_json, json.dumps(diff_data)
                    
                except Exception as e:
                    if "429" in str(e) and attempt < max_retries - 1:
                        continue
                    logging.error(f"Error applying intelligent update with Mistral: {e}")
                    raise Exception(f"Failed to apply intelligent update: {str(e)}")
            raise Exception("Mistral rate limits prevented the update.")
        else:
            raise Exception("Mistral API is not configured.")
