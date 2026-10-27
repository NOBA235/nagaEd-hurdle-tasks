import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def create_architecture_diagram():
    # Create high-resolution figure (16:9 widescreen)
    fig, ax = plt.subplots(figsize=(16, 9), dpi=300)
    fig.patch.set_facecolor('#0f172a') # Dark slate background
    ax.set_facecolor('#0f172a')
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 9)
    ax.axis('off')

    # Color Palette
    TEXT_WHITE = '#f8fafc'
    TEXT_MUTED = '#94a3b8'
    BORDER_DOCKER = '#38bdf8'
    BG_CARD = '#1e293b'
    BG_SUB_CARD = '#0f172a'
    PRIMARY_BLUE = '#38bdf8'
    EMERALD_GREEN = '#34d399'
    PURPLE_AI = '#a78bfa'
    AMBER_DB = '#fbbf24'

    # Title & Header
    ax.text(8.0, 8.55, "NAGAED SOFTWARE DEVELOPER HURDLE TASK — SYSTEM ARCHITECTURE",
            ha='center', va='center', color=TEXT_WHITE, fontsize=18, fontweight='bold', family='sans-serif')
    ax.text(8.0, 8.22, "Full-Stack Inter-Service Communication, Container Networking, and Cloud AI Integration",
            ha='center', va='center', color=TEXT_MUTED, fontsize=11, family='sans-serif')

    # 1. Client Tier: Browser (Top Left/Center)
    browser_rect = patches.FancyBboxPatch((0.8, 4.4), 3.4, 3.2, boxstyle="round,pad=0.2,rounding_size=0.15",
                                         facecolor=BG_CARD, edgecolor='#818cf8', linewidth=2)
    ax.add_patch(browser_rect)
    ax.text(2.5, 7.3, "USER BROWSER / CLIENT", ha='center', va='center', color='#a5b4fc', fontsize=11, fontweight='bold')
    ax.text(2.5, 6.85, "React 19 SPA (Vite)", ha='center', va='center', color=TEXT_WHITE, fontsize=13, fontweight='bold')
    
    browser_sub = patches.FancyBboxPatch((1.1, 4.7), 2.8, 1.8, boxstyle="round,pad=0.1,rounding_size=0.1",
                                         facecolor=BG_SUB_CARD, edgecolor='#334155', linewidth=1)
    ax.add_patch(browser_sub)
    ax.text(2.5, 6.25, "• AuthContext (JWT State)", ha='center', va='center', color='#cbd5e1', fontsize=9.5)
    ax.text(2.5, 5.85, "• Pages: /register, /login, /dashboard", ha='center', va='center', color='#cbd5e1', fontsize=9)
    ax.text(2.5, 5.45, "• api.js (Axios + Bearer Token)", ha='center', va='center', color='#cbd5e1', fontsize=9.5)
    ax.text(2.5, 5.05, "• ai.service.js (Username Suggester)", ha='center', va='center', color='#cbd5e1', fontsize=9.5)

    # 2. Docker Compose Network Container Boundary
    docker_box = patches.FancyBboxPatch((4.8, 0.6), 10.4, 7.0, boxstyle="round,pad=0.2,rounding_size=0.2",
                                        facecolor='#141e33', edgecolor=BORDER_DOCKER, linewidth=2, linestyle='--')
    ax.add_patch(docker_box)
    ax.text(5.2, 7.35, "DOCKER COMPOSE NETWORK  [ nagaed-network ]", ha='left', va='center',
            color=BORDER_DOCKER, fontsize=11, fontweight='bold')

    # Container 1: Frontend (Nginx)
    fe_rect = patches.FancyBboxPatch((5.2, 4.6), 2.8, 2.3, boxstyle="round,pad=0.15,rounding_size=0.15",
                                    facecolor=BG_CARD, edgecolor='#60a5fa', linewidth=1.5)
    ax.add_patch(fe_rect)
    ax.text(6.6, 6.6, "frontend (Nginx)", ha='center', va='center', color='#93c5fd', fontsize=12, fontweight='bold')
    ax.text(6.6, 6.2, "Port: 80 / 5173", ha='center', va='center', color=TEXT_MUTED, fontsize=9.5)
    ax.text(6.6, 5.75, "• Multi-stage Node/Nginx", ha='center', va='center', color='#cbd5e1', fontsize=9)
    ax.text(6.6, 5.40, "• SPA Routing (try_files)", ha='center', va='center', color='#cbd5e1', fontsize=9)
    ax.text(6.6, 5.05, "• Static Gzip & Security Headers", ha='center', va='center', color='#cbd5e1', fontsize=9)

    # Container 2: Backend (Node.js/Express)
    be_rect = patches.FancyBboxPatch((8.6, 4.2), 3.0, 2.7, boxstyle="round,pad=0.15,rounding_size=0.15",
                                    facecolor=BG_CARD, edgecolor=EMERALD_GREEN, linewidth=1.5)
    ax.add_patch(be_rect)
    ax.text(10.1, 6.6, "backend (Express API)", ha='center', va='center', color=EMERALD_GREEN, fontsize=12, fontweight='bold')
    ax.text(10.1, 6.2, "Port: 5000", ha='center', va='center', color=TEXT_MUTED, fontsize=9.5)
    ax.text(10.1, 5.75, "• POST /api/register (bcrypt)", ha='center', va='center', color='#cbd5e1', fontsize=9)
    ax.text(10.1, 5.40, "• POST /api/login (JWT Sign)", ha='center', va='center', color='#cbd5e1', fontsize=9)
    ax.text(10.1, 5.05, "• GET /api/users/:id (AuthZ IDOR)", ha='center', va='center', color='#cbd5e1', fontsize=9)
    ax.text(10.1, 4.70, "• Zod Validation & Central Errors", ha='center', va='center', color='#cbd5e1', fontsize=9)
    ax.text(10.1, 4.40, "• User: node (Non-root)", ha='center', va='center', color='#94a3b8', fontsize=8.5)

    # Container 3: Database (MySQL 8)
    db_rect = patches.FancyBboxPatch((8.6, 1.0), 3.0, 2.3, boxstyle="round,pad=0.15,rounding_size=0.15",
                                    facecolor=BG_CARD, edgecolor=AMBER_DB, linewidth=1.5)
    ax.add_patch(db_rect)
    ax.text(10.1, 3.0, "mysql (MySQL 8.0)", ha='center', va='center', color=AMBER_DB, fontsize=12, fontweight='bold')
    ax.text(10.1, 2.65, "Port: 3306", ha='center', va='center', color=TEXT_MUTED, fontsize=9.5)
    ax.text(10.1, 2.25, "• DB: nagaed_assessment", ha='center', va='center', color='#cbd5e1', fontsize=9)
    ax.text(10.1, 1.90, "• Table: users (InnoDB, utf8mb4)", ha='center', va='center', color='#cbd5e1', fontsize=9)
    ax.text(10.1, 1.55, "• UNIQUE (email), PRIMARY KEY (id)", ha='center', va='center', color='#cbd5e1', fontsize=9)
    ax.text(10.1, 1.25, "• Volume: nagaed_mysql_data", ha='center', va='center', color='#fde68a', fontsize=8.5)

    # Container 4: AI Microservice (FastAPI + Groq)
    ai_rect = patches.FancyBboxPatch((12.1, 4.2), 2.8, 2.7, boxstyle="round,pad=0.15,rounding_size=0.15",
                                    facecolor=BG_CARD, edgecolor=PURPLE_AI, linewidth=1.5)
    ax.add_patch(ai_rect)
    ax.text(13.5, 6.6, "ai-service (FastAPI)", ha='center', va='center', color=PURPLE_AI, fontsize=12, fontweight='bold')
    ax.text(13.5, 6.2, "Port: 8000", ha='center', va='center', color=TEXT_MUTED, fontsize=9.5)
    ax.text(13.5, 5.75, "• POST /api/suggest-username", ha='center', va='center', color='#cbd5e1', fontsize=9)
    ax.text(13.5, 5.40, "• Pydantic Request & Response", ha='center', va='center', color='#cbd5e1', fontsize=9)
    ax.text(13.5, 5.05, "• GET /health & /docs (Swagger)", ha='center', va='center', color='#cbd5e1', fontsize=9)
    ax.text(13.5, 4.70, "• Retry & Algorithmic Fallback", ha='center', va='center', color='#cbd5e1', fontsize=9)
    ax.text(13.5, 4.40, "• User: appuser (Non-root)", ha='center', va='center', color='#94a3b8', fontsize=8.5)

    # 3. External Cloud: Groq API
    groq_rect = patches.FancyBboxPatch((12.1, 1.0), 2.8, 2.3, boxstyle="round,pad=0.15,rounding_size=0.15",
                                      facecolor='#2e1065', edgecolor='#c084fc', linewidth=1.5)
    ax.add_patch(groq_rect)
    ax.text(13.5, 3.0, "GROQ CLOUD API", ha='center', va='center', color='#e9d5ff', fontsize=12, fontweight='bold')
    ax.text(13.5, 2.65, "https://api.groq.com", ha='center', va='center', color='#d8b4fe', fontsize=9.5)
    ax.text(13.5, 2.25, "• Model: llama-3.3-70b-versatile", ha='center', va='center', color='#cbd5e1', fontsize=9)
    ax.text(13.5, 1.90, "• JSON Mode (Structured Output)", ha='center', va='center', color='#cbd5e1', fontsize=9)
    ax.text(13.5, 1.55, "• Low-Latency LPU Inference", ha='center', va='center', color='#cbd5e1', fontsize=9)
    ax.text(13.5, 1.25, "• GROQ_API_KEY (Bearer Secret)", ha='center', va='center', color='#fde68a', fontsize=8.5)

    # Arrows & Connections
    # 1. Browser -> Frontend Nginx (Static HTML/JS bundle)
    ax.annotate("", xy=(5.2, 5.8), xytext=(4.2, 5.8),
                arrowprops=dict(arrowstyle="->", color='#93c5fd', lw=2))
    ax.text(4.7, 6.05, "HTTP GET", ha='center', va='center', color='#93c5fd', fontsize=8, fontweight='bold')

    # 2. Browser -> Backend API (REST calls with JWT)
    ax.annotate("", xy=(8.6, 5.6), xytext=(4.2, 5.4),
                arrowprops=dict(arrowstyle="->", color=EMERALD_GREEN, lw=2.2))
    ax.text(6.4, 4.25, "HTTP REST / JSON\n[ Authorization: Bearer <token> ]",
            ha='center', va='center', color=EMERALD_GREEN, fontsize=8.5, fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.2', facecolor='#064e3b', edgecolor=EMERALD_GREEN, lw=1))

    # 3. Browser -> FastAPI AI (Username generation)
    ax.annotate("", xy=(12.1, 5.6), xytext=(4.2, 5.1),
                arrowprops=dict(arrowstyle="->", color=PURPLE_AI, lw=2, linestyle='-'))
    ax.text(8.2, 7.6, "POST /api/suggest-username { interests: [...] }",
            ha='center', va='center', color=PURPLE_AI, fontsize=8.5, fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.2', facecolor='#3b0764', edgecolor=PURPLE_AI, lw=1))

    # 4. Backend -> MySQL (Internal Connection Pool)
    ax.annotate("", xy=(10.1, 3.3), xytext=(10.1, 4.2),
                arrowprops=dict(arrowstyle="<->", color=AMBER_DB, lw=2.2))
    ax.text(10.1, 3.75, "TCP: mysql:3306 (Connection Pool)\nPrepared SQL Statements (?)",
            ha='center', va='center', color=AMBER_DB, fontsize=8.5, fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.2', facecolor='#451a03', edgecolor=AMBER_DB, lw=1))

    # 5. FastAPI -> Groq API (Outbound HTTPS)
    ax.annotate("", xy=(13.5, 3.3), xytext=(13.5, 4.2),
                arrowprops=dict(arrowstyle="<->", color='#c084fc', lw=2.2))
    ax.text(13.5, 3.75, "HTTPS / TLS 1.3\nAuthorization: Bearer <GROQ_KEY>",
            ha='center', va='center', color='#e9d5ff', fontsize=8.5, fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.2', facecolor='#2e1065', edgecolor='#c084fc', lw=1))

    # Footer note
    ax.text(8.0, 0.25, "Single Monorepo Architecture | Docker Compose Containerised | Full Non-Root Security | Production Verified",
            ha='center', va='center', color=TEXT_MUTED, fontsize=9.5, family='sans-serif')

    os.makedirs('docs', exist_ok=True)
    diagram_path = os.path.join('docs', 'architecture.png')
    root_diagram_path = 'architecture.png'
    
    plt.tight_layout()
    plt.savefig(diagram_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
    plt.savefig(root_diagram_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
    plt.close()
    print(f"Architecture diagram generated successfully at: {diagram_path} and {root_diagram_path}")

if __name__ == "__main__":
    create_architecture_diagram()
