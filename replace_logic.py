import re

with open("temp_diff.txt", "r") as f:
    lines = f.readlines()

# Extract only the inserted lines
raw_lines = []
in_diff = False
for line in lines:
    if line.startswith("@@"):
        in_diff = True
        continue
    if in_diff:
        if line.startswith("+") and not line.startswith("+++"):
            raw_lines.append(line[1:])

# Let's do some basic clean formatting
text = "".join(raw_lines)
text = text.replace("Logic of virtualisation->", "## The Logic of Virtualization (Detailed Step-by-Step)\n")
text = re.sub(r"(Step \d+:.*?)\n", r"### \1\n", text)
text = text.replace("Complete Flow Diagram", "### Complete Flow Diagram")
text = text.replace("Key Points to Remember", "### Key Points to Remember")

with open("/Users/abhirajsingh/cpp-internals/topics/02-oops-intro.md", "r") as f:
    content = f.read()

# Find the section to replace
start_marker = "## The Logic of Virtualization (Under the Hood)"
end_marker = "## Important Rules for Virtual Functions"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + text + "\n\n" + content[end_idx:]
    with open("/Users/abhirajsingh/cpp-internals/topics/02-oops-intro.md", "w") as f:
        f.write(new_content)
    print("Replaced section successfully.")
else:
    print("Could not find markers.")
