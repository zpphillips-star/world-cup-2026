import os, json, re

proj = r"C:\Users\zaphilli\.claw\tmp\wc2026"
nextDir = os.path.join(proj, ".next")
pkgs = set()

pattern = re.compile(r"""from ['"]([^./][^'"]+)['"]""")

for root, dirs, files in os.walk(nextDir):
    for fn in files:
        if fn.endswith(".js.map"):
            try:
                with open(os.path.join(root, fn), encoding="utf-8") as f:
                    sm = json.load(f)
                if sm.get("sourcesContent"):
                    for cnt in sm["sourcesContent"]:
                        if not cnt:
                            continue
                        for m in pattern.finditer(cnt):
                            pkg = m.group(1)
                            if pkg.startswith("next/") or pkg.startswith("react"):
                                continue
                            parts = pkg.split("/")
                            if pkg.startswith("@"):
                                pkg = "/".join(parts[:2])
                            else:
                                pkg = parts[0]
                            pkgs.add(pkg)
            except Exception:
                pass

print("External packages:")
for p in sorted(pkgs):
    print(p)
