import logging
import json
from typing import Dict, Any, List
from src.rag.answer_generation_engine import AnswerGenerationEngine
from src.rag.query_resolver import QueryResolver

class RFPGenerator:
    """
    Handles the generation of structured RFP documents using the LLM.
    Uses multi-category RAG to find bank-specific guidelines and generates 
    section-by-section for maximum detail and professional quality.
    """
    def __init__(self, decision_engine: AnswerGenerationEngine, kb_resolvers: Dict[str, QueryResolver] = None):
        self.decision_engine = decision_engine
        self.kb_resolvers = kb_resolvers or {}
        self.sections = [
            {"num": 1, "title": "DISCLAIMER & CONFIDENTIALITY", "cat": "legal", "focus": "Standard bank disclaimer, non-disclosure notice, and copyright terms."},
            {"num": 2, "title": "TENDER SCHEDULE & PROCESS DETAILS", "cat": "procurement", "focus": "NIT (Notice Inviting Tender), Pre-bid conference details, and critical submission deadlines."},
            {"num": 3, "title": "INTRODUCTION & PROJECT BACKGROUND", "cat": "rfp", "focus": "High-level vision, digital transformation goals, and current environment overview."},
            {"num": 4, "title": "MINIMUM ELIGIBILITY CRITERIA", "cat": "procurement", "focus": "Mandatory vendor qualification: Financial turnover, past experience, and technical certifications."},
            {"num": 5, "title": "SCOPE OF WORK (SOW)", "cat": "technical", "focus": "Functional boundaries, high-level project milestones, and delivery expectations."},
            {"num": 6, "title": "DETAILED TECHNICAL & FUNCTIONAL SPECIFICATIONS", "cat": "technical", "focus": "Granular specs: Protocols (OAuth2, SAML), OS support, API architecture, and SIEM/SOC integration."},
            {"num": 7, "title": "INSTRUCTIONS TO BIDDERS (ITB)", "cat": "procurement", "focus": "Two-envelope bidding process (Technical vs Commercial), EMD requirements, and bid validity."},
            {"num": 8, "title": "BID EVALUATION & SELECTION METHODOLOGY", "cat": "procurement", "focus": "Detailed weighted scoring matrix (Architecture 25%, Experience 15%, etc.) and QCBS logic."},
            {"num": 9, "title": "GENERAL & SPECIAL TERMS AND CONDITIONS", "cat": "legal", "focus": "Payment terms, Intellectual Property Rights (IPR), Liability, and Force Majeure."},
            {"num": 10, "title": "SERVICE LEVEL AGREEMENT (SLA) & PENALTIES", "cat": "legal", "focus": "Availability metrics (99.99%), resolution timelines, and financial penalty slabs."},
            {"num": 11, "title": "ANNEXURES & BID TEMPLATES", "cat": "procurement", "focus": "Annexure A-K: Bid Form, Compliance Matrix, Commercial Template, NDA, and Experience Certificates."}
        ]

    async def generate_draft(self, project_details: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generates a professional RFP draft as a list of structured JSON section objects.
        Returns the raw section data optimized for the Jinja2 template engine.
        """
        logging.info(f"Initiating High-Fidelity RFP Generation for: {project_details.get('title')}")
        
        final_sections = []
        previous_summaries = [] 
        
        for section_meta in self.sections:
            logging.info(f"Drafting Section {section_meta['num']}...")
            
            context = await self._get_section_context(section_meta, project_details)
            section_data = await self._generate_single_section(section_meta, project_details, context, previous_summaries)
            
            previous_summaries.append(f"Section {section_meta['num']} focused on: {section_meta['focus']}")
            section_data["category"] = section_meta['cat']
            
            final_sections.append(section_data)
            
        return final_sections


    async def _get_section_context(self, section: Dict, details: Dict) -> str:
        """Retrieves targeted RAG context for a specific section, prioritized by project domain."""
        category = section['cat']
        resolver = self.kb_resolvers.get(category)
        if not resolver:
            return ""
            
        # Refined query using Project Type and Title
        query = f"Provide detailed requirements and standard clauses for {section['title']} in a {details.get('project_type')} RFP for {details.get('title')}"
        query_embedding = await resolver.embedding_engine.generate_query_embedding(query)
        relevant_chunks = await resolver.vector_store.search(query_embedding, k=8)
        return "\n".join([c[0]['text'] for c in relevant_chunks])

    async def _generate_single_section(self, section: Dict, details: Dict, context: str, previous_summaries: List[str]) -> Dict[str, Any]:
        """Generates a professional RFP section JSON with expert-grade technical depth."""
        bank_name = details.get('bank_profile', {}).get('bank_name', 'The Bank')
        history = "\n".join(previous_summaries)
        
        # Metadata for precision injection
        issuance_date = details.get('issuance_date', 'Not Provided')
        submission_deadline = details.get('submission_deadline', 'Not Provided')
        project_timeline = details.get('timeline', 'Not Provided')
        
        prompt = f"""DRAFTING MANDATE: You are a Senior Procurement & Technical Consultant for {bank_name}.
Generate SECTION {section['num']} of a formal Banking RFP in structured JSON format.

--- PROJECT SCOPE ---
Title: {details.get('title')}
Domain: {details.get('project_type')}
Budget: {details.get('budget')}
Total Project Timeline: {project_timeline}
Official Issuance Date: {issuance_date}
Final Submission Deadline: {submission_deadline}

--- EXPERT-GRADE PARAMETERS (USE THESE) ---
Eligibility Criteria: {details.get('eligibility_criteria', 'Standard Industry Minimums')}
Compliance Standards: {details.get('compliance_standards', 'RBI/2024 Guidelines, ISO 27001')}
Technical Stack: {details.get('technical_stack', 'Modern Microservices, Secure APIs')}
SLA Requirements: {details.get('sla_requirements', '99.95% Availability, 4hr Resolution')}

--- SECTION FOCUS ---
{section['title']} - {section['focus']}
...
--- STRICT GUIDELINES FOR DATA & QUALITY INTEGRITY ---
1. **NO REPETITION**: Do NOT mention topics or clauses already covered in previous sections ({history}).
2. **NO PLACEHOLDERS**: NEVER use symbols like [Date], [Time], [MM/YYYY], [Bank Name], or brackets [...]. Use actual values.
3. **USE METADATA**: Use the provided 'Official Issuance Date' ({issuance_date}) and 'Final Submission Deadline' ({submission_deadline}) for all date references.
4. **USE EXPERT PARAMETERS**: When generating Section 4, 6, 9, or 10, strictly incorporate the 'EXPERT-GRADE PARAMETERS' provided above.
5. **OPTIMISTIC TIMELINE**: For implementation milestones, calculate a LOGICAL and OPTIMISTIC schedule starting from the Issuance Date. (e.g., 'UAT: 20 Weeks from Start').
6. **SYMBOL COMPATIBILITY**: NEVER use the '₹' Rupee symbol. Use 'INR' instead.
7. **SUB-CLAUSE QUALITY & ORGANIC VARIANCE**: Sub-clauses must provide actionable detail. 
   - High-complexity Technical/Procurement clauses MUST have 5-10 granular sub-clauses.
   - Administrative or Legal clauses should be concise (0-2 sub-clauses).
8. **DOMAIN PRECISION**: Use industry-standard terminology. Cite exact RBI Circular numbers or Acts.
8. **PROCUREMENT COMPONENTS**: 
   - If Section 2: Include the EXACT Submission Deadline ({submission_deadline}).
   - If Section 8: Generate a detailed weighted scoring matrix.
   - If Section 11: Detail Annexure templates.
9. **EVALUATION STRATEGY**: Aligned with '{details.get('evaluation_strategy')}'.

--- JSON SCHEMA ---
{{
  "section_id": {section['num']},
  "title": "{section['title']}",
  "executive_summary": "Professional overview for {bank_name} management.",
  "clauses": [
    {{
      "id": "{section['num']}.1",
      "heading": "Heading Name",
      "content": "Professional, granular requirement text using INR and exact dates.",
      "sub_clauses": ["Detailed implementation steps or requirements"]
    }}
  ],
  "data_tables": [
    {{
      "table_title": "Optimistic Phased Implementation Schedule / Detailed Matrix",
      "headers": ["Phase", "Activity", "Estimated Timeline/Weightage"],
      "rows": [["Phase 1", "Requirement Finalization", "4 Weeks from Start"]]
    }}
  ],
  "mandatory_regulatory_verbatim": "Verbatim quote with circular reference"
}}

Generate Section {section['num']} JSON now:
"""
        try:
            import asyncio
            import functools
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                self.decision_engine.executor,
                functools.partial(
                    self.decision_engine.client.chat.complete,
                    model="mistral-small-latest",
                    messages=[
                        {"role": "system", "content": "You are a professional banking document generator. You output only valid JSON with legally-dense and technically-accurate content. BE CONCISE if you hit API limits."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.15,
                    max_tokens=8192,
                    response_format={"type": "json_object"}
                )
            )
            return json.loads(response.choices[0].message.content.strip())
        except Exception as e:
            logging.error(f"Generation Error for Section {section['num']}: {e}")
            return {
                "section_id": section['num'], "title": section['title'],
                "executive_summary": "Drafting unavailable.", "clauses": [],
                "data_tables": [], "mandatory_regulatory_verbatim": ""
            }
