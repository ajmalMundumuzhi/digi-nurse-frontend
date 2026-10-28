
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-h-screen md:pl-64">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <Outlet />

          <footer className="mt-10 border-t border-slate-200 py-5 text-center text-xs leading-5 text-slate-400 sm:text-left">
            NurseFlow · Hackathon prototype · Use fictional patient data for demonstrations
          </footer>
        </main>
      </div>
    </div>
  );
}
