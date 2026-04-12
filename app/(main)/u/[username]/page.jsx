import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import ProfilePage from "@/components/ProfilePage";

export default async function PublicProfilePage({ params }) {
  const { username } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch the profile being viewed
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, banner_url, bio, created_at")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  // Karma
  const { data: karmaData } = await supabase
    .from("votes")
    .select("value, posts!inner(author_id)")
    .eq("posts.author_id", profile.id);

  const karma = karmaData?.reduce((sum, v) => sum + v.value, 0) ?? 0;

  // Posts
  const { data: posts } = await supabase
    .from("posts")
    .select(
      `
      id, title, body, image_url, link_url, type, created_at,
      communities(id, name),
      votes(value),
      comments(id)
    `,
    )
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false });

  const enrichedPosts = (posts ?? []).map((p) => ({
    ...p,
    score: p.votes?.reduce((sum, v) => sum + v.value, 0) ?? 0,
    commentCount: p.comments?.length ?? 0,
  }));

  const isOwner = user.id === profile.id;

  return (
    <ProfilePage
      profile={profile}
      karma={karma}
      posts={enrichedPosts}
      isOwner={isOwner}
      userId={user.id}
    />
  );
}
