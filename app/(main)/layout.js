import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function MainLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <>
  <Navbar/>
  {children}</>;
}
