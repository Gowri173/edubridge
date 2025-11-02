import docx2txt
import PyPDF2
import io


def extract_text(file_bytes, filename):
    if filename.endswith(".pdf"):
        reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        return " ".join([p.extract_text() or "" for p in reader.pages])
    elif filename.endswith(".docx"):
        return docx2txt.process(io.BytesIO(file_bytes))
    else:
        return file_bytes.decode("utf-8", errors="ignore")
