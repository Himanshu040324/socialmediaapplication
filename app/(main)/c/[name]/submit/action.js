"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function submitPostAction(formData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = formData.get("title")?.trim();
  const body = formData.get("body")?.trim();
  const link_url = formData.get("link_url")?.trim();
  const type = formData.get("type"); // 'text' | 'image' | 'link'
  // const communityId = formData.get('community_id')
  const communityName = formData.get("community_name");

  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("name", communityName)
    .single();

  if (!community) return { error: "Community not found." };

  const communityId = community.id;

  // Validation
  if (!title) {
    return { error: "Title is required." };
  }

  if (title.length > 300) {
    return { error: "Title must be 300 characters or less." };
  }

  if (type === "link") {
    if (!link_url) {
      return { error: "A URL is required for link posts." };
    }
    try {
      new URL(link_url);
    } catch {
      return { error: "Please enter a valid URL including https://" };
    }
  }

  if (type === "text" && !body) {
    return { error: "Post body is required for text posts." };
  }

  // Handle image upload
  let image_url = null;
  if (type === "image") {
    const imageFile = formData.get("image");

    if (!imageFile || imageFile.size === 0) {
      return { error: "Please select an image to upload." };
    }

    if (imageFile.size > 5 * 1024 * 1024) {
      return { error: "Image must be under 5MB." };
    }

    const ext = imageFile.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(fileName, imageFile);

    if (uploadError) {
      return { error: "Image upload failed. Try again." };
    }

    const { data: urlData } = supabase.storage
      .from("post-images")
      .getPublicUrl(fileName);

    image_url = urlData.publicUrl;
  }

  // Insert post
  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      title,
      body: type === "text" ? body : null,
      link_url: type === "link" ? link_url : null,
      image_url: type === "image" ? image_url : null,
      type,
      community_id: communityId,
      author_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Redirect to the new post
  redirect(`/post/${post.id}`);
}
