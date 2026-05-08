import pypdf
import sys

def extract_text(pdf_path, output_path):
    reader = pypdf.PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(text)

if __name__ == "__main__":
    if len(sys.argv) > 2:
        extract_text(sys.argv[1], sys.argv[2])
