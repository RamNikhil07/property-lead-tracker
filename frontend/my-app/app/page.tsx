"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartItem = {
  label: string;
  count: number;
};

type DashboardData = {
  total_properties: number;
  total_leads: number;
  converted_leads: number;
  leads_by_status: ChartItem[];
  properties_by_location: ChartItem[];
};

const chartColors = ["#0f766e", "#f59e0b", "#2563eb", "#e11d48"];

function formatError(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function Home() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [insights, setInsights] = useState<string | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/dashboard");
        if (!response.ok) {
          throw new Error("The dashboard data could not be loaded.");
        }
        setDashboard(await response.json());
      } catch (error) {
        setDashboardError(formatError(error, "The dashboard data could not be loaded."));
      } finally {
        setDashboardLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const generateInsights = async () => {
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/ai/insights", { method: "POST" });
      if (!response.ok) {
        throw new Error("Insights are unavailable right now. Please try again.");
      }
      const result: { insights: string } = await response.json();
      setInsights(result.insights);
    } catch (error) {
      setInsightsError(formatError(error, "Insights are unavailable right now. Please try again."));
    } finally {
      setInsightsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="min-h-screen bg-[#f4f7f6] text-slate-900">
        <nav className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-lg font-bold text-white">
                P
              </span>
              <span className="text-lg font-semibold tracking-tight">Property Desk</span>
            </Link>
            <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
              <Link href="/" className="text-teal-700">Dashboard</Link>
              <Link href="/properties" className="transition-colors hover:text-teal-700">
                Properties &amp; Agents
              </Link>
              <Link href="/leads" className="transition-colors hover:text-teal-700">
                Leads
              </Link>
            </div>
          </div>
        </nav>

        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
          <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
                Overview
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Dashboard</h1>
              <p className="mt-2 text-slate-500">A clear view of your property pipeline.</p>
            </div>
            <button
              type="button"
              onClick={generateInsights}
              disabled={insightsLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60"
            >
              {insightsLoading ? "Generating..." : "Generate Property Insights"}
              {!insightsLoading && <span aria-hidden="true">-&gt;</span>}
            </button>
          </header>

          {dashboardLoading && (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              Loading dashboard data...
            </div>
          )}

          {dashboardError && (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
              {dashboardError}
            </div>
          )}

          {dashboard && !dashboardLoading && !dashboardError && (
            <>
              <section aria-label="Key performance indicators" className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">Total Properties</p>
                  <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                    {dashboard.total_properties}
                  </p>
                  <p className="mt-2 text-xs font-medium text-teal-700">Active inventory</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">Total Leads</p>
                  <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                    {dashboard.total_leads}
                  </p>
                  <p className="mt-2 text-xs font-medium text-blue-700">Across all stages</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">Converted Leads</p>
                  <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                    {dashboard.converted_leads}
                  </p>
                  <p className="mt-2 text-xs font-medium text-amber-700">Closed opportunities</p>
                </div>
              </section>

              <section className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-950">Leads by Status</h2>
                    <p className="mt-1 text-sm text-slate-500">Current distribution of your pipeline.</p>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboard.leads_by_status}
                          dataKey="count"
                          nameKey="label"
                          cx="50%"
                          cy="46%"
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={3}
                        >
                          {dashboard.leads_by_status.map((entry, index) => (
                            <Cell key={entry.label} fill={chartColors[index % chartColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={28} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-950">Properties by Location</h2>
                    <p className="mt-1 text-sm text-slate-500">Inventory spread across your markets.</p>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboard.properties_by_location} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#0f766e" radius={[5, 5, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>
            </>
          )}

          {(insights || insightsError) && (
            <section className="mt-6 rounded-xl border border-teal-200 bg-teal-50 p-6" aria-live="polite">
              <h2 className="text-lg font-semibold text-teal-950">Property Insights</h2>
              {insightsError && <p role="alert" className="mt-3 text-sm text-rose-700">{insightsError}</p>}
              {insights && <p className="mt-3 whitespace-pre-line text-sm leading-7 text-teal-900">{insights}</p>}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
