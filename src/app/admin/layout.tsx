import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");
  
  // Basic protection: if we are not on the login page and no token, redirect.
  // Exception: The Login page itself is distinct, so we need to handle that.
  // But Next.js Layout wraps pages. 
  // Ideally, I should put the Login page OUTSIDE this layout or handle it carefully.
  // Actually, I'll just check if the user is authenticated. 
  // If this layout applies to /admin/login, we have a loop if we redirect to /admin/login.
  // So I will make this layout apply to everything inside /admin, BUT I'll structure it so /admin/login is separate 
  // OR I will just handle the check in the children pages or Middleware.

  // Middleware is cleaner, but let's stick to simple layout logic for now.
  // I'll assume /admin/login uses the root layout, or this layout detects the path?
  // Layouts don't know the path easily.
  
  // STRATEGY: 
  // I will make the token check inside the Page components for dashboard/editor using a helper, 
  // or use Middleware. 
  // Let's use a Middleware file for the entire /admin route. It's properly Next.js.
  
  return (
      <div className="min-h-screen flex flex-col">
        <nav className="bg-black text-white p-4 flex justify-between items-center">
            <Link href="/admin" className="font-serif text-xl">ARODY Admin</Link>
            <div className="flex gap-4 text-sm uppercase">
               <Link href="/" target="_blank">View Site</Link>
               <Link href="/admin/editor">New Post</Link>
            </div>
        </nav>
        <main className="flex-grow bg-gray-50 p-6">
            {children}
        </main>
      </div>
  );
}
