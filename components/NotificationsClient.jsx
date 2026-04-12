"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { NotificationRow } from "@/components/NotificationBell";

const PAGE_SIZE = 30;

const TAB_LABELS = {
  all: "All",
  unread: "Unread",
  post_upvote: "Upvotes",
  post_comment: "Comments",
  comment_reply: "Replies",
  mention: "Mentions",
};

export default function NotificationsClient({ userId, initialNotifications }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(
    initialNotifications.length === PAGE_SIZE,
  );
  const supabase = createClient();

  // ── Filter displayed list ─────────────────────────────────────────────
  const filtered = notifications.filter((n) => {
    if (tab === "all") return true;
    if (tab === "unread") return !n.is_read;
    return n.type === tab;
  });

  // ── Fetch more (pagination) ───────────────────────────────────────────
  const loadMore = async () => {
    setLoading(true);
    const oldest = notifications[notifications.length - 1]?.created_at;

    const { data } = await supabase
      .from("notifications")
      .select(
        `
        id, type, is_read, created_at, post_id, comment_id,
        profiles!notifications_actor_id_fkey(username),
        posts(title)
      `,
      )
      .eq("user_id", userId)
      .lt("created_at", oldest)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    const more = (data ?? []).map((n) => ({
      ...n,
      post_title: n.posts?.title ?? null,
    }));
    setNotifications((prev) => [...prev, ...more]);
    setHasMore(more.length === PAGE_SIZE);
    setLoading(false);
  };

  // ── Mark single read ──────────────────────────────────────────────────
  async function markRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  }

  // ── Mark all read ─────────────────────────────────────────────────────
  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
  }

  // ── Realtime: prepend new notifications live ──────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("notifications-page")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          // Fetch full row with joins
          const { data } = await supabase
            .from("notifications")
            .select(
              `
              id, type, is_read, created_at, post_id, comment_id,
              profiles!notifications_actor_id_fkey(username),
              posts(title)
            `,
            )
            .eq("id", payload.new.id)
            .single();

          if (data) {
            setNotifications((prev) => [
              { ...data, post_title: data.posts?.title ?? null },
              ...prev,
            ]);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-mv-text tracking-tight">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-xs text-mv-dim mt-0.5">{unreadCount} unread</p>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-semibold text-mv-accent hover:text-mv-text border border-mv-border hover:border-mv-primary px-3 py-1.5 rounded-xl transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1 border-b border-mv-border">
        {Object.entries(TAB_LABELS).map(([key, label]) => {
          const count =
            key === "all"
              ? notifications.length
              : key === "unread"
                ? notifications.filter((n) => !n.is_read).length
                : notifications.filter((n) => n.type === key).length;

          if (count === 0 && key !== "all" && key !== "unread") return null;

          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-3 pb-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 -mb-px
                ${
                  tab === key
                    ? "text-mv-text border-mv-primary"
                    : "text-mv-dim border-transparent hover:text-mv-muted"
                }`}
            >
              {label}
              {count > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                  ${tab === key ? "bg-mv-primary/15 text-mv-primary" : "bg-mv-surface-2 text-mv-dim"}`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notification list */}
      <div className="bg-mv-surface border border-mv-border rounded-2xl overflow-hidden divide-y divide-mv-border">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-mv-surface-2 border border-mv-border flex items-center justify-center mx-auto mb-3">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 2a6 6 0 00-6 6v3.5L2.5 13.5A1 1 0 003.4 15h13.2a1 1 0 00.9-1.5L16 11.5V8a6 6 0 00-6-6z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                  className="text-mv-dim"
                />
                <path
                  d="M8 15a2 2 0 004 0"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  className="text-mv-dim"
                />
              </svg>
            </div>
            <p className="text-sm text-mv-muted font-medium">
              No notifications
            </p>
            <p className="text-xs text-mv-dim mt-1">
              {tab === "unread" ? "You're all caught up!" : "Nothing here yet."}
            </p>
          </div>
        ) : (
          filtered.map((n) => (
            <NotificationRow key={n.id} n={n} onRead={markRead} />
          ))
        )}
      </div>

      {/* Load more */}
      {hasMore && tab === "all" && (
        <div className="mt-4 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="text-xs font-semibold text-mv-accent border border-mv-border hover:border-mv-primary px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
