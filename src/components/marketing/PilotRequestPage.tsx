"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarketingShell from "@/components/marketing/MarketingShell";
import { Textarea } from "@/components/ui/textarea";
import { useLanguageSwitcher } from "@/hooks/useLanguageSwitcher";

type PilotFormState = {
  name: string;
  email: string;
  phone: string;
  restaurantName: string;
  cityCountry: string;
  locationsCount: string;
  posChoice: string;
  posOther: string;
  deliveryPlatforms: string[];
  biggestPain: string;
  preferredTime: string;
  note: string;
};

const initialState: PilotFormState = {
  name: "",
  email: "",
  phone: "",
  restaurantName: "",
  cityCountry: "",
  locationsCount: "",
  posChoice: "",
  posOther: "",
  deliveryPlatforms: [],
  biggestPain: "",
  preferredTime: "",
  note: "",
};

function StepLabel({ number, title, active }: { number: string; title: string; active: boolean }) {
  return (
    <div className={`rounded-2xl border px-4 py-3 ${active ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-500"}`}>
      <div className="text-xs uppercase tracking-[0.3em]">{number}</div>
      <div className="mt-1 font-semibold">{title}</div>
    </div>
  );
}

export function PilotRequestPage() {
  const { copy } = useLanguageSwitcher();
  const pilot = copy.pilot;
  const otherPosOption = pilot.options.pos[2];

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<PilotFormState>(initialState);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const stepOneErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = pilot.validation.name;
    if (!/\S+@\S+\.\S+/.test(form.email.trim())) errors.email = pilot.validation.email;
    if (!form.restaurantName.trim()) errors.restaurantName = pilot.validation.restaurantName;
    if (!form.cityCountry.trim()) errors.cityCountry = pilot.validation.cityCountry;
    if (!form.locationsCount) errors.locationsCount = pilot.validation.locationsCount;
    return errors;
  }, [form, pilot.validation]);

  const stepTwoErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!form.posChoice) errors.posChoice = pilot.validation.posChoice;
    if (form.posChoice === otherPosOption && !form.posOther.trim()) errors.posOther = pilot.validation.posOther;
    if (form.deliveryPlatforms.length === 0) errors.deliveryPlatforms = pilot.validation.deliveryPlatforms;
    return errors;
  }, [form, otherPosOption, pilot.validation]);

  const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  const updateField = <K extends keyof PilotFormState>(field: K, value: PilotFormState[K]) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "posChoice" && value !== otherPosOption ? { posOther: "" } : {}),
    }));
  };

  const togglePlatform = (platform: string) => {
    setForm((prev) => ({
      ...prev,
      deliveryPlatforms: prev.deliveryPlatforms.includes(platform)
        ? prev.deliveryPlatforms.filter((item) => item !== platform)
        : [...prev.deliveryPlatforms, platform],
    }));
  };

  const continueToStepTwo = () => {
    setTouched((prev) => ({
      ...prev,
      name: true,
      email: true,
      restaurantName: true,
      cityCountry: true,
      locationsCount: true,
    }));

    if (Object.keys(stepOneErrors).length === 0) {
      setStep(2);
    }
  };

  const submit = () => {
    setTouched((prev) => ({ ...prev, posChoice: true, posOther: true, deliveryPlatforms: true }));

    if (Object.keys(stepTwoErrors).length === 0) {
      setSubmitted(true);
    }
  };

  return (
    <MarketingShell>
      <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        {submitted ? (
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950">{pilot.success.title}</h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">{pilot.success.subtitle}</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild className="rounded-full bg-slate-950 text-white hover:bg-slate-800">
                <Link href="/demo">{pilot.actions.viewDemo}</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/">{copy.common.backHome}</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">{pilot.eyebrow}</p>
                <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{pilot.title}</h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600">{pilot.subtitle}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <StepLabel number="01" title={pilot.steps.contact} active={step === 1} />
                <StepLabel number="02" title={pilot.steps.integrations} active={step === 2} />
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                {step === 1 ? (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-slate-950">{pilot.step1Title}</h2>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{pilot.step1Subtitle}</p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">{pilot.labels.name}</label>
                        <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} onBlur={() => markTouched("name")} placeholder={pilot.placeholders.name} />
                        {touched.name && stepOneErrors.name ? <p className="text-sm text-rose-600">{stepOneErrors.name}</p> : null}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">{pilot.labels.email}</label>
                        <Input value={form.email} onChange={(e) => updateField("email", e.target.value)} onBlur={() => markTouched("email")} placeholder={pilot.placeholders.email} />
                        {touched.email && stepOneErrors.email ? <p className="text-sm text-rose-600">{stepOneErrors.email}</p> : null}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">{pilot.labels.phone}</label>
                        <Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder={pilot.placeholders.phone} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">{pilot.labels.restaurantName}</label>
                        <Input value={form.restaurantName} onChange={(e) => updateField("restaurantName", e.target.value)} onBlur={() => markTouched("restaurantName")} placeholder={pilot.placeholders.restaurantName} />
                        {touched.restaurantName && stepOneErrors.restaurantName ? <p className="text-sm text-rose-600">{stepOneErrors.restaurantName}</p> : null}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">{pilot.labels.cityCountry}</label>
                        <Input value={form.cityCountry} onChange={(e) => updateField("cityCountry", e.target.value)} onBlur={() => markTouched("cityCountry")} placeholder={pilot.placeholders.cityCountry} />
                        {touched.cityCountry && stepOneErrors.cityCountry ? <p className="text-sm text-rose-600">{stepOneErrors.cityCountry}</p> : null}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">{pilot.labels.locationsCount}</label>
                        <select value={form.locationsCount} onChange={(e) => updateField("locationsCount", e.target.value)} onBlur={() => markTouched("locationsCount")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="">{pilot.placeholders.locationRange}</option>
                          {pilot.options.locations.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                        {touched.locationsCount && stepOneErrors.locationsCount ? <p className="text-sm text-rose-600">{stepOneErrors.locationsCount}</p> : null}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button className="rounded-full bg-slate-950 text-white hover:bg-slate-800" onClick={continueToStepTwo}>
                        {pilot.actions.continue}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-slate-950">{pilot.step2Title}</h2>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{pilot.step2Subtitle}</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">{pilot.labels.posSystem}</label>
                      <select value={form.posChoice} onChange={(e) => updateField("posChoice", e.target.value)} onBlur={() => markTouched("posChoice")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="">{pilot.placeholders.posSystem}</option>
                        {pilot.options.pos.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      {touched.posChoice && stepTwoErrors.posChoice ? <p className="text-sm text-rose-600">{stepTwoErrors.posChoice}</p> : null}
                    </div>

                    {form.posChoice === otherPosOption ? (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">{pilot.labels.posName}</label>
                        <Input value={form.posOther} onChange={(e) => updateField("posOther", e.target.value)} onBlur={() => markTouched("posOther")} placeholder={pilot.placeholders.posName} />
                        {touched.posOther && stepTwoErrors.posOther ? <p className="text-sm text-rose-600">{stepTwoErrors.posOther}</p> : null}
                      </div>
                    ) : null}

                    <div className="space-y-3">
                      <label className="text-sm font-medium text-slate-700">{pilot.labels.deliveryPlatforms}</label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {pilot.options.delivery.map((option) => (
                          <label key={option} className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                            <Checkbox checked={form.deliveryPlatforms.includes(option)} onCheckedChange={() => togglePlatform(option)} />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                      {touched.deliveryPlatforms && stepTwoErrors.deliveryPlatforms ? <p className="text-sm text-rose-600">{stepTwoErrors.deliveryPlatforms}</p> : null}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">{pilot.labels.biggestPain}</label>
                      <select value={form.biggestPain} onChange={(e) => updateField("biggestPain", e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="">{pilot.placeholders.optional}</option>
                        {pilot.options.pain.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">{pilot.labels.preferredTime}</label>
                      <Input value={form.preferredTime} onChange={(e) => updateField("preferredTime", e.target.value)} placeholder={pilot.placeholders.preferredTime} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">{pilot.labels.notes}</label>
                      <Textarea value={form.note} onChange={(e) => updateField("note", e.target.value)} placeholder={pilot.placeholders.notes} />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                      <Button variant="outline" className="rounded-full" onClick={() => setStep(1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {pilot.actions.back}
                      </Button>
                      <Button className="rounded-full bg-slate-950 text-white hover:bg-slate-800" onClick={submit}>
                        {pilot.actions.submit}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
                <h2 className="text-xl font-semibold">{pilot.sidebar.title}</h2>
                <div className="mt-5 space-y-3">
                  {pilot.sidebar.items.map((item) => (
                    <div key={item} className="flex gap-3 text-sm leading-7 text-slate-300">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-950">{pilot.sidebar.noteTitle}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{pilot.sidebar.noteBody}</p>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-amber-50 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-950">{pilot.sidebar.afterTitle}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-700">{pilot.sidebar.afterBody}</p>
                <div className="mt-5">
                  <Button asChild variant="outline" className="rounded-full border-amber-300 bg-white">
                    <Link href="/demo">{pilot.sidebar.previewDemo}</Link>
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      <MarketingFooter />
    </MarketingShell>
  );
}

export default PilotRequestPage;
