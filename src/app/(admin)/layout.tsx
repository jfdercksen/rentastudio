import { createClient } from "@/lib/supabase/server";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  // Middleware already protects /dashboard routes; getUser() here for user email display
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div style={{ minHeight: "100vh", background: "#f5f0e8" }}>
      <AdminNav userEmail={user?.email ?? null} />
      <main
        style={{
          marginLeft: 240,
          padding: "40px 48px",
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
}
