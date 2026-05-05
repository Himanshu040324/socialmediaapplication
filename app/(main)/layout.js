import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default async function MainLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch profile: username, avatar, role
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url, role")
    .eq("id", user.id)
    .single();

  const userName =
    profile?.username ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "User";

  const avatarUrl =
    profile?.avatar_url || user.user_metadata?.avatar_url || null;

  const isAdmin = profile?.role === "admin";

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar userId={user.id} />

      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar
          userId={user.id}
          userName={userName}
          avatarUrl={avatarUrl}
          isAdmin={isAdmin}
        />

        <main
          style={{
            flex: 1,
            minWidth: 0,
            padding: "24px",
            backgroundColor: "var(--mv-bg)",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}