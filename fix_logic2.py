import json
import re

transcript_path = "/Users/abhirajsingh/.gemini/antigravity-ide/brain/f13fb7d5-1277-4d90-b311-c7f1c1821844/.system_generated/logs/transcript_full.jsonl"

full_diff = ""
with open(transcript_path, "r") as f:
    for line in f:
        data = json.loads(line)
        content = data.get("content", "")
        if "The following changes were made by the USER" in content and "Logic of virtualisation->" in content:
            full_diff = content
            if "Step 5:" in content:
                break

raw_lines = []
in_diff = False
for line in full_diff.split("\n"):
    if line.startswith("@@"):
        in_diff = True
        continue
    if in_diff:
        if line.startswith("+") and not line.startswith("+++"):
            raw_lines.append(line[1:])
        elif line.startswith(" ") or line.startswith("-"):
            pass

text = "\n".join(raw_lines)
idx = text.find("Logic of virtualisation->")
if idx != -1: text = text[idx:]

end_idx = text.find("Important points:")
if end_idx == -1: end_idx = text.find("*Last updated")
if end_idx != -1: text = text[:end_idx].strip()

text = text.replace("Logic of virtualisation->", "## The Logic of Virtualization (Detailed Step-by-Step)\n")
text = re.sub(r"(Step \d+:.*?)\n", r"### \1\n", text)
text = text.replace("Complete Flow Diagram", "### Complete Flow Diagram")
text = text.replace("Key Points to Remember", "### Key Points to Remember")

with open("/Users/abhirajsingh/cpp-internals/topics/02-oops-intro.md", "r") as f:
    content = f.read()

start_marker = "### Step 1: The Problem Without virtual"
end_marker = "## Important Rules for Virtual Functions"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + text + "\n\n" + content[end_idx:]
    with open("/Users/abhirajsingh/cpp-internals/topics/02-oops-intro.md", "w") as f:
        f.write(new_content)
    print("Successfully replaced with the FULL content!")
else:
    print("Could not find markers.")
