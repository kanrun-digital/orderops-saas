<<<<<<< HEAD
import MarketingLandingPage from "@/components/marketing/MarketingLandingPage";

export default function LandingPage() {
  return <MarketingLandingPage />;
=======
import Link from "next/link";
import { ArrowRight, CheckCircle2, LineChart, ShieldCheck, Store } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";

const featureCards = [
  {
    title: "Unified restaurant operations",
    description:
      "Keep orders, menus, staff workflows, and delivery updates in one place instead of jumping between disconnected back-office tools.",
    icon: Store,
  },
  {
    title: "Real-time visibility",
    description:
      "Track fulfillment, sync health, and operational bottlenecks from a single dashboard built for fast-moving teams.",
    icon: LineChart,
  },
  {
    title: "Reliable access control",
    description:
      "Give operators, managers, and support teams secure access to the data they need without exposing the rest.",
    icon: ShieldCheck,
  },
] as const;

const outcomes = [
  "Shorten response time for order issues and delivery escalations.",
  "Reduce manual work across menu, customer, and store operations.",
  "Give managers a cleaner daily view of business-critical workflows.",
] as const;

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b bg-gradient-to-b from-muted/60 via-background to-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-20 lg:flex-row lg:items-center lg:px-8 lg:py-28">
          <div className="max-w-3xl flex-1 space-y-8">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-sm font-medium text-primary">
              OrderOps for restaurant and delivery teams
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Run everyday operations from one calm, focused workspace.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                OrderOps helps teams coordinate orders, menus, customers, and delivery workflows with less context
                switching and better operational clarity.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-2">
                <Link href={ROUTES.login}>
                  Войти
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={ROUTES.signup}>Create account</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {outcomes.map((item) => (
                <div key={item} className="rounded-xl border bg-card p-4 text-sm text-muted-foreground shadow-sm">
                  <CheckCircle2 className="mb-3 h-5 w-5 text-primary" />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <div className="rounded-3xl border bg-card p-6 shadow-xl shadow-primary/5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border bg-background p-5">
                  <p className="text-sm font-medium text-muted-foreground">Operations overview</p>
                  <p className="mt-3 text-3xl font-semibold">24/7</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    A single place to monitor service health, queue pressure, and team follow-ups.
                  </p>
                </div>
                <div className="rounded-2xl border bg-primary p-5 text-primary-foreground">
                  <p className="text-sm font-medium text-primary-foreground/80">Team alignment</p>
                  <p className="mt-3 text-3xl font-semibold">1 workspace</p>
                  <p className="mt-2 text-sm text-primary-foreground/80">
                    Shared visibility across operations, support, and management.
                  </p>
                </div>
                <div className="rounded-2xl border bg-background p-5 md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Built to simplify the daily operating rhythm</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {featureCards.map(({ title, description, icon: Icon }) => (
                      <div key={title} className="rounded-xl border bg-muted/30 p-4">
                        <Icon className="h-5 w-5 text-primary" />
                        <h2 className="mt-3 font-medium">{title}</h2>
                        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
>>>>>>> ce51d02dc4ffd4d9d080f1a195c304414906ebe5
}
