"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8091";

type DashboardItem = {
  invoice_id: string;
  customer: string;
  days_overdue: number;
  amount: number;
  history_count: number;
  risk_level: "HIGH" | "MEDIUM" | "LOW";
  channels: string[];
  status: "sent" | "skipped" | "failed";
  last_notified_at?: string;
  last_email_at?: string;
  last_sms_at?: string;
};

type Stats = {
  total: number;
  high_risk: number;
  sent_today: number;
  failed: number;
};

const emptyStats: Stats = {
  total: 0,
  high_risk: 0,
  sent_today: 0,
  failed: 0,
};

const riskBadgeStyles: Record<DashboardItem["risk_level"], string> = {
  HIGH: "bg-red-100 text-red-700 border border-red-200",
  MEDIUM: "bg-amber-100 text-amber-700 border border-amber-200",
  LOW: "bg-emerald-100 text-emerald-700 border border-emerald-200",
};

const statusBadgeStyles: Record<DashboardItem["status"], string> = {
  sent: "bg-indigo-100 text-indigo-700 border border-indigo-200",
  skipped: "bg-zinc-100 text-zinc-600 border border-zinc-200",
  failed: "bg-rose-100 text-rose-700 border border-rose-200",
};

export default function DashboardPage() {
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [loading, setLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState<"ALL" | DashboardItem["risk_level"]>(
    "ALL"
  );
  const [minDays, setMinDays] = useState(0);
  const [maxDays, setMaxDays] = useState(90);
  const [autoEnabled, setAutoEnabled] = useState<boolean | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overdueRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/dashboard/overdue`),
        fetch(`${API_BASE}/dashboard/stats`),
      ]);
      const autoRes = await fetch(`${API_BASE}/notify/auto`);
      if (!overdueRes.ok || !statsRes.ok) {
        throw new Error("Failed to load dashboard data");
      }
      const overdueData = await overdueRes.json();
      const statsData = await statsRes.json();
      if (autoRes.ok) {
        const autoData = await autoRes.json();
        setAutoEnabled(Boolean(autoData.enabled));
      }
      setItems(overdueData.items ?? []);
      setStats({
        total: statsData.total ?? 0,
        high_risk: statsData.high_risk ?? 0,
        sent_today: statsData.sent_today ?? 0,
        failed: statsData.failed ?? 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const runScan = async () => {
    setScanLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/scan`, { method: "POST" });
      if (!res.ok) {
        throw new Error("Scan failed");
      }
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan error");
    } finally {
      setScanLoading(false);
    }
  };

  const toggleAuto = async () => {
    if (autoEnabled === null) return;
    const nextState = autoEnabled ? "off" : "on";
    try {
      const res = await fetch(`${API_BASE}/notify/auto/${nextState}`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Failed to toggle auto scan");
      }
      const data = await res.json();
      setAutoEnabled(Boolean(data.enabled));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auto toggle error");
    }
  };

  const sendNotification = async (
    invoiceId: string,
    channel: "sms" | "email"
  ) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/notify/${invoiceId}/${channel}`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Notification failed");
      }
      const payload = await res.json();
      if (payload?.item) {
        setItems((prev) =>
          prev.map((item) =>
            item.invoice_id === payload.item.invoice_id ? payload.item : item
          )
        );
      }
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Notification error");
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.customer
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesRisk = risk === "ALL" ? true : item.risk_level === risk;
      const matchesDays =
        item.days_overdue >= minDays && item.days_overdue <= maxDays;
      return matchesSearch && matchesRisk && matchesDays;
    });
  }, [items, search, risk, minDays, maxDays]);

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="relative overflow-hidden border-b border-white/5 bg-gradient-to-br from-indigo-600 via-indigo-500 to-emerald-400">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent_55%)]" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 text-white">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-white/70">
                Smart Notifications
              </p>
              <h1 className="text-3xl font-semibold md:text-4xl">
                ERPNext Overdue Intelligence
              </h1>
              <p className="mt-2 text-sm text-white/80">
                Real‑time risk scoring, channel selection, and audit visibility.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                data-testid="scan-button"
                onClick={runScan}
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-lg shadow-indigo-900/20 transition hover:-translate-y-0.5 hover:bg-indigo-50"
                disabled={scanLoading}
              >
                {scanLoading ? "Scanning..." : "Scan Now"}
              </button>
              <button
                onClick={toggleAuto}
                className={`inline-flex items-center justify-center rounded-full px-4 py-3 text-xs font-semibold uppercase tracking-widest transition ${
                  autoEnabled
                    ? "bg-emerald-200/90 text-emerald-900 hover:bg-emerald-200"
                    : "bg-white/15 text-white hover:bg-white/25"
                }`}
              >
                Auto Scan {autoEnabled ? "On" : "Off"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard testId="kpi-total" label="Overdue invoices" value={stats.total} />
          <KpiCard testId="kpi-high-risk" label="High‑risk" value={stats.high_risk} accent="HIGH" />
          <KpiCard testId="kpi-sent-today" label="Notifications sent" value={stats.sent_today} />
          <KpiCard testId="kpi-failed" label="Failed" value={stats.failed} accent="FAILED" />
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-zinc-900/70 p-6 shadow-xl shadow-black/40">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Overdue watchlist
              </h2>
              <p className="text-sm text-zinc-400">
                Prioritized by risk and payment history.
              </p>
            </div>
            {error && (
              <span className="rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-xs text-rose-200">
                {error}
              </span>
            )}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
            <label className="flex flex-col gap-2 text-sm text-zinc-300">
              Customer search
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Type customer name"
                className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-2 text-sm text-white outline-none focus:border-indigo-400"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-zinc-300">
              Risk level
              <select
                data-testid="risk-filter"
                value={risk}
                onChange={(event) =>
                  setRisk(event.target.value as "ALL" | DashboardItem["risk_level"])
                }
                className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-2 text-sm text-white outline-none focus:border-indigo-400"
              >
                <option value="ALL">All</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm text-zinc-300">
              Days overdue range
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={minDays}
                  onChange={(event) => setMinDays(Number(event.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
                />
                <span className="text-zinc-500">to</span>
                <input
                  type="number"
                  value={maxDays}
                  onChange={(event) => setMaxDays(Number(event.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
                />
              </div>
            </label>
          </div>

          <div className="mt-6 hidden overflow-hidden rounded-2xl border border-white/10 lg:block" data-testid="overdue-table">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-white/5 text-xs uppercase text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Days</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">History</th>
                  <th className="px-4 py-3">Risk</th>
                  <th className="px-4 py-3">Channels</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Email</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-6 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-6 text-center">
                      No overdue invoices found.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr
                      key={item.invoice_id}
                      className="border-t border-white/10 hover:bg-white/5"
                    >
                      <td className="px-4 py-3 font-medium text-white">
                        {item.invoice_id}
                      </td>
                      <td className="px-4 py-3">{item.customer}</td>
                      <td className="px-4 py-3">{item.days_overdue}</td>
                      <td className="px-4 py-3">₪{item.amount.toLocaleString()}</td>
                      <td className="px-4 py-3">{item.history_count}</td>
                      <td className="px-4 py-3">
                        <span
                          data-testid={`risk-badge-${item.risk_level.toLowerCase()}`}
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            riskBadgeStyles[item.risk_level]
                          }`}
                        >
                          {item.risk_level}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {item.channels.length === 0
                            ? "-"
                            : item.channels.map((channel) => (
                                <span
                                  key={channel}
                                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs"
                                >
                                  {channel.toUpperCase()}
                                </span>
                              ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            statusBadgeStyles[item.status]
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-400">
                        {item.last_email_at
                          ? new Date(item.last_email_at).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => sendNotification(item.invoice_id, "sms")}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white transition hover:bg-white/10"
                          >
                            Send SMS
                          </button>
                          <button
                            onClick={() => sendNotification(item.invoice_id, "email")}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white transition hover:bg-white/10"
                          >
                            Send Email
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid gap-4 lg:hidden">
            {loading ? (
              <CardSkeleton />
            ) : filteredItems.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-6 text-center text-sm text-zinc-400">
                No overdue invoices found.
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.invoice_id}
                  className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {item.invoice_id}
                      </p>
                      <p className="text-xs text-zinc-400">{item.customer}</p>
                    </div>
                    <span
                      data-testid={`risk-badge-${item.risk_level.toLowerCase()}`}
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        riskBadgeStyles[item.risk_level]
                      }`}
                    >
                      {item.risk_level}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-zinc-400">
                    <div>
                      <p className="uppercase text-[10px] tracking-wide">Days</p>
                      <p className="text-sm text-white">{item.days_overdue}</p>
                    </div>
                    <div>
                      <p className="uppercase text-[10px] tracking-wide">Amount</p>
                      <p className="text-sm text-white">₪{item.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="uppercase text-[10px] tracking-wide">History</p>
                      <p className="text-sm text-white">{item.history_count}</p>
                    </div>
                    <div>
                      <p className="uppercase text-[10px] tracking-wide">Status</p>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${
                          statusBadgeStyles[item.status]
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div>
                      <p className="uppercase text-[10px] tracking-wide">Last Email</p>
                      <p className="text-sm text-white">
                        {item.last_email_at
                          ? new Date(item.last_email_at).toLocaleString()
                          : "-"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.channels.length === 0
                      ? "-"
                      : item.channels.map((channel) => (
                          <span
                            key={channel}
                            className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-200"
                          >
                            {channel.toUpperCase()}
                          </span>
                        ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => sendNotification(item.invoice_id, "sms")}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white transition hover:bg-white/10"
                    >
                      Send SMS
                    </button>
                    <button
                      onClick={() => sendNotification(item.invoice_id, "email")}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white transition hover:bg-white/10"
                    >
                      Send Email
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  testId,
  label,
  value,
  accent,
}: {
  testId?: string;
  label: string;
  value: number;
  accent?: "HIGH" | "FAILED";
}) {
  const accentStyles =
    accent === "HIGH"
      ? "border-red-500/30 bg-red-500/10 text-red-100"
      : accent === "FAILED"
      ? "border-rose-500/30 bg-rose-500/10 text-rose-100"
      : "border-white/10 bg-white/5 text-zinc-200";

  return (
    <div
      data-testid={testId}
      className={`rounded-2xl border px-5 py-4 shadow-lg shadow-black/30 ${accentStyles}`}
    >
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-6 text-center text-sm text-zinc-400">
      Loading...
    </div>
  );
}
