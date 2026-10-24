"""Lee el PDF renderizado y escribe paginas.json con la página de cada título del índice."""
import json, os, re, subprocess, sys
pdf = sys.argv[1]
n = int(re.search(r"Pages:\s+(\d+)", subprocess.run(["pdfinfo", pdf], capture_output=True, text=True).stdout).group(1))
pags = [subprocess.run(["pdftotext", "-f", str(i), "-l", str(i), "-layout", pdf, "-"], capture_output=True, text=True).stdout for i in range(1, n + 1)]
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "generar_final.js"), encoding="utf-8").read()
titulos = re.findall(r'\["([^"]+)", [01]\]', src.split("const INDICE = [")[1].split("];")[0])
res = {}
for t in titulos:
    for i, p in enumerate(pags[2:], start=3):
        if any(l.strip() == t for l in p.split("\n")):
            res[t] = i
            break
res["__fin_cuerpo"] = res["Referencias"] - 1
json.dump(res, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "paginas.json"), "w"), ensure_ascii=False)
print(res)
