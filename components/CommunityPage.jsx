"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import VoteButtons from "@/components/VoteButtons";
import ModMenu from "@/components/ModMenu";
import FlairBadge from "@/components/FlairBadge";
import FlairManager from "@/components/FlairManager";

const SORT_TABS = ["Hot", "New", "Top"];

function hotScore(score, createdAt) {
  const hours = (Date.now() - new Date(createdAt)) / 3_600_000;
  return score / Math.pow(hours + 2, 1.5);
}

function timeAgo(dateStr) {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function joinedDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

// ─── Post card ────────────────────────────────────────────────────────────────
function PostCard({
  post,
  userId,
  isMod,
  communityId,
  communityName,
  onRemoved,
  onPinToggled,
  onBanned,
}) {
  const router = useRouter();

  return (
    <div
      className={`bg-mv-surface border rounded-2xl overflow-hidden transition-colors
      ${
        post.is_removed
          ? "border-red-500/20 opacity-60"
          : post.is_pinned
            ? "border-mv-primary/40 hover:border-mv-primary/60"
            : "border-mv-border hover:border-mv-primary/30"
      }`}
    >
      {/* Pinned banner */}
      {post.is_pinned && !post.is_removed && (
        <div className="flex items-center gap-1.5 px-4 py-1.5 border-b border-mv-primary/20 bg-mv-primary/5">
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
            <path
              d="M9 1L13 5l-4 4-2-1-3 3H2v-2l3-3-1-2 4-4z"
              stroke="var(--mv-primary)"
              strokeWidth="1.2"
              strokeLinejoin="round"
              fill="var(--mv-primary)"
            />
          </svg>
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--mv-primary)" }}
          >
            Pinned
          </span>
        </div>
      )}

      {/* Removed banner (mods only) */}
      {post.is_removed && (
        <div className="flex items-center gap-1.5 px-4 py-1.5 border-b border-red-500/20 bg-red-500/5">
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="#f87171" strokeWidth="1.2" />
            <path
              d="M4.5 7h5"
              stroke="#f87171"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-xs font-semibold text-red-400">
            Removed — only visible to mods
          </span>
        </div>
      )}

      <div className="flex">
        <div onClick={(e) => e.stopPropagation()}>
          <VoteButtons
            postId={post.id}
            userId={userId}
            initialScore={post.score}
            initialVote={post.userVote}
          />
        </div>

        <div
          className="flex-1 p-4 min-w-0 cursor-pointer group"
          onClick={() => router.push(`/post/${post.id}`)}
        >
          {/* Meta */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-xs text-mv-dim">
              u/
              <span className="text-mv-accent font-medium">
                {post.profiles?.username ?? "deleted"}
              </span>
            </span>
            <span className="text-mv-dim text-xs">·</span>
            <span className="text-xs text-mv-dim">
              {timeAgo(post.created_at)}
            </span>

            {/* Flair badge */}
            {post.flair && (
              <>
                <span className="text-mv-dim text-xs">·</span>
                <div onClick={(e) => e.stopPropagation()}>
                  <FlairBadge
                    name={post.flair.name}
                    color={post.flair.color}
                    size="xs"
                  />
                </div>
              </>
            )}

            {post.type !== "text" && (
              <span className="ml-auto text-xs font-semibold text-mv-primary bg-mv-primary/10 border border-mv-primary/20 rounded px-2 py-0.5 uppercase tracking-wider">
                {post.type}
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-sm font-semibold text-mv-text leading-snug mb-2 group-hover:text-mv-accent transition-colors">
            {post.title}
          </h2>

          {/* Image preview */}
          {post.type === "image" && post.image_url && (
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full rounded-xl max-h-72 object-cover border border-mv-border mb-2"
            />
          )}

          {/* Text snippet */}
          {post.type === "text" && post.body && (
            <p className="text-xs text-mv-muted leading-relaxed line-clamp-2 mb-2">
              {post.body
                .replace(/<[^>]*>/g, " ")
                .replace(/\s+/g, " ")
                .trim()}
            </p>
          )}

          {/* Link pill */}
          {post.type === "link" && post.link_url && (
            <span className="inline-flex items-center gap-1.5 text-xs text-mv-accent border border-mv-border bg-mv-surface-2 px-3 py-1 rounded-lg mb-2 truncate max-w-xs">
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                <path
                  d="M5.5 8.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5L6.5 2.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <path
                  d="M8.5 5.5a3.5 3.5 0 00-5 0L1.5 7.5a3.5 3.5 0 005 5l1-1"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
              {post.link_url}
            </span>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1.5 text-xs text-mv-dim">
              <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
                <path
                  d="M1 1h11v8H7.5L5 12V9H1V1z"
                  stroke="currentColor"
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                />
              </svg>
              {post.commentCount}{" "}
              {post.commentCount === 1 ? "comment" : "comments"}
            </div>
            {isMod && (
              <div onClick={(e) => e.stopPropagation()}>
                <ModMenu
                  type="post"
                  targetId={post.id}
                  targetAuthorId={post.author_id}
                  targetAuthorName={post.profiles?.username}
                  communityId={communityId}
                  communityName={communityName}
                  isPinned={post.is_pinned}
                  isRemoved={post.is_removed}
                  onRemoved={onRemoved}
                  onPinToggled={onPinToggled}
                  onBanned={onBanned}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function PostSkeleton() {
  return (
    <div className="bg-mv-surface border border-mv-border rounded-2xl overflow-hidden animate-pulse">
      <div className="flex">
        <div className="w-11 bg-mv-surface-2 border-r border-mv-border" />
        <div className="flex-1 p-4 space-y-3">
          <div className="flex gap-2">
            <div className="h-3 w-20 bg-mv-border rounded" />
            <div className="h-3 w-12 bg-mv-border rounded" />
          </div>
          <div className="h-4 w-3/4 bg-mv-border rounded" />
          <div className="h-3 w-1/4 bg-mv-border rounded" />
        </div>
      </div>
    </div>
  );
}

// ─── Main CommunityPage ───────────────────────────────────────────────────────
export default function CommunityPage({
  community,
  memberCount: initialMemberCount,
  isMember: initialIsMember,
  isCreator,
  posts: initialPosts,
  flairs: initialFlairs = [],
  userId,
}) {
  const [isMember, setIsMember] = useState(initialIsMember);
  const [memberCount, setMemberCount] = useState(initialMemberCount);
  const [joining, setJoining] = useState(false);
  const [sort, setSort] = useState("Hot");
  const [activeFlair, setActiveFlair] = useState(null); // flair id or null = All
  const [posts, setPosts] = useState(initialPosts);

  const isMod = isCreator;
  const supabase = createClient();
  const router = useRouter();

  // ── Mod callbacks ─────────────────────────────────────────────────────────
  function handleRemoved(postId, removed) {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, is_removed: removed } : p)),
    );
  }
  function handlePinToggled(postId, pinned) {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, is_pinned: pinned } : p)),
    );
  }
  function handleBanned(bannedUserId) {
    setPosts((prev) => prev.filter((p) => p.author_id !== bannedUserId));
  }

  // ── Sort + filter ─────────────────────────────────────────────────────────
  const sortedPosts = useMemo(() => {
    let visible = isMod ? posts : posts.filter((p) => !p.is_removed);

    // Flair filter
    if (activeFlair) {
      visible = visible.filter((p) => p.flair?.id === activeFlair);
    }

    const sortFn = (a, b) => {
      if (sort === "New")
        return new Date(b.created_at) - new Date(a.created_at);
      if (sort === "Top") return b.score - a.score;
      return hotScore(b.score, b.created_at) - hotScore(a.score, a.created_at);
    };

    const pinned = visible.filter((p) => p.is_pinned && !p.is_removed);
    const removed = isMod ? visible.filter((p) => p.is_removed) : [];
    const regular = visible.filter((p) => !p.is_pinned && !p.is_removed);

    return [
      ...pinned.sort(sortFn),
      ...regular.sort(sortFn),
      ...removed.sort(sortFn),
    ];
  }, [posts, sort, activeFlair, isMod]);

  // ── Join / Leave ──────────────────────────────────────────────────────────
  async function handleJoinLeave() {
    setJoining(true);
    if (isMember) {
      await supabase
        .from("community_members")
        .delete()
        .eq("community_id", community.id)
        .eq("user_id", userId);
      setIsMember(false);
      setMemberCount((c) => c - 1);
    } else {
      await supabase
        .from("community_members")
        .insert({ community_id: community.id, user_id: userId });
      setIsMember(true);
      setMemberCount((c) => c + 1);
    }
    setJoining(false);
    router.refresh();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 font-sans">
      {/* ── Community header ── */}
      <div className="bg-mv-surface border border-mv-border rounded-2xl overflow-hidden mb-6">
        {/* Banner */}
        <div className="relative h-32 w-full">
          {community.banner_url ? (
            <img
              src={community.banner_url}
              alt={`${community.name} banner`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background:
                  "linear-gradient(135deg, var(--mv-surface-2) 0%, var(--mv-border) 100%)",
              }}
            />
          )}
        </div>

        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-7 mb-3">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-2xl border-4 border-mv-surface overflow-hidden bg-mv-primary/10 shrink-0 flex items-center justify-center">
              {community.avatar_url ? (
                <img
                  src={community.avatar_url}
                  alt={community.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-mv-primary">
                  {community.name?.[0]?.toUpperCase()}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isMod && (
                <span
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl border"
                  style={{
                    color: "var(--mv-primary)",
                    borderColor: "var(--mv-primary)",
                    background: "rgba(124,111,224,0.08)",
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M7 1.5L2 4v3.5C2 10.54 4.24 13 7 13s5-2.46 5-5.5V4L7 1.5z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Moderator
                </span>
              )}
              {(isMember || isCreator) && (
                <Link
                  href={`/c/${community.name}/submit`}
                  className="flex items-center gap-1.5 text-xs font-semibold text-mv-accent border border-mv-border hover:border-mv-primary px-3 py-2 rounded-xl transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M7 2v10M2 7h10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  Create Post
                </Link>
              )}
              {!isCreator && (
                <button
                  onClick={handleJoinLeave}
                  disabled={joining}
                  className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-colors disabled:opacity-50
                    ${
                      isMember
                        ? "text-mv-muted border-mv-border hover:text-red-400 hover:border-red-400/40"
                        : "text-white bg-mv-primary border-mv-primary hover:bg-mv-primary/90"
                    }`}
                >
                  {joining ? "…" : isMember ? "Leave" : "Join"}
                </button>
              )}
            </div>
          </div>

          <h1 className="text-lg font-bold text-mv-text tracking-tight leading-none mb-1">
            c/{community.name}
          </h1>
          {community.description && (
            <p className="text-sm text-mv-muted leading-relaxed mb-4 max-w-lg">
              {community.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-mv-dim">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <circle
                  cx="5.5"
                  cy="4.5"
                  r="2"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M1 12c0-2.21 2.01-4 4.5-4s4.5 1.79 4.5 4"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <circle
                  cx="10.5"
                  cy="4.5"
                  r="1.5"
                  stroke="currentColor"
                  strokeWidth="1.1"
                />
                <path
                  d="M12.5 12c0-1.66-1.34-3-3-3"
                  stroke="currentColor"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                />
              </svg>
              <span>
                <span className="font-semibold text-mv-muted">
                  {memberCount.toLocaleString()}
                </span>{" "}
                {memberCount === 1 ? "member" : "members"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-mv-dim">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <rect
                  x="2"
                  y="3"
                  width="10"
                  height="9"
                  rx="1.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M5 2v2M9 2v2M2 7h10"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
              <span>
                Created{" "}
                <span className="font-semibold text-mv-muted">
                  {joinedDate(community.created_at)}
                </span>
              </span>
            </div>
            {community.profiles?.username && (
              <div className="flex items-center gap-1.5 text-xs text-mv-dim">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M7 1.5L2 4v3.5C2 10.54 4.24 13 7 13s5-2.46 5-5.5V4L7 1.5z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>
                  Moderated by{" "}
                  <Link
                    href={`/u/${community.profiles.username}`}
                    className="font-semibold text-mv-accent hover:text-mv-text transition-colors"
                  >
                    u/{community.profiles.username}
                  </Link>
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-mv-dim">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path
                  d="M1 1h11v8H7.5L5 12V9H1V1z"
                  stroke="currentColor"
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                />
              </svg>
              <span>
                <span className="font-semibold text-mv-muted">
                  {initialPosts.length}
                </span>{" "}
                posts
              </span>
            </div>
          </div>

          {/* Flair manager — mods only */}
          {isMod && (
            <FlairManager
              communityId={community.id}
              initialFlairs={initialFlairs}
            />
          )}
        </div>
      </div>

      {/* ── Sort tabs ── */}
      <div className="flex items-center gap-1 mb-4 border-b border-mv-border">
        {SORT_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setSort(tab)}
            className={`flex items-center gap-1.5 px-3 pb-3 text-sm font-semibold transition-all border-b-2 -mb-px
              ${
                sort === tab
                  ? "text-mv-text border-mv-primary"
                  : "text-mv-dim border-transparent hover:text-mv-muted hover:border-mv-border"
              }`}
          >
            {tab === "Hot" && (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 1C7 1 9.5 4 9.5 6.5C9.5 7.88 8.38 9 7 9C5.62 9 4.5 7.88 4.5 6.5C4.5 5.5 5 4.5 5 4.5C5 4.5 4 6 4 7.5C4 10.54 6.24 13 9 13C11.76 13 13 10.54 13 8C13 4 10 1 7 1Z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {tab === "New" && (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <circle
                  cx="7"
                  cy="7"
                  r="5.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M7 4v3l2 1.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            )}
            {tab === "Top" && (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 2L13 9H1L7 2Z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {tab}
          </button>
        ))}
      </div>

      {/* ── Flair filter chips ── only shown when community has flairs ── */}
      {initialFlairs.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-5">
          {/* All chip */}
          <button
            type="button"
            onClick={() => setActiveFlair(null)}
            className={`inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all
              ${
                activeFlair === null
                  ? "bg-mv-surface border-mv-primary/60 text-mv-text"
                  : "bg-mv-surface-2 border-mv-border text-mv-dim hover:border-mv-dim hover:text-mv-muted"
              }`}
          >
            All
          </button>

          {/* One chip per flair */}
          {initialFlairs.map((flair) => (
            <FlairBadge
              key={flair.id}
              name={flair.name}
              color={flair.color}
              active={activeFlair === flair.id}
              onClick={() =>
                setActiveFlair(activeFlair === flair.id ? null : flair.id)
              }
            />
          ))}

          {/* Active filter indicator */}
          {activeFlair && (
            <button
              type="button"
              onClick={() => setActiveFlair(null)}
              className="flex items-center gap-1 text-xs text-mv-dim hover:text-mv-muted transition-colors ml-1"
            >
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2 2l10 10M12 2L2 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Clear filter
            </button>
          )}
        </div>
      )}

      {/* ── Posts list ── */}
      <div className="space-y-3">
        {sortedPosts.length === 0 ? (
          <div className="bg-mv-surface border border-mv-border rounded-2xl py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-mv-surface-2 border border-mv-border flex items-center justify-center mx-auto mb-3">
              <svg width="20" height="20" viewBox="0 0 13 13" fill="none">
                <path
                  d="M1 1h11v8H7.5L5 12V9H1V1z"
                  stroke="currentColor"
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                  className="text-mv-dim"
                />
              </svg>
            </div>
            <p className="text-sm text-mv-muted font-medium">
              {activeFlair ? "No posts with this flair" : "No posts yet"}
            </p>
            {activeFlair ? (
              <button
                onClick={() => setActiveFlair(null)}
                className="inline-block mt-3 text-xs text-mv-accent border border-mv-border hover:border-mv-primary px-4 py-2 rounded-xl transition-colors"
              >
                Clear filter
              </button>
            ) : (
              (isMember || isCreator) && (
                <Link
                  href={`/c/${community.name}/submit`}
                  className="inline-block mt-3 text-xs text-mv-accent border border-mv-border hover:border-mv-primary px-4 py-2 rounded-xl transition-colors"
                >
                  Be the first to post
                </Link>
              )
            )}
          </div>
        ) : (
          sortedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              userId={userId}
              isMod={isMod}
              communityId={community.id}
              communityName={community.name}
              onRemoved={handleRemoved}
              onPinToggled={handlePinToggled}
              onBanned={handleBanned}
            />
          ))
        )}
      </div>
    </div>
  );
}
