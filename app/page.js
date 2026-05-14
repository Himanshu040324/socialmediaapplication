import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users,
  TrendingUp,
  MessageSquare,
  ArrowUpCircle,
  Zap,
  Globe,
  ChevronRight,
  Hash,
} from "lucide-react";

export default async function LandingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/feed");
  }

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        background: "var(--mv-bg)",
        color: "var(--mv-text)",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        * {
          box-sizing: border-box;
        }

        .lp-body {
          font-family: 'DM Sans', sans-serif;
        }

        .display {
          font-family: 'DM Serif Display', serif;
        }

        /* Grain overlay */
        .grain::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 100;
          opacity: 0.3;
        }

        /* Glow blobs */
        .glow-blob {
          position: absolute;
          border-radius: 9999px;
          filter: blur(130px);
          opacity: 0.15;
          pointer-events: none;
        }

        /* Fade-up animation */
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-up {
          animation: fadeUp 0.7s ease forwards;
          opacity: 0;
        }

        .delay-1 {
          animation-delay: 0.1s;
        }

        .delay-2 {
          animation-delay: 0.22s;
        }

        .delay-3 {
          animation-delay: 0.34s;
        }

        .delay-4 {
          animation-delay: 0.46s;
        }

        /* Shimmer CTA button */
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        .btn-primary {
          background: linear-gradient(
            90deg,
            #7c6fe0 0%,
            #9f94f0 40%,
            #d4d0f8 50%,
            #9f94f0 60%,
            #7c6fe0 100%
          );

          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
          transition: box-shadow 0.2s;
          color: white;
        }

        .btn-primary:hover {
          box-shadow: 0 0 32px rgba(124, 111, 224, 0.5);
        }

        /* Ghost button */
        .btn-ghost {
          border: 1px solid var(--mv-border);
          color: var(--mv-muted);
          transition: border-color 0.2s, color 0.2s;
        }

        .btn-ghost:hover {
          border-color: var(--mv-accent);
          color: var(--mv-text);
        }

        /* Feature card */
        .feature-card {
          background: var(--mv-surface);
          border: 1px solid var(--mv-border);
          transition:
            transform 0.25s ease,
            border-color 0.25s ease,
            box-shadow 0.25s ease;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          border-color: var(--mv-primary);
          box-shadow: 0 12px 40px rgba(124, 111, 224, 0.15);
        }

        /* Community pill */
        .community-pill {
          background: var(--mv-surface);
          border: 1px solid var(--mv-border);
          color: var(--mv-muted);
          transition:
            background 0.2s,
            border-color 0.2s,
            color 0.2s;
        }

        .community-pill:hover {
          background: var(--mv-surface-2);
          border-color: var(--mv-primary);
          color: var(--mv-text);
        }

        /* Navbar */
        .nav-blur {
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          background: rgba(13, 13, 20, 0.75);
          border-bottom: 1px solid var(--mv-border);
        }

        /* Badge */
        .badge {
          background: rgba(124, 111, 224, 0.12);
          border: 1px solid rgba(124, 111, 224, 0.3);
          color: var(--mv-accent);
        }

        /* CTA card */
        .cta-card {
          background: var(--mv-surface);
          border: 1px solid var(--mv-border);
        }

        /* Section divider */
        .section-divider {
          border-color: var(--mv-border);
        }
      `}</style>

      <div className="grain lp-body">
        {/* Navbar */}
        <header className="nav-blur fixed top-0 left-0 right-0 z-50">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: "var(--mv-primary)" }}
              >
                <Hash size={16} strokeWidth={2.5} className="text-white" />
              </div>

              <span
                className="display text-lg tracking-tight"
                style={{ color: "var(--mv-text)" }}
              >
                sma
              </span>
            </div>

            <nav className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm transition-colors"
                style={{ color: "var(--mv-muted)" }}
              >
                Sign in
              </Link>

              <Link
                href="/signup"
                className="btn-primary rounded-full px-5 py-2 text-sm font-medium"
              >
                Get started
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero */}
        <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-16 text-center">
          {/* Glow blobs */}
          <div
            className="glow-blob -top-20 left-1/2 h-125 w-150 -translate-x-1/2"
            style={{ background: "var(--mv-primary)" }}
          />

          <div
            className="glow-blob bottom-15 -right-15 h-87.5 w-87.5"
            style={{ background: "var(--mv-pink)" }}
          />

          <div
            className="glow-blob bottom-25 -left-10 h-70 w-70"
            style={{ background: "var(--mv-accent)" }}
          />

          <div className="relative z-10 mx-auto max-w-3xl">
            <p className="fade-up delay-1 badge mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-widest">
              <Zap size={12} />
              Now live
            </p>

            <h1
              className="fade-up delay-2 display mb-6 text-[clamp(2.6rem,7vw,5rem)] leading-[1.08]"
              style={{ color: "var(--mv-text)" }}
            >
              Your corner of the{" "}
              <span className="italic" style={{ color: "var(--mv-accent)" }}>
                internet
              </span>
              ,
              <br />
              built around ideas.
            </h1>

            <p
              className="fade-up delay-3 mx-auto mb-10 max-w-xl text-base leading-relaxed"
              style={{ color: "var(--mv-muted)" }}
            >
              Join communities, share what matters, vote on what's worth
              reading, and have conversations that actually go somewhere.
            </p>

            <div className="fade-up delay-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="btn-primary flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-medium"
              >
                Create your account
                <ChevronRight size={16} />
              </Link>

              <Link
                href="/login"
                className="btn-ghost flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-medium"
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 opacity-20">
            <div
              className="h-12 w-px"
              style={{
                background:
                  "linear-gradient(to bottom, transparent, var(--mv-accent))",
              }}
            />
          </div>
        </section>

        {/* Features */}
        <section className="relative px-6 py-28">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2
                className="display mb-4 text-[clamp(1.8rem,4vw,3rem)]"
                style={{ color: "var(--mv-text)" }}
              >
                Everything a community needs
              </h2>

              <p
                className="mx-auto max-w-md text-base"
                style={{ color: "var(--mv-muted)" }}
              >
                Built for meaningful discussions, not just scrolling.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <Users size={22} />,
                  title: "Communities",
                  desc: "Create or join topic-driven communities. Every community has its own voice, rules, and culture.",
                  accent: "var(--mv-primary)",
                  bg: "rgba(124,111,224,0.12)",
                },
                {
                  icon: <TrendingUp size={22} />,
                  title: "Smart Feed",
                  desc: "Sort by Hot, New, or Top. Your feed surfaces what's actually worth your time.",
                  accent: "var(--mv-accent)",
                  bg: "rgba(159,148,240,0.12)",
                },
                {
                  icon: <ArrowUpCircle size={22} />,
                  title: "Voting",
                  desc: "Upvote what's valuable, downvote what isn't. Quality rises to the top, naturally.",
                  accent: "#22c55e",
                  bg: "rgba(34,197,94,0.12)",
                },
                {
                  icon: <MessageSquare size={22} />,
                  title: "Comments",
                  desc: "Threaded conversations that keep context intact. Discuss ideas, not just react to them.",
                  accent: "var(--mv-pink)",
                  bg: "rgba(208,111,203,0.12)",
                },
                {
                  icon: <Globe size={22} />,
                  title: "Open & Accessible",
                  desc: "Browse public posts without an account. Sign up only when you're ready to participate.",
                  accent: "#f59e0b",
                  bg: "rgba(245,158,11,0.12)",
                },
                {
                  icon: <Zap size={22} />,
                  title: "Real-time",
                  desc: "Powered by Supabase — changes reflect instantly. No stale data, no hard refreshes.",
                  accent: "var(--mv-primary)",
                  bg: "rgba(124,111,224,0.12)",
                },
              ].map(({ icon, title, desc, accent, bg }) => (
                <div key={title} className="feature-card rounded-2xl p-7">
                  <div
                    className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      background: bg,
                      color: accent,
                    }}
                  >
                    {icon}
                  </div>

                  <h3
                    className="mb-2 text-base font-semibold"
                    style={{ color: "var(--mv-text)" }}
                  >
                    {title}
                  </h3>

                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--mv-muted)" }}
                  >
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Communities */}
        <section className="section-divider border-t px-6 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h2
              className="display mb-4 text-[clamp(1.6rem,3.5vw,2.5rem)]"
              style={{ color: "var(--mv-text)" }}
            >
              Explore communities
            </h2>

            <p className="mb-12 text-base" style={{ color: "var(--mv-muted)" }}>
              Topics for every interest — jump in or start your own.
            </p>

            <div className="mb-12 flex flex-wrap justify-center gap-3">
              {[
                "Technology",
                "Science",
                "Gaming",
                "Movies",
                "Music",
                "Books",
                "Programming",
                "Design",
                "Photography",
                "Sports",
                "Food",
                "Travel",
                "Finance",
                "News",
                "AskSMA",
              ].map((name) => (
                <Link
                  key={name}
                  href="/signup"
                  className="community-pill flex items-center gap-2 rounded-full px-4 py-2 text-sm"
                >
                  <Hash size={12} style={{ color: "var(--mv-accent)" }} />
                  {name}
                </Link>
              ))}
            </div>

            <Link
              href="/signup"
              className="btn-primary inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-medium"
            >
              Browse all communities
              <ChevronRight size={16} />
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-28 text-center">
          <div className="mx-auto max-w-2xl">
            <div className="relative">
              <div
                className="glow-blob top-1/2 left-1/2 h-75 w-125 -translate-x-1/2 -translate-y-1/2"
                style={{
                  background: "var(--mv-primary)",
                  opacity: 0.1,
                }}
              />

              <div className="cta-card relative z-10 rounded-3xl p-14">
                <h2
                  className="display mb-4 text-[clamp(1.8rem,4vw,3rem)]"
                  style={{ color: "var(--mv-text)" }}
                >
                  Ready to join?
                </h2>

                <p
                  className="mx-auto mb-10 max-w-sm text-base"
                  style={{ color: "var(--mv-muted)" }}
                >
                  Create your account in seconds. No spam, no fluff — just
                  communities and conversations.
                </p>

                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    href="/signup"
                    className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-medium"
                  >
                    Create free account
                    <ChevronRight size={16} />
                  </Link>

                  <Link
                    href="/login"
                    className="btn-ghost inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-medium"
                  >
                    Already have one? Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="section-divider border-t px-6 py-10 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-md"
              style={{ background: "var(--mv-primary)" }}
            >
              <Hash size={12} strokeWidth={2.5} className="text-white" />
            </div>

            <span
              className="display text-sm"
              style={{ color: "var(--mv-muted)" }}
            >
              sma
            </span>
          </div>

          <p className="text-xs" style={{ color: "var(--mv-dim)" }}>
            Social Media Application · Built with Next.js & Supabase
          </p>
        </footer>
      </div>
    </div>
  );
}
