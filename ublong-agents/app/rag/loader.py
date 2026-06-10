import os
from pathlib import Path
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.schema import Document
from dotenv import load_dotenv

load_dotenv()

CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./data/chroma_db")
LEGAL_DOCS_DIR = os.getenv("LEGAL_DOCS_DIR", "./data/legal_docs")

_vectorstore: Chroma | None = None
_embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)


def get_vectorstore() -> Chroma | None:
    return _vectorstore


def _load_file(file_path: Path) -> list[Document]:
    country_code = file_path.stem.upper()
    text = file_path.read_text(encoding="utf-8")
    chunks = _splitter.split_text(text)
    return [
        Document(
            page_content=chunk,
            metadata={"country_code": country_code, "source": str(file_path)},
        )
        for chunk in chunks
    ]


async def load_all_documents() -> None:
    global _vectorstore

    docs_path = Path(LEGAL_DOCS_DIR)
    docs_path.mkdir(parents=True, exist_ok=True)
    Path(CHROMA_PERSIST_DIR).mkdir(parents=True, exist_ok=True)

    files = list(docs_path.glob("*.md")) + list(docs_path.glob("*.txt"))

    if not files:
        print(f"[RAG] No legal documents in {LEGAL_DOCS_DIR}. Initialising empty vector store.")
        _vectorstore = Chroma(
            persist_directory=CHROMA_PERSIST_DIR,
            embedding_function=_embeddings,
        )
        return

    all_docs: list[Document] = []
    for f in files:
        all_docs.extend(_load_file(f))

    _vectorstore = Chroma.from_documents(
        documents=all_docs,
        embedding=_embeddings,
        persist_directory=CHROMA_PERSIST_DIR,
    )
    print(f"[RAG] Loaded {len(all_docs)} chunks from {len(files)} documents.")


async def reload_document(country_code: str) -> None:
    global _vectorstore

    docs_path = Path(LEGAL_DOCS_DIR)
    file_path = docs_path / f"{country_code.upper()}.md"
    if not file_path.exists():
        file_path = docs_path / f"{country_code.upper()}.txt"
    if not file_path.exists():
        raise FileNotFoundError(f"No legal document for country code: {country_code}")

    if _vectorstore:
        existing = _vectorstore.get(where={"country_code": country_code.upper()})
        if existing["ids"]:
            _vectorstore.delete(ids=existing["ids"])

    new_docs = _load_file(file_path)

    if _vectorstore:
        _vectorstore.add_documents(new_docs)
    else:
        _vectorstore = Chroma.from_documents(
            documents=new_docs,
            embedding=_embeddings,
            persist_directory=CHROMA_PERSIST_DIR,
        )

    print(f"[RAG] Reloaded {len(new_docs)} chunks for {country_code.upper()}.")
