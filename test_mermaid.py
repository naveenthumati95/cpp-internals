import urllib.request
import zlib
import base64

mermaid_code = """
flowchart LR
    classDef baseClass fill:#d5e8d4,stroke:#82b366,stroke-width:2px,color:#000
    classDef derivedB1 fill:#dae8fc,stroke:#6c8ebf,stroke-width:2px,color:#000
    classDef derivedB2 fill:#e1d5e7,stroke:#9673a6,stroke-width:2px,color:#000

    ClassA["Class A<br/>Attributes<br/>Methods"]:::baseClass

    subgraph B1_Def [Class B1]
        B1_InnerA["Class A<br/>Attributes<br/>Methods"]:::baseClass
        B1_Extra["Attributes<br/>Methods"]:::derivedB1
    end

    subgraph B2_Def [Class B2]
        B2_InnerA["Class A<br/>Attributes<br/>Methods"]:::baseClass
        B2_Extra["Attributes<br/>Methods"]:::derivedB2
    end

    ClassA ==>|Extend| B1_Def

    B1_InnerA -.->|DOWNCASTING| B1_Extra
    B1_Extra -.->|UPCASTING| B1_InnerA

    B1_Def ==>|SIDECASTING| B2_Def
    B2_Def ==>|SIDECAST| B1_Def
"""

def kroki_encode(text):
    compressed = zlib.compress(text.encode('utf-8'), 9)
    return base64.urlsafe_b64encode(compressed).decode('ascii')

payload = kroki_encode(mermaid_code)
url = f"https://kroki.io/mermaid/png/{payload}"

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as response, open('image/hierarchy_casting.png', 'wb') as out_file:
    out_file.write(response.read())

print("Done")
