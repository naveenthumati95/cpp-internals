import json

transcript_path = "/Users/abhirajsingh/.gemini/antigravity-ide/brain/f13fb7d5-1277-4d90-b311-c7f1c1821844/.system_generated/logs/transcript_full.jsonl"

full_diff = ""
with open(transcript_path, "r") as f:
    for line in f:
        data = json.loads(line)
        content = data.get("content", "")
        # Look for the diff that contains the detailed construction timeline
        if "Here is the exact, point-wise timeline" in content:
            full_diff = content

if not full_diff:
    print("Could not find the diff.")
    exit(1)

# Parse the diff for the inserted lines
raw_lines = []
in_diff = False
for line in full_diff.split("\n"):
    if line.startswith("@@"):
        in_diff = True
        continue
    if in_diff:
        if line.startswith("+") and not line.startswith("+++"):
            raw_lines.append(line[1:])

text = "\n".join(raw_lines)

# We want the text starting from "Important points:" up to "Pure Virtual Method:"
start_idx = text.find("Important points:")
end_idx = text.find("Pure Virtual Method:")
if start_idx != -1 and end_idx != -1:
    detailed_rules = text[start_idx:end_idx].strip()
    with open("detailed_rules.txt", "w") as f:
        f.write(detailed_rules)
    print("Extracted detailed rules.")
else:
    print("Could not find bounds.")
