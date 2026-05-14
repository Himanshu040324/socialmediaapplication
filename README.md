# 🌐 Social Media Application

A Reddit-inspired social media web application built with **Next.js**, **Supabase**, and **Shadcn UI** — featuring communities, posts, voting, and comments, with full authentication support.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://socialmediaapplication-gamma.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Himanshu040324/socialmediaapplication)

---

## 🚀 Live Demo

👉 [https://socialmediaapplication-gamma.vercel.app/](https://socialmediaapplication-gamma.vercel.app/)

---

## ✨ Features

- **Authentication** — Secure sign-up and login powered by Supabase Auth
- **Communities** — Create and join topic-based communities
- **Posts** — Rich text post creation using Tiptap editor
- **Feed** — Dynamic feed showing posts sorted by newest first
- **Voting** — Upvote / downvote system with live score tracking
- **Comments** — Threaded comment section on posts
- **Sort Options** — Sort feed by Hot, New, or Top
- **Dark / Light Mode** — Full theme support via `next-themes`
- **Responsive UI** — Built with Tailwind CSS v4 and Shadcn UI components

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) |
| UI Library | [Shadcn UI](https://ui.shadcn.com/) + [Tailwind CSS v4](https://tailwindcss.com/) |
| Backend / DB | [Supabase](https://supabase.com/) (Auth + PostgreSQL) |
| Rich Text | [Tiptap](https://tiptap.dev/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Theming | [next-themes](https://github.com/pacocoursey/next-themes) |
| Deployment | [Vercel](https://vercel.com/) |
| Language | JavaScript (97.6%), CSS (2.4%) |

---

## 📁 Project Structure

```
socialmediaapplication/
├── app/              # Next.js App Router pages and layouts
├── actions/          # Server actions
├── components/       # Reusable UI components
├── lib/              # Utility functions and helpers
├── utils/supabase/   # Supabase client setup (SSR + browser)
├── supabase/         # Supabase config and migrations
├── public/           # Static assets
├── components.json   # Shadcn UI config
└── next.config.mjs   # Next.js configuration
```

---

## ⚡ Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) project (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/Himanshu040324/socialmediaapplication.git
cd socialmediaapplication
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project dashboard under **Settings → API**.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 🗄️ Database Schema (Supabase)

The app uses the following core tables:

- **users** — Managed by Supabase Auth
- **communities** — Topic-based groups users can join
- **posts** — User-created posts within communities
- **votes** — Upvote/downvote records linked to posts
- **comments** — Comments linked to posts

---

## 🚢 Deployment

This project is deployed on **Vercel**. To deploy your own instance:

1. Push the repository to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Add your Supabase environment variables in the Vercel project settings
4. Deploy!

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 👤 Author

**Himanshu** — [@Himanshu040324](https://github.com/Himanshu040324)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).