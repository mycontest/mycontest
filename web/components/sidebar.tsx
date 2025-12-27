"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Code2, Trophy, MessageSquare, Bell, Settings, Menu } from "lucide-react";
import { useState } from "react";

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarItems: SidebarItem[] = [
    {
      icon: Code2,
      label: "Problems",
      href: "/problems",
    },
    {
      icon: Trophy,
      label: "Contests",
      href: "/contests",
    },
    {
      icon: MessageSquare,
      label: "Discuss",
      href: "/discuss",
    },
    {
      icon: Bell,
      label: "Notifications",
      href: "/notifications",
      badge: 3, // This will come from state/API
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/settings",
    },
  ];

  return (
    <div className={cn("flex flex-col h-screen bg-card border-r border-border transition-all duration-300", isCollapsed ? "w-16" : "w-64")}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <Link href="/" className="flex items-center space-x-2">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">MyContest</span>
          </Link>
        )}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 hover:bg-accent rounded-md transition-colors">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative", isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground")}>
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && <span className="px-2 py-0.5 text-xs font-medium bg-destructive text-destructive-foreground rounded-full">{item.badge}</span>}
                </>
              )}
              {isCollapsed && item.badge !== undefined && item.badge > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center">{item.badge}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">U</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Username</p>
              <p className="text-xs text-muted-foreground truncate">user@example.com</p>
            </div>
          </div>
        ) : (
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium mx-auto">U</div>
        )}
      </div>
    </div>
  );
}
