"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES } from "@/constants/routes";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  UtensilsCrossed,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Loader2,
  ClipboardList,
  Store,
  Plug,
  CreditCard,
  HelpCircle,
  MessagesSquare,
  Workflow,
  Map,
  QrCode,
  MonitorCog,
  Building2,
  MapPinned,
  UserCog,
  Search,
  Tags,
  RefreshCcw,
  Inbox,
  Database,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AppRole = "owner" | "admin" | "manager" | "staff" | "driver";
type NavSectionId = "primary" | "workspace" | "growth" | "admin" | "support";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  section: NavSectionId;
  roles?: AppRole[];
  mobile?: boolean;
  keywords?: string[];
}

interface NavSection {
  id: NavSectionId;
  label: string;
}

const NAV_SECTIONS: NavSection[] = [
  { id: "primary", label: "Core workflows" },
  { id: "workspace", label: "Workspace" },
  { id: "growth", label: "Growth & channels" },
  { id: "admin", label: "Admin & configuration" },
  { id: "support", label: "Support" },
];

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: ROUTES.dashboard,
    icon: LayoutDashboard,
    section: "primary",
    mobile: true,
    keywords: ["home", "overview", "kpi"],
  },
  {
    label: "Orders",
    href: ROUTES.orders,
    icon: ShoppingBag,
    section: "primary",
    mobile: true,
    keywords: ["fulfillment", "sales"],
  },
  {
    label: "Operations",
    href: ROUTES.operations,
    icon: ClipboardList,
    section: "primary",
    mobile: true,
    roles: ["owner", "admin", "manager"],
    keywords: ["couriers", "dispatch", "terminal"],
  },
  {
    label: "Analytics",
    href: ROUTES.analytics,
    icon: BarChart3,
    section: "primary",
    mobile: true,
    roles: ["owner", "admin", "manager"],
    keywords: ["reports", "metrics", "revenue"],
  },
  {
    label: "Customers",
    href: ROUTES.customers,
    icon: Users,
    section: "workspace",
    mobile: true,
    keywords: ["crm", "profiles"],
  },
  {
    label: "Chats",
    href: ROUTES.chats,
    icon: MessagesSquare,
    section: "workspace",
    keywords: ["support", "messages", "inbox"],
  },
  {
    label: "Menu",
    href: ROUTES.menu,
    icon: UtensilsCrossed,
    section: "workspace",
    mobile: true,
    keywords: ["catalog", "products"],
  },
  {
    label: "Stop list",
    href: ROUTES.stopList,
    icon: Workflow,
    section: "workspace",
    roles: ["owner", "admin", "manager"],
    keywords: ["availability", "86", "products"],
  },
  {
    label: "Integrations",
    href: ROUTES.integrations,
    icon: Plug,
    section: "admin",
    roles: ["owner", "admin", "manager"],
    keywords: ["providers", "connections"],
  },
  {
    label: "Billing",
    href: ROUTES.billing,
    icon: CreditCard,
    section: "admin",
    roles: ["owner", "admin"],
    keywords: ["plan", "subscription", "invoice"],
  },
  {
    label: "Settings",
    href: ROUTES.settings,
    icon: Settings,
    section: "admin",
    keywords: ["preferences", "profile"],
  },
  {
    label: "Help",
    href: ROUTES.help,
    icon: HelpCircle,
    section: "support",
    keywords: ["faq", "docs", "support"],
  },
];

const SECONDARY_NAV_ITEMS: NavItem[] = [
  {
    label: "Sync dashboard",
    href: ROUTES.syncDashboard,
    icon: RefreshCcw,
    section: "admin",
    roles: ["owner", "admin", "manager"],
    keywords: ["jobs", "sync", "logs"],
  },
  {
    label: "QR menu",
    href: ROUTES.qrMenu,
    icon: QrCode,
    section: "growth",
    roles: ["owner", "admin", "manager"],
    keywords: ["tables", "dine in", "public site"],
  },
  {
    label: "Reviews",
    href: ROUTES.reviews,
    icon: MonitorCog,
    section: "growth",
    roles: ["owner", "admin", "manager"],
    keywords: ["feedback", "rating"],
  },
  {
    label: "Staff",
    href: ROUTES.staff,
    icon: UserCog,
    section: "admin",
    roles: ["owner", "admin"],
    keywords: ["team", "members", "roles"],
  },
  {
    label: "Sites",
    href: ROUTES.sites,
    icon: Store,
    section: "growth",
    roles: ["owner", "admin", "manager"],
    keywords: ["public", "website", "landing"],
  },
  {
    label: "Delivery zones",
    href: ROUTES.deliveryZones,
    icon: Map,
    section: "growth",
    roles: ["owner", "admin", "manager"],
    keywords: ["routing", "geo", "delivery area"],
  },
  {
    label: "Restaurants",
    href: ROUTES.restaurants,
    icon: Building2,
    section: "admin",
    roles: ["owner", "admin"],
    keywords: ["locations", "branches"],
  },
  {
    label: "Addresses",
    href: ROUTES.syrveAddresses,
    icon: MapPinned,
    section: "admin",
    roles: ["owner", "admin", "manager"],
    keywords: ["syrve", "streets", "cities"],
  },
  {
    label: "Customer sync",
    href: ROUTES.customerSync,
    icon: RefreshCcw,
    section: "admin",
    roles: ["owner", "admin", "manager"],
    keywords: ["ingestion", "background jobs"],
  },
  {
    label: "Customer segments",
    href: ROUTES.customerSegments,
    icon: Tags,
    section: "growth",
    roles: ["owner", "admin", "manager"],
    keywords: ["audience", "cohorts"],
  },
  {
    label: "Menu sources",
    href: ROUTES.menuSources,
    icon: Database,
    section: "admin",
    roles: ["owner", "admin", "manager"],
    keywords: ["provider catalog", "source data"],
  },
  {
    label: "Menu mapping",
    href: ROUTES.menuMapping,
    icon: Workflow,
    section: "admin",
    roles: ["owner", "admin", "manager"],
    keywords: ["mapping", "catalog sync"],
  },
  {
    label: "Unmapped inbox",
    href: ROUTES.unmappedInbox,
    icon: Inbox,
    section: "admin",
    roles: ["owner", "admin", "manager"],
    keywords: ["unlinked", "queue", "exceptions"],
  },
];

