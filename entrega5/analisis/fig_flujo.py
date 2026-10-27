"""Figura del flujo de trabajo del equipo con GitHub, dos agentes de programación y cinco IA auditoras."""
import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

FIG = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "figuras")
NAVY, CYAN, INK, MUTED, RED = "#2B4C9B", "#0E8FC9", "#1F2A44", "#6B7280", "#C0392B"
ALT, SOFT, WARM = "#F3F6FA", "#E3F3FB", "#FDF3E1"
plt.rcParams.update({"font.family": "Liberation Sans"})


def caja(ax, x, y, w, h, titulo, texto, borde, fondo, fs=8.6):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.005,rounding_size=0.012",
                                linewidth=1.3, edgecolor=borde, facecolor=fondo))
    ax.text(x + 0.012, y + h - 0.022, titulo, ha="left", va="top", fontsize=9.6, fontweight="bold", color=borde)
    ax.text(x + 0.012, y + h - 0.075, texto, ha="left", va="top", fontsize=fs, color=INK, linespacing=1.35)


def flecha(ax, x1, y1, x2, y2, color=MUTED, estilo="-|>", ls="-"):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1), arrowprops=dict(arrowstyle=estilo, color=color, lw=1.3, linestyle=ls))


fig, ax = plt.subplots(figsize=(13, 6.2))
ax.set_xlim(0, 1)
ax.set_ylim(0, 1)
ax.axis("off")

caja(ax, 0.005, 0.40, 0.17, 0.26, "Equipo (3 personas)", "Define el problema y las\nreglas; encarga, revisa y\ndecide cada integración;\nresponde en la defensa", INK, "#FFFFFF")
caja(ax, 0.215, 0.62, 0.25, 0.30, "Claude Code · rama claude/…", "Simulador, modelo, prototipo,\nvalidador e informes.\n15 commits desde el 3 de octubre;\ncada cifra sale de un script", NAVY, ALT)
caja(ax, 0.215, 0.12, 0.25, 0.30, "Codex · rama codex/mejoras-finales", "Ridge en el prototipo, 20 pruebas,\nGitHub Actions, Pages y una\nreproducción en clon limpio\n(2 commits, 26 y 27 de octubre)", CYAN, SOFT)
caja(ax, 0.51, 0.40, 0.16, 0.26, "Integración", "Revisión del diff, merge\nsin reescribir historia y\n20/20 pruebas en verde\n(commit e5fc3e1)", INK, "#FFFFFF")
caja(ax, 0.715, 0.40, 0.28, 0.26, "Entregables reproducibles", "Informe, presentación y prototipo\nregenerables con 5 comandos;\ntiempos medidos por Codex\n(dataset 59 s; modelo 818 s)", NAVY, ALT)
caja(ax, 0.51, 0.74, 0.485, 0.22, "Auditoría externa con 5 IA (sin acceso al repositorio)", "Gemini: cálculos · ChatGPT: código · DeepSeek: validación\nGrok: ataques · ChatGPT: respuestas del red team · Canva IA: infografía\nSus hallazgos entran como cambios trazables (por ejemplo, GroupKFold en c4a0832)", "#B7791F", WARM)
caja(ax, 0.51, 0.04, 0.485, 0.22, "Control de calidad automático", "pytest en cada push (simulador, fórmulas, estados, 12 salidas v3.1,\nred team, paridad Python/JavaScript) · validador de 9 criterios ·\nregla: ninguna cifra sin su script de origen", RED, "#FBEDEC")

flecha(ax, 0.175, 0.56, 0.213, 0.72)
flecha(ax, 0.175, 0.50, 0.213, 0.30)
flecha(ax, 0.467, 0.74, 0.508, 0.58)
flecha(ax, 0.467, 0.28, 0.508, 0.46)
flecha(ax, 0.672, 0.53, 0.713, 0.53)
flecha(ax, 0.75, 0.74, 0.62, 0.665, color="#B7791F", ls="--")
flecha(ax, 0.59, 0.26, 0.59, 0.398, color=RED, ls="--")
ax.text(0.34, 0.505, "trabajo en paralelo\nsobre el mismo repositorio", ha="center", va="center", fontsize=8.6, color=MUTED, style="italic")
fig.savefig(os.path.join(FIG, "fig_flujo_trabajo.png"), dpi=200, bbox_inches="tight", facecolor="white")
print("ok")
