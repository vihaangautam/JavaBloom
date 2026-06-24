import fitz
import sys
sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open(r'c:\Users\ASUS\OneDrive\Desktop\vscProgram\JavaBloom\CLASS-9-Computer-Q.BANK_.pdf')

# Extract all text looking for output-type questions and chapter markers
all_text = ""
for i in range(len(doc)):
    text = doc[i].get_text()
    cleaned = text.encode('ascii', 'replace').decode('ascii')
    all_text += f"\n=== PAGE {i+1} ===\n{cleaned}"

# Save to file for analysis
with open(r'c:\Users\ASUS\OneDrive\Desktop\vscProgram\JavaBloom\scratch\pdf_full_text.txt', 'w', encoding='utf-8') as f:
    f.write(all_text)

# Find chapters and predict-output / trace questions
import re
chapter_markers = re.findall(r'(CH\s*\d+|CHAPTER\s*\d+|Chapter\s*\d+)[:\s]*(.*?)(?:\n|$)', all_text, re.IGNORECASE)
print("CHAPTER MARKERS FOUND:")
for m in chapter_markers:
    print(f"  {m[0]}: {m[1].strip()[:80]}")

print("\n\nOUTPUT QUESTION PATTERNS FOUND:")
output_patterns = re.findall(r'(Predict the output|find the output|What.{0,20}output|System\.out\.print)', all_text, re.IGNORECASE)
print(f"  Total output-related mentions: {len(output_patterns)}")

# Find for/while/if code blocks
loop_patterns = re.findall(r'(for\s*\(.*?\)|while\s*\(.*?\)|do\s*\{)', all_text)
print(f"  Total loop constructs: {len(loop_patterns)}")
