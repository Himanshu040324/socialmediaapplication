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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar userId={user.id} />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar userId={user.id} />

        <main style={{
          flex: 1,
          minWidth: 0,          // prevents flex overflow
          padding: '24px',
          backgroundColor: 'var(--mv-bg)',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}