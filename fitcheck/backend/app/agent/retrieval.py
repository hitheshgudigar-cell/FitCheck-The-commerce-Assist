import re
from pathlib import Path
from typing import List, Dict, Any, Optional
from rank_bm25 import BM25Okapi
from app.models import Citation

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
DOCS_DIR = DATA_DIR / "docs"

class DocChunk:
    def __init__(self, doc_id: str, page: int, text: str):
        self.doc_id = doc_id
        self.page = page
        self.text = text.strip()
        self.tokens = self._tokenize(self.text)

    @staticmethod
    def _tokenize(text: str) -> List[str]:
        # Lowercase alphanumeric tokens
        return re.findall(r"\b[a-zA-Z0-9_-]+\b", text.lower())

class DocRetriever:
    def __init__(self, docs_dir: Path = DOCS_DIR):
        self.docs_dir = docs_dir
        self.chunks: List[DocChunk] = []
        self._doc_map: Dict[str, List[DocChunk]] = {}
        self.bm25: Optional[BM25Okapi] = None
        self._load_and_index()

    def _load_and_index(self):
        self.chunks = []
        self._doc_map = {}

        if not self.docs_dir.exists():
            return

        for doc_path in self.docs_dir.glob("*.txt"):
            doc_id = doc_path.stem
            try:
                content = doc_path.read_text(encoding="utf-8")
            except Exception:
                continue

            # Split by [page N]
            pages = re.split(r"\[page\s*([0-9]+)\]", content, flags=re.IGNORECASE)
            
            # pages[0] might be empty before first marker
            # Then pairs of (page_num, text)
            if len(pages) > 1:
                i = 1
                while i < len(pages):
                    try:
                        p_num = int(pages[i])
                        p_text = pages[i+1].strip()
                        # Split long pages into paragraphs or sections
                        paragraphs = [p.strip() for p in p_text.split("\n\n") if p.strip()]
                        for para in paragraphs:
                            chunk = DocChunk(doc_id=doc_id, page=p_num, text=para)
                            self.chunks.append(chunk)
                            self._doc_map.setdefault(doc_id, []).append(chunk)
                    except (ValueError, IndexError):
                        pass
                    i += 2
            else:
                chunk = DocChunk(doc_id=doc_id, page=1, text=content.strip())
                self.chunks.append(chunk)
                self._doc_map.setdefault(doc_id, []).append(chunk)

        if self.chunks:
            tokenized_corpus = [c.tokens for c in self.chunks]
            self.bm25 = BM25Okapi(tokenized_corpus)

    def retrieve(
        self,
        query: str,
        doc_ids: Optional[List[str]] = None,
        top_k: int = 3
    ) -> List[Citation]:
        """Fetch top-k chunks from authoritative docs only, scoped to doc_ids if specified."""
        if not self.chunks:
            return []

        query_tokens = DocChunk._tokenize(query)
        if not query_tokens:
            # If query is empty or stopwords, return first chunk of target doc
            if doc_ids and doc_ids[0] in self._doc_map and self._doc_map[doc_ids[0]]:
                c = self._doc_map[doc_ids[0]][0]
                return [Citation(doc=c.doc_id, page=c.page, snippet=c.text[:280])]
            return []

        # If doc_ids are provided, filter candidate chunks
        candidate_indices = range(len(self.chunks))
        if doc_ids:
            allowed = set(doc_ids)
            candidate_indices = [i for i, c in enumerate(self.chunks) if c.doc_id in allowed]
            if not candidate_indices:
                return []

        # Score chunks
        if self.bm25:
            scores = self.bm25.get_scores(query_tokens)
        else:
            # Fallback simple keyword match
            q_set = set(query_tokens)
            scores = [len(q_set.intersection(set(c.tokens))) for c in self.chunks]

        scored_candidates = [(i, scores[i]) for i in candidate_indices]
        scored_candidates.sort(key=lambda x: x[1], reverse=True)

        results = []
        for idx, score in scored_candidates[:top_k]:
            c = self.chunks[idx]
            # Truncate snippet to reasonable length
            snippet = c.text
            if len(snippet) > 350:
                snippet = snippet[:347] + "..."
            results.append(Citation(doc=c.doc_id, page=c.page, snippet=snippet))

        # Fallback if top score is 0 and doc_ids given
        if (not results or scored_candidates[0][1] <= 0) and doc_ids and doc_ids[0] in self._doc_map:
            for c in self._doc_map[doc_ids[0]][:top_k]:
                results.append(Citation(doc=c.doc_id, page=c.page, snippet=c.text[:300]))

        return results
