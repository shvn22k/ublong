from langchain_community.vectorstores import Chroma
from app.rag.loader import get_vectorstore


def get_retriever(country_code: str):
    vs: Chroma | None = get_vectorstore()
    if vs is None:
        return None
    return vs.as_retriever(
        search_kwargs={
            "k": 5,
            "filter": {"country_code": country_code.upper()},
        }
    )
