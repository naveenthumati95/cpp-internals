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
            # We want the one that has the complete text, not the small one
            if "Step 5:" in content:
                break

with open("temp_full_diff.txt", "w") as out:
    out.write(full_diff)
print(f"Extracted diff length: {len(full_diff)}")

# Parse the diff
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
# Find the exact chunk we need (from Logic of virtualisation-> to the end of their logic)
# It starts at "Logic of virtualisation->"
idx = text.find("Logic of virtualisation->")
if idx != -1:
    text = text[idx:]

# The end of their logic is right before "Important points:" or "*Last updated"
end_idx1 = text.find("Important points:")
end_idx2 = text.find("*Last updated")
end_idx = -1
if end_idx1 != -1: end_idx = end_idx1
elif end_idx2 != -1: end_idx = end_idx2

if end_idx != -1:
    text = text[:end_idx].strip()

# Now we have the FULL text!
# Let's do some basic markdown formatting
text = text.replace("Logic of virtualisation->", "## The Logic of Virtualization (Detailed Step-by-Step)\n")
text = re.sub(r"(Step \d+:.*?)\n", r"### \1\n", text)
text = text.replace("Complete Flow Diagram", "### Complete Flow Diagram")
text = text.replace("Key Points to Remember", "### Key Points to Remember")

with open("/Users/abhirajsingh/cpp-internals/topics/02-oops-intro.md", "r") as f:
    content = f.read()

# Replace the current broken block
# The broken block starts at "## The Logic of Virtualization (Detailed Step-by-Step)"
# And ends at "## Important Rules for Virtual Functions"
start_marker = "## The Logic of Virtualization"
end_marker = "## Important Rules for Virtual Functions"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + text + "\n\n" + content[end_idx:]
    with open("/Users/abhirajsingh/cpp-internals/topics/02-oops-intro.md", "w") as f:
        f.write(new_content)
    print("Successfully replaced the file with the full content!")
else:
    print("Could not find markers in file.")
