import pypdf
import sys

# Reconfigure stdout to use UTF-8 just in case
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

pdf_path = "CLASS-9-Computer-Q.BANK_.pdf"
reader = pypdf.PdfReader(pdf_path)

output_lines = []
output_lines.append(f"Total pages: {len(reader.pages)}")

# Print out some snippets or search for keywords like "evaluate", "expression", "System.out.println", "char", "double"
keywords = ["evaluate", "expression", "system.out", "operators", "precedence", "value of", "predict", "output", "casting", "widening", "truncate"]

found_lines = []
for i, page in enumerate(reader.pages):
    text = page.extract_text()
    for line in text.split("\n"):
        if any(kw in line.lower() for kw in keywords):
            found_lines.append((i + 1, line.strip()))

output_lines.append(f"Found {len(found_lines)} matching lines. Writing to file.")

with open("scratch/extracted_lines.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(output_lines) + "\n\n")
    for pg, line in found_lines:
        f.write(f"[Page {pg}] {line}\n")

print("Successfully wrote extracted lines to scratch/extracted_lines.txt")
