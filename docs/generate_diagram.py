"""Generates docs/architecture.png and architecture.png (one-page diagram).

Run from the repo root:  python docs/generate_diagram.py   (needs matplotlib)
"""
import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

BG = '#0f172a'
CARD = '#1e293b'
TEXT = '#f8fafc'
MUTED = '#94a3b8'
BODY = '#cbd5e1'
C_BROWSER = '#818cf8'
C_FRONT = '#60a5fa'
C_BACK = '#34d399'
C_AI = '#a78bfa'
C_DB = '#fbbf24'
C_DOCKER = '#38bdf8'
C_GROQ = '#c084fc'


def box(ax, x, y, w, h, edge, face=CARD, lw=1.8, ls='-'):
    ax.add_patch(patches.FancyBboxPatch(
        (x, y), w, h, boxstyle="round,pad=0.0,rounding_size=0.15",
        facecolor=face, edgecolor=edge, linewidth=lw, linestyle=ls))


def card(ax, x, y, w, h, edge, title, subtitle, lines, face=CARD, title_color=None):
    box(ax, x, y, w, h, edge, face=face)
    cx = x + w / 2
    ax.text(cx, y + h - 0.35, title, ha='center', va='center',
            color=title_color or edge, fontsize=12, fontweight='bold')
    ax.text(cx, y + h - 0.72, subtitle, ha='center', va='center', color=MUTED, fontsize=9.5)
    for i, line in enumerate(lines):
        ax.text(cx, y + h - 1.15 - i * 0.33, '\u2022 ' + line, ha='center', va='center',
                color=BODY, fontsize=9)


def arrow(ax, p_from, p_to, color, both=False):
    ax.annotate("", xy=p_to, xytext=p_from,
                arrowprops=dict(arrowstyle="<->" if both else "->", color=color, lw=2.2))


def label(ax, x, y, text, color, face, ha='left'):
    ax.text(x, y, text, ha=ha, va='center', color=color, fontsize=8.5, fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.25', facecolor=face, edgecolor=color, lw=1))


def main():
    fig, ax = plt.subplots(figsize=(16, 9), dpi=200)
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 9)
    ax.axis('off')

    ax.text(8, 8.65, "NagaEd Hurdle Task \u2014 System Architecture", ha='center', va='center',
            color=TEXT, fontsize=19, fontweight='bold')
    ax.text(8, 8.25, "React frontend \u00b7 Node.js/Express API \u00b7 FastAPI AI service \u00b7 MySQL \u00b7 Groq",
            ha='center', va='center', color=MUTED, fontsize=11)

    # Browser (outside Docker)
    box(ax, 0.8, 6.55, 10.6, 1.15, C_BROWSER)
    ax.text(6.1, 7.35, "User's browser \u2014 React SPA (Vite build)", ha='center', va='center',
            color='#a5b4fc', fontsize=12, fontweight='bold')
    ax.text(6.1, 6.9, "Pages: /register  /login  /dashboard    \u2022    JWT kept in localStorage, sent as "
            "Authorization: Bearer", ha='center', va='center', color=BODY, fontsize=9)

    # Docker Compose boundary
    box(ax, 0.4, 0.4, 11.5, 5.4, C_DOCKER, face='#141e33', lw=2, ls='--')
    ax.text(0.65, 0.7, "Docker Compose network", ha='left', va='center',
            color=C_DOCKER, fontsize=10, fontweight='bold')

    # Services
    card(ax, 0.8, 3.1, 3.0, 2.3, C_FRONT, "frontend", "Nginx \u00b7 host port 80",
         ["Serves the built React app", "SPA routing (try_files)", "gzip + security headers"])
    card(ax, 4.4, 3.1, 3.2, 2.3, C_BACK, "backend", "Node.js / Express \u00b7 port 5000",
         ["POST /api/register", "POST /api/login", "GET /api/users/:id (JWT)", "Zod validation, non-root user"])
    card(ax, 8.2, 3.1, 3.2, 2.3, C_AI, "ai-service", "FastAPI \u00b7 port 8000",
         ["POST /api/suggest-username", "Pydantic models, /health, /docs", "Model + algorithmic fallback",
          "non-root user"])
    card(ax, 4.4, 0.55, 3.2, 1.95, C_DB, "mysql", "MySQL 8 \u00b7 port 3306",
         ["DB nagaed_assessment, table users", "UNIQUE(email), schema from init.sql", "Volume: nagaed_mysql_data"])

    # External: Groq
    card(ax, 12.6, 3.1, 3.0, 2.3, C_GROQ, "Groq Cloud API", "api.groq.com (external)",
         ["Model set by GROQ_MODEL", "JSON-mode chat completion", "Key from GROQ_API_KEY (.env)"],
         face='#2e1065', title_color='#e9d5ff')

    # Browser -> services (straight down, no crossings)
    arrow(ax, (2.3, 6.55), (2.3, 5.4), C_FRONT)
    label(ax, 2.45, 6.1, "HTTP GET  (HTML / JS / CSS)", '#93c5fd', '#172554')
    arrow(ax, (6.0, 6.55), (6.0, 5.4), C_BACK)
    label(ax, 6.15, 6.1, "REST + JSON  (/api/*)", C_BACK, '#064e3b')
    arrow(ax, (9.8, 6.55), (9.8, 5.4), C_AI)
    label(ax, 9.95, 6.1, "POST /api/suggest-username", '#c4b5fd', '#3b0764')

    # backend <-> mysql
    arrow(ax, (6.0, 3.1), (6.0, 2.5), C_DB, both=True)
    label(ax, 6.15, 2.8, "mysql:3306 \u00b7 pooled, parameterised SQL", C_DB, '#451a03')

    # ai-service -> groq
    arrow(ax, (11.4, 4.25), (12.6, 4.25), C_GROQ, both=True)
    label(ax, 12.0, 4.6, "HTTPS", '#e9d5ff', '#2e1065', ha='center')

    ax.text(8, 0.15, "Browser calls backend (:5000) and ai-service (:8000) directly; "
            "backend reaches MySQL by service name.", ha='center', va='center', color=MUTED, fontsize=9)

    os.makedirs('docs', exist_ok=True)
    for path in (os.path.join('docs', 'architecture.png'), 'architecture.png'):
        fig.savefig(path, dpi=200, facecolor=fig.get_facecolor(), bbox_inches='tight')
    plt.close(fig)
    print("Diagram written to docs/architecture.png and architecture.png")


if __name__ == "__main__":
    main()
