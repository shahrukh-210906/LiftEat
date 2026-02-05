import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function AppLayout({ children, hideNav = false }: AppLayoutProps) {
  return (
    <div className="min-h-screen w-full relative">
      <div className="flex">
        
        {/* Desktop Sidebar Container 
            - Sticky positioning ensures it stays in view
            - Added 'h-screen' to fully occupy the vertical space for the sticky behavior
        */}
        <aside className="hidden md:block w-72 shrink-0 h-screen sticky top-0 z-40">
          <Sidebar />
        </aside>

        {/* Main Content 
            - Increased max-width to 'max-w-7xl' for a wider, less centered-column look
            - Increased padding 'md:p-10' to push content down from the top
        */}
        <main className="flex-1 w-full relative">
          <div className="w-full max-w-7xl mx-auto p-4 md:p-10 pb-32">
             {/* The children now have room to breathe */}
            {children}
          </div>
        </main>
      </div>

      <div className="md:hidden">
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}