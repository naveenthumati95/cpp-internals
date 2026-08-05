import re

with open("temp_diff.txt", "r") as f:
    lines = f.readlines()

raw_lines = []
in_diff = False
for line in lines:
    if line.startswith("@@"):
        in_diff = True
        continue
    if in_diff:
        if line.startswith("+") and not line.startswith("+++"):
            raw_lines.append(line[1:])
        elif line.startswith(" "):
            pass # context line
        elif line.startswith("-"):
            pass

formatted = []
in_code_block = False

for line in raw_lines:
    stripped = line.strip()
    
    # Check for steps
    if stripped.startswith("Step ") and ":" in stripped:
        formatted.append("\n### " + stripped + "\n")
        continue
    if stripped == "Complete Flow Diagram" or stripped == "Key Points to Remember":
        formatted.append("\n### " + stripped + "\n")
        continue

    # Simple heuristic to wrap C++ code
    if stripped.startswith("class ") or stripped.startswith("Animal* p") or stripped == "p->sound();":
        if not in_code_block:
            formatted.append("\n```cpp\n")
            in_code_block = True
    
    if in_code_block and stripped in ["", "Question:", "Output:", "Why?"]:
        # end of code block
        formatted.append("```\n\n")
        in_code_block = False

    formatted.append(line)

if in_code_block:
    formatted.append("```\n")

with open("formatted_long_text.md", "w") as f:
    f.writelines(formatted)

print("Formatted text written.")
