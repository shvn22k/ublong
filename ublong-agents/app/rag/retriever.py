from langchain_community.vectorstores import Chroma
from app.rag.loader import get_vectorstore

# Legal docs are stored per country as BD.md / LB.md / KE.md, so each chunk is
# tagged with the 2-letter code (BD/LB/KE). Cases, however, carry the full
# country name (e.g. "Bangladesh"). Normalise either form to the file code so
# the metadata filter actually matches.
_COUNTRY_TO_CODE = {
    "BD": "BD",
    "BANGLADESH": "BD",
    "LB": "LB",
    "LEBANON": "LB",
    "KE": "KE",
    "KENYA": "KE",
}


def normalize_country_code(country: str) -> str:
    if not country:
        return ""
    return _COUNTRY_TO_CODE.get(country.strip().upper(), country.strip().upper())


def get_retriever(country_code: str):
    vs: Chroma | None = get_vectorstore()
    if vs is None:
        return None
    code = normalize_country_code(country_code)
    return vs.as_retriever(
        search_kwargs={
            "k": 5,
            "filter": {"country_code": code},
        }
    )
