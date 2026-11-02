import type { Child } from "hono/jsx";
import type { UserSession } from "../../utils/auth";
import { BaseHead } from "./base_head";
import { AdminSidebar } from "./components/admin_sidebar";
import { AdminMobileNav } from "./components/admin_mobile_nav";

interface AdminLayoutProps {
  title: string;
  user: UserSession;
  activePath?: string;
  children: Child;
}

export function AdminLayout({ title, user, activePath = "/admin", children }: AdminLayoutProps) {
  return (
    <html lang="es" class="h-full bg-neutral-950">
      <BaseHead title={`${title} — Panel de Gestión`}>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          crossOrigin=""
        ></script>
        <style>{`
          .sidebar-scroll::-webkit-scrollbar {
            width: 4px;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb {
            background: #262626;
            border-radius: 4px;
          }
          .leaflet-control-attribution,
          .leaflet-control-zoom {
            display: none !important;
          }
          .leaflet-container {
            font-family: inherit;
            background: #171717;
          }
        `}</style>
      </BaseHead>
      <body class="min-h-full bg-neutral-950 text-slate-100 antialiased flex flex-col md:flex-row">
        <AdminMobileNav user={user} activePath={activePath} />
        <AdminSidebar user={user} activePath={activePath} />

        <main class="flex-1 md:pl-64 min-w-0">
          <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
