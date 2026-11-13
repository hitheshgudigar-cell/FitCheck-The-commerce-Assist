import json
import sys
from pathlib import Path
from typing import Dict, Any, List

BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from app.agent.orchestrator import Orchestrator

QUESTIONS_FILE = Path(__file__).resolve().parent / "questions.json"

def run_evaluation():
    if not QUESTIONS_FILE.exists():
        print(f"Error: {QUESTIONS_FILE} not found!")
        return

    with open(QUESTIONS_FILE, "r", encoding="utf-8") as f:
        questions: List[Dict[str, Any]] = json.load(f)

    print(f"Loaded {len(questions)} evaluation cases from {QUESTIONS_FILE}\n")

    orchestrator = Orchestrator()

    total_cases = len(questions)
    verdict_correct = 0
    citation_correct = 0
    clarification_correct = 0
    confident_wrong = 0

    category_stats = {}

    for idx, case in enumerate(questions, 1):
        q_id = case["id"]
        category = case["category"]
        prod_id = case.get("product_id")
        question_text = case["question"]
        expected_verdict = case["expected_verdict"]
        expected_doc = case["expected_citation_doc"]
        session_context = case.get("session_context", {})

        if category not in category_stats:
            category_stats[category] = {
                "total": 0,
                "correct_verdict": 0,
                "confident_wrong": 0,
                "citation_correct": 0,
                "clarification_correct": 0
            }
        stats = category_stats[category]
        stats["total"] += 1

        sess_id = f"eval_{q_id}"
        if session_context:
            orchestrator.update_session_profile(sess_id, session_context)

        ans = orchestrator.run(
            session_id=sess_id,
            message=question_text,
            explicit_product_id=prod_id
        )

        actual_verdict = ans.verdict
        actual_docs = [c.doc for c in ans.citations]

        # 1. Verdict check
        is_verdict_match = (actual_verdict == expected_verdict)
        if is_verdict_match:
            verdict_correct += 1
            stats["correct_verdict"] += 1
        else:
            if actual_verdict in ["YES", "NO"]:
                confident_wrong += 1
                stats["confident_wrong"] += 1
                print(f"  [CONFIDENT WRONG] {q_id} ({category}): Expected {expected_verdict}, got {actual_verdict}")
                print(f"    Q: {question_text}")
                print(f"    Reason: {ans.explanation}\n")
            else:
                print(f"  [MISMATCH] {q_id} ({category}): Expected {expected_verdict}, got {actual_verdict}")
                print(f"    Q: {question_text}")
                print(f"    Explanation: {ans.explanation}")
                print(f"    Clarifying Question: {ans.clarifying_question}\n")

        # 2. Citation check
        is_cite_match = any(expected_doc in d for d in actual_docs) if actual_docs else False
        if is_cite_match or not expected_doc:
            citation_correct += 1
            stats["citation_correct"] += 1
        else:
            print(f"  [CITE MISMATCH] {q_id} ({category}): Expected doc '{expected_doc}', got {actual_docs}")

        # 3. Clarification check
        if expected_verdict == "CANNOT_CONFIRM" and "clarification" in case.get("notes", "").lower():
            if ans.clarifying_question is not None:
                clarification_correct += 1
                stats["clarification_correct"] += 1
        else:
            clarification_correct += 1
            stats["clarification_correct"] += 1

    print("\n" + "=" * 80)
    print("                    FITCHECK EVALUATION REPORT")
    print("=" * 80)
    print(f"{'Category':<24} | {'Total':<6} | {'Accuracy':<10} | {'Confident-Wrong':<16} | {'Citations':<10}")
    print("-" * 80)

    for cat, s in category_stats.items():
        cat_acc = f"{(s['correct_verdict'] / s['total']) * 100:.1f}%"
        cat_cw = f"{s['confident_wrong']} ({(s['confident_wrong'] / s['total']) * 100:.1f}%)"
        cat_cite = f"{(s['citation_correct'] / s['total']) * 100:.1f}%"
        print(f"{cat:<24} | {s['total']:<6} | {cat_acc:<10} | {cat_cw:<16} | {cat_cite:<10}")

    print("-" * 80)
    overall_acc = (verdict_correct / total_cases) * 100
    overall_cw_rate = (confident_wrong / total_cases) * 100
    overall_cite_acc = (citation_correct / total_cases) * 100

    print(f"{'OVERALL TOTALS':<24} | {total_cases:<6} | {overall_acc:.1f}%     | {confident_wrong} ({overall_cw_rate:.1f}%)         | {overall_cite_acc:.1f}%")
    print("=" * 80)

    print("\nKey Non-Negotiable Metrics:")
    print(f"- Verdict Accuracy:       {overall_acc:.1f}% ({verdict_correct}/{total_cases})")
    print(f"- Confident-Wrong Rate:   {overall_cw_rate:.2f}% ({confident_wrong}/{total_cases}) [TARGET: 0%]")
    print(f"- Citation Correctness:   {overall_cite_acc:.1f}% ({citation_correct}/{total_cases})")

    if confident_wrong == 0:
        print("\nSUCCESS: Confident-wrong rate is 0.00%. All answers are safely grounded.")
    else:
        print(f"\nFAILURE: {confident_wrong} confident-wrong answers detected. Need to tune rule engine.")
        sys.exit(1)

if __name__ == "__main__":
    run_evaluation()
