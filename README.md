# ⚡ DSA Revision Tracker 

> "Because forgetting a pattern during an interview is a pain we don't want to repeat." 

### 🌐 **Live Demo Workspace:** [dsa-revision-tracker.pages.dev](https://dsa-revision-tracker.pages.dev/)

Welcome to the **DSA Revision Tracker**—a high-fidelity, custom-engineered workstation built to rescue developers from the endless loop of forgetting LeetCode patterns. No more messy spreadsheets or broken schedules; this app handles your logic spacing while you handle the compilation.

---

## 🎨 System Previews

<img src="https://github.com/user-attachments/assets/5e6b065f-3d2c-4989-9586-c377a5f81312" width="49.5%" />
<img src="https://github.com/user-attachments/assets/5ee5beb9-a9bb-4b82-b5c5-c3c0fb9b8337" width="49.5%"  /> 

---

## 🎯 The Mindset

We've all been there: you solve a complex Graph problem on a Tuesday, and by next Monday, the intuition is completely gone. 

This tracker fixes that by replacing chaotic review sessions with an automatic **Spaced Repetition Pipeline**. It treats your coding consistency like a GitHub contribution grid, keeping you disciplined, accountable, and interview-ready.

---

## 🔥 The Feature Set

* **🔄 Spacing Engine:** Moves your logged problems seamlessly across **Next Day**, **Weekend**, and **Monthly** queues based on your memory recall. 
* **📅 The Pixel Grid:** A completely custom, timezone-corrected activity matrix that locks in your daily logs. No time-drift bugs, just pure visual validation of your hard work.
* **⚡ Streak Ledger:** Built to protect momentum. Tracks your active chain and all-time maximum record, featuring a **1-day grace window** to keep your streak alive when life happens.
* **🔐 Deep Sandboxing:** Built with absolute data isolation. Your pipeline data is safely secured behind raw **Supabase Row Level Security (RLS)** guardrails.
* **💼 The Mastered Vault:** Got a concept permanently locked into your brain? Move it to the **Ad-Hoc Mastered Collection** to clear out your active queues.
* **📱 Desktop Grid, Mobile Scroller:** Asymmetric layout designed for clean desktop viewing that transforms into an elegant horizontal scroller on mobile widths.

---

## 🛠️ The Blueprints (Tech Stack)

* **Core Structure:** React 18 & Vite (Blazing fast compilation)
* **The Style UI:** Tailwind CSS & Lucide Icons (Clean, graphite, modern look)
* **The Engine Room:** Supabase DB & GoTrue Auth (PostgreSQL with strict data sandboxing)
* **The Global Sky:** Deployed permanently on the **Cloudflare Pages Global CDN**

---

## 🚀 Setting Up Your Sandbox Locally

### 1. Boot the codebase
git clone https://github.com/thealkeshgupta/DSA-Revision-Tracker.git
cd DSA-Revision-Tracker

### 2. Grab the packages
npm install

### 3. Connect the environment wires
Create a local .env file right in the project root:
cp .env.example .env

Pop it open and inject your Supabase credentials:
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here

### 4. Ignite the local server
npm run dev

---

## 🌐 Deploying to Production (Cloudflare Pages)

1. Make sure your public/_redirects contains: /* /index.html 200 (This keeps your pages from throwing a 404 on a browser refresh).
2. Connect your repository to Cloudflare Pages, select Vite as your framework preset.
3. Securely add your VITE_SUPABASE_URL` and VITE_SUPABASE_PUBLISHABLE_KEY` into the Cloudflare Environment dashboard variables.
4. Save, deploy, and let the edge servers carry the load.

---

## 📄 License & System Ownership

Distributed under the MIT License. Open-source, modular, and built to scale.

Engineered with ⚡ by [Alkesh Gupta](https://github.com/thealkeshgupta). Fork it, customize the panels, log your milestones, and go crush those technical rounds! 🚀
