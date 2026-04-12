"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import VoteButtons from "@/components/VoteButtons";
import EditProfileModal from "@/components/EditProfileModal";

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

// ─── Post card (same pattern as FeedClient) ───────────────────────────────────
function PostCard({ post, userId }) {
  const router = useRouter();

  return (
    <div className="bg-mv-surface border border-mv-border rounded-2xl overflow-hidden hover:border-mv-primary/30 transition-colors">
      <div className="flex">
        <div onClick={(e) => e.stopPropagation()}>
          <VoteButtons
            postId={post.id}
            userId={userId}
            initialScore={post.score}
            initialVote={post.userVote ?? 0}
          />
        </div>

        <div
          className="flex-1 p-4 min-w-0 cursor-pointer group"
          onClick={() => router.push(`/post/${post.id}`)}
        >
          {/* Meta */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Link
              href={`/c/${post.communities?.name}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-bold text-mv-text hover:text-mv-accent transition-colors"
            >
              c/{post.communities?.name}
            </Link>
            <span className="text-mv-dim text-xs">·</span>
            <span className="text-xs text-mv-dim">
              {timeAgo(post.created_at)}
            </span>
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
              className="w-full rounded-xl max-h-60 object-cover border border-mv-border mb-2"
            />
          )}

          {/* Text snippet */}
          {post.type === "text" && post.body && (
            <p className="text-xs text-mv-muted leading-relaxed line-clamp-2 mb-2">
              {post.body}
            </p>
          )}

          {/* Comment count */}
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
        </div>
      </div>
    </div>
  );
}

// ─── Main ProfilePage ─────────────────────────────────────────────────────────
export default function ProfilePage({
  profile: initialProfile,
  karma,
  posts,
  isOwner,
  userId,
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [editOpen, setEditOpen] = useState(false);

  const DEFAULT_BANNER =
    "linear-gradient(135deg, var(--mv-surface-2) 0%, var(--mv-border) 100%)";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 font-sans">
      {/* ── Profile header card ── */}
      <div className="bg-mv-surface border border-mv-border rounded-2xl overflow-hidden mb-6">
        {/* Banner */}
        <div className="relative h-36 w-full">
          {profile.banner_url ? (
            <img
              src={profile.banner_url}
              alt="Profile banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{ background: DEFAULT_BANNER }}
            />
          )}

          {/* Edit button — top right of banner */}
          {isOwner && (
            <button
              onClick={() => setEditOpen(true)}
              className="absolute top-3 right-3 flex items-center gap-1.5 text-xs font-semibold bg-black/40 hover:bg-black/60 text-white border border-white/20 px-3 py-1.5 rounded-xl backdrop-blur-sm transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                <path
                  d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
              </svg>
              Edit profile
            </button>
          )}
        </div>

        {/* Avatar + info row */}
        <div className="px-5 pb-5">
          {/* Avatar overlaps banner */}
          <div className="flex items-end justify-between -mt-8 mb-3">
            <div className="w-16 h-16 rounded-full border-4 border-mv-surface overflow-hidden bg-mv-surface-2 shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                /* Default avatar — first letter of username */
                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-mv-primary bg-mv-primary/10">
                  {profile.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Username */}
          <h1 className="text-lg font-bold text-mv-text tracking-tight leading-none mb-1">
            u/{profile.username}
          </h1>

          {/* Bio */}
          {profile.bio ? (
            <p className="text-sm text-mv-muted leading-relaxed mb-3 max-w-lg">
              {profile.bio}
            </p>
          ) : isOwner ? (
            <p className="text-sm text-mv-dim italic mb-3">
              No bio yet.{" "}
              <button
                onClick={() => setEditOpen(true)}
                className="text-mv-accent hover:underline"
              >
                Add one
              </button>
            </p>
          ) : (
            <p className="text-sm text-mv-dim italic mb-3">No bio.</p>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-mv-dim">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 2L13 9H1L7 2Z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                  fill="currentColor"
                  className="text-mv-primary"
                />
              </svg>
              <span>
                <span className="font-semibold text-mv-muted">{karma}</span>{" "}
                karma
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-mv-dim">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
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
                Joined{" "}
                <span className="font-semibold text-mv-muted">
                  {joinedDate(profile.created_at)}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-mv-dim">
              <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
                <path
                  d="M1 1h11v8H7.5L5 12V9H1V1z"
                  stroke="currentColor"
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                />
              </svg>
              <span>
                <span className="font-semibold text-mv-muted">
                  {posts.length}
                </span>{" "}
                posts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Posts section ── */}
      <div className="mb-4">
        <h2 className="text-sm font-bold text-mv-text mb-3">
          Posts
          <span className="ml-2 text-xs font-normal text-mv-dim">
            {posts.length}
          </span>
        </h2>

        {posts.length === 0 ? (
          <div className="bg-mv-surface border border-mv-border rounded-2xl py-14 text-center">
            <p className="text-sm text-mv-muted font-medium">No posts yet</p>
            {isOwner && (
              <p className="text-xs text-mv-dim mt-1">
                Head to a community and share something!
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} userId={userId} />
            ))}
          </div>
        )}
      </div>

      {/* ── Edit modal ── */}
      {editOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSaved={setProfile}
        />
      )}
    </div>
  );
}
