import fitz
import re
from pathlib import Path


def clean_text(text):

    # Normalize line endings
    text = text.replace("\r", "\n")

    # Replace tabs
    text = text.replace("\t", " ")

    # Remove standalone bullet symbols
    text = re.sub(r'^\s*[•▪■◦·]\s*$', '', text, flags=re.MULTILINE)

    # Remove repeated blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)

    # Remove repeated spaces
    text = re.sub(r'[ ]{2,}', ' ', text)

    return text.strip()


def extract_text_from_pdf(pdf_path):

    pdf_path = Path(pdf_path)

    doc = fitz.open(pdf_path)

    text = ""

    for page in doc:

        text += page.get_text("text")

    doc.close()

    return clean_text(text)