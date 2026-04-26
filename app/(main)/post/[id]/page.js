import { createClient }  from "@/utils/supabase/server";
import { redirect }       from "next/navigation";
import Link               from "next/link";
import VoteButtons        from "@/components/VoteButtons";
import CommentSection     from "@/components/CommentSection";
import FlairBadge         from "@/components/FlairBadge";

export default async function PostPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: post } = await supabase
    .from("posts")
    .select(`
      id, title, body, image_url, link_url, type, created_at,
      is_removed,
      author_id,
      profiles!posts_author_id_fkey(username),
      communities(id, name, created_by),
      votes(user_id, value),
      flairs(id, name, color)
    `)
    .eq("id", id)
    .single();

  if (!post) redirect("/feed");

  const communityId   = post.communities?.id
  const communityName = post.communities?.name
  const isMod         = user.id === post.communities?.created_by

  // Ban check
  if (!isMod) {
    const { data: ban } = await supabase
      .from("community_bans")
      .select("id")
      .eq("community_id", communityId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (ban) redirect(`/c/${communityName}`);
  }

  if (post.is_removed && !isMod) redirect(`/c/${communityName}`);

  const score    = post.votes?.reduce((sum, v) => sum + v.value, 0) ?? 0;
  const userVote = post.votes?.find((v) => v.user_id === user.id)?.value ?? 0;

  // Unwrap flair from array (Supabase FK join returns array)
  const flair = Array.isArray(post.flairs) ? post.flairs[0] ?? null : post.flairs ?? null

  const { data: comments } = await supabase
    .from("comments")
    .select(`
      id, body, created_at, author_id, parent_comment_id, is_removed,
      profiles!comments_author_id_fkey(username),
      comment_votes(user_id, value)
    `)
    .eq("post_id", post.id)
    .order("created_at", { ascending: true });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 font-sans">

      {/* Back link */}
      <Link
        href={`/c/${communityName}`}
        className="inline-flex items-center gap-2 text-mv-muted text-sm font-medium mb-6 hover:text-mv-text transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        c/{communityName}
      </Link>

      {/* Removed notice (mods only) */}
      {post.is_removed && isMod && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="#f87171" strokeWidth="1.2"/>
            <path d="M4.5 7h5" stroke="#f87171" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <span className="text-xs font-semibold text-red-400">This post has been removed — only visible to moderators</span>
        </div>
      )}

      {/* Post card */}
      <div className={`bg-mv-surface border rounded-2xl overflow-hidden mb-4
        ${post.is_removed ? 'border-red-500/20 opacity-80' : 'border-mv-border'}`}
      >
        <div className="flex gap-0">
          <VoteButtons
            postId={post.id}
            userId={user.id}
            initialScore={score}
            initialVote={userVote}
          />

          <div className="flex-1 p-6 min-w-0">
            {/* Meta */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <Link href={`/c/${communityName}`} className="text-xs font-bold text-mv-text hover:text-mv-accent transition-colors">
                c/{communityName}
              </Link>
              <span className="text-mv-dim text-xs">·</span>
              <span className="text-xs text-mv-dim">
                Posted by{" "}
                <span className="text-mv-accent font-semibold">
                  u/{post.profiles?.username ?? "deleted"}
                </span>
              </span>
              <span className="text-mv-dim text-xs">·</span>
              <span className="text-xs text-mv-dim">{timeAgo(post.created_at)}</span>
              {post.type !== "text" && (
                <span className="text-xs font-semibold text-mv-primary bg-mv-primary/10 border border-mv-primary/20 rounded px-2 py-0.5 uppercase tracking-wider">
                  {post.type}
                </span>
              )}
            </div>

            {/* Title + flair */}
            <div className="flex items-start gap-3 mb-4 flex-wrap">
              <h1 className="text-xl font-bold text-mv-text leading-snug tracking-tight">
                {post.title}
              </h1>
              {flair && (
                <div className="mt-1 shrink-0">
                  <FlairBadge name={flair.name} color={flair.color} />
                </div>
              )}
            </div>

            {/* Body */}
            {post.type === "text" && post.body && (
              <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: post.body }} />
            )}

            {/* Image */}
            {post.type === "image" && post.image_url && (
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full rounded-xl max-h-125 object-cover border border-mv-border"
              />
            )}

            {/* Link */}
            {post.type === "link" && post.link_url && (
              <a
                href={post.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-mv-accent hover:text-mv-text transition-colors border border-mv-border hover:border-mv-primary bg-mv-surface-2 px-4 py-2 rounded-xl"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5.5 8.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5L6.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M8.5 5.5a3.5 3.5 0 00-5 0L1.5 7.5a3.5 3.5 0 005 5l1-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                {post.link_url}
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-mv-border flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-mv-dim">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M1 1h11v8H7.5L5 12V9H1V1z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
            </svg>
            {comments?.length ?? 0}{" "}
            {comments?.length === 1 ? "comment" : "comments"}
          </span>
        </div>
      </div>

      {/* Comments */}
      <CommentSection
        postId={post.id}
        userId={user.id}
        initialComments={comments ?? []}
        communityId={communityId}
        communityName={communityName}
        isMod={isMod}
      />
    </div>
  );
}

function timeAgo(dateStr) {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (seconds < 60)    return `${seconds}s ago`;
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}