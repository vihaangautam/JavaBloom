import pypdf
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

pdf_path = "CLASS-9-Computer-Q.BANK_.pdf"
reader = pypdf.PdfReader(pdf_path)

with open("scratch/pages_60_69.txt", "w", encoding="utf-8") as f:
    for page_num in range(60, 69): # pages 61 to 69 (0-indexed 60 to 68)
        if page_num < len(reader.pages):
            f.write(f"--- PAGE {page_num + 1} ---\n")
            f.write(reader.pages[page_num].extract_text())
            f.write("\n\n")

print("Wrote pages 60-69 to scratch/pages_60_69.txt")