function isRouteActive(pathname: string, href: string) {
  if (href === ROUTES.dashboard) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function hasAccess(item: NavItem, role: string | null | undefined) {
  if (!item.roles?.length) return true;
  return !!role && item.roles.includes(role as AppRole);
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, profile, session, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const currentRole = session?.role || null;

  const primaryNav = useMemo(
    () => NAV_ITEMS.filter((item) => hasAccess(item, currentRole)),
    [currentRole],
  );

  const secondaryNav = useMemo(
    () => SECONDARY_NAV_ITEMS.filter((item) => hasAccess(item, currentRole)),
    [currentRole],
  );

  const navigationBySection = useMemo(() => {
    const visibleItems = [...primaryNav, ...secondaryNav];
    return NAV_SECTIONS.map((section) => ({
      ...section,
      items: visibleItems.filter((item) => item.section === section.id),
    })).filter((section) => section.items.length > 0);
  }, [primaryNav, secondaryNav]);

  const bottomNav = useMemo(() => primaryNav.filter((item) => item.mobile).slice(0, 4), [primaryNav]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(ROUTES.login);
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen">
      <Dialog open={commandOpen} onOpenChange={setCommandOpen}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-xl">
          <DialogHeader className="border-b px-4 py-3">
            <DialogTitle>Quick navigation</DialogTitle>
          </DialogHeader>
          <Command>
            <CommandInput placeholder="Jump to a page..." />
            <CommandList>
              <CommandEmpty>No matching pages.</CommandEmpty>
              {navigationBySection.map((section) => (
                <CommandGroup key={section.id} heading={section.label}>
                  {section.items.map((item) => (
                    <CommandItem
                      key={item.href}
                      value={[item.label, item.href, ...(item.keywords ?? [])].join(" ")}
                      onSelect={() => {
                        setCommandOpen(false);
                        router.push(item.href);
                      }}
                      className="flex items-center gap-2"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{item.href}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>

      <aside className="hidden w-72 flex-col border-r bg-card md:flex">
        <div className="flex h-14 items-center border-b px-4">
          <Link href={ROUTES.dashboard} className="flex items-center gap-2 text-lg font-bold">
            <ShoppingBag className="h-5 w-5 text-primary" />
            OrderOps
          </Link>
        </div>
        <div className="border-b p-3">
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="flex w-full items-center gap-3 rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Search className="h-4 w-4" />
            <span>Search pages</span>
            <span className="ml-auto rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wide">⌘K</span>
          </button>
        </div>
        <nav className="flex-1 space-y-5 overflow-y-auto p-3">
          {navigationBySection.map((section) => (
            <div key={section.id} className="space-y-1">
              <p className="px-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground/80">
                {section.label}
              </p>
              {section.items.map((item) => {
                const isActive = isRouteActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="border-t p-2">
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-72 flex-col bg-card">
            <div className="flex h-14 items-center justify-between border-b px-4">
              <span className="text-lg font-bold">OrderOps</span>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="border-b p-3">
              <button
                type="button"
                onClick={() => {
                  setSidebarOpen(false);
                  setCommandOpen(true);
                }}
                className="flex w-full items-center gap-3 rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground"
              >
                <Search className="h-4 w-4" />
                Search pages
              </button>
            </div>
            <nav className="flex-1 space-y-5 overflow-y-auto p-3">
              {navigationBySection.map((section) => (
                <div key={section.id} className="space-y-1">
                  <p className="px-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground/80">
                    {section.label}
                  </p>
                  {section.items.map((item) => {
                    const isActive = isRouteActive(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 md:px-6">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="hidden items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-muted-foreground md:flex"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
              {(profile?.display_name || profile?.full_name)?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium">
                {profile?.display_name || profile?.full_name || "User"}
              </p>
              {currentRole && (
                <p className="text-xs capitalize text-muted-foreground">{currentRole}</p>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 pb-20 md:p-6 md:pb-6">
          {children}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around border-t bg-card py-2 md:hidden">
          {bottomNav.map((item) => {
            const isActive = isRouteActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
