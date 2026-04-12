import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ProfilePage from "@/components/ProfilePage";

export default async function OwnProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, banner_url, bio, created_at")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Karma = sum of all votes received on the user's posts
  const { data: karmaData } = await supabase
    .from("votes")
    .select("value, posts!inner(author_id)")
    .eq("posts.author_id", user.id);

  const karma = karmaData?.reduce((sum, v) => sum + v.value, 0) ?? 0;

  // Posts by this user
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
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  const enrichedPosts = (posts ?? []).map((p) => ({
    ...p,
    score: p.votes?.reduce((sum, v) => sum + v.value, 0) ?? 0,
    commentCount: p.comments?.length ?? 0,
  }));

  return (
    <ProfilePage
      profile={profile}
      karma={karma}
      posts={enrichedPosts}
      isOwner={true}
      userId={user.id}
    />
  );
}
