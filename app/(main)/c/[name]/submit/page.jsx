import { createClient }    from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import SubmitPostClient   from "@/components/SubmitPostClient";

export default async function SubmitPostPage({ params }) {
  const { name } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: community } = await supabase
    .from("communities")
    .select("id, name, description, avatar_url")
    .eq("name", name)
    .single();

  if (!community) notFound();

  // Check membership — only members/creators can post
  const { data: membership } = await supabase
    .from("community_members")
    .select("user_id")
    .eq("community_id", community.id)
    .eq("user_id", user.id)
    .single();

  const { data: communityRow } = await supabase
    .from("communities")
    .select("created_by")
    .eq("id", community.id)
    .single();

  const canPost = !!membership || communityRow?.created_by === user.id;
  if (!canPost) redirect(`/c/${name}`);

  // Fetch this community's flairs so the form can show the picker
  const { data: flairs } = await supabase
    .from("flairs")
    .select("id, name, color")
    .eq("community_id", community.id)
    .order("created_at", { ascending: true });

  return (
    <SubmitPostClient
      community={community}
      userId={user.id}
      flairs={flairs ?? []}
    />
  );
}