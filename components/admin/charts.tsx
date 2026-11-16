"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function OrdersChart({ data }: { data: { date: string; count: number; value: number }[] }) {
  const points = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
  }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="oc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b39a6b" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#b39a6b" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5ddd0" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#7a6f62" }} tickLine={false} axisLine={{ stroke: "#e5ddd0" }} interval="preserveStartEnd" />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#7a6f62" }} tickLine={false} axisLine={false} width={28} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid #e5ddd0", fontSize: 12 }}
          labelStyle={{ color: "#241c15" }}
        />
        <Area type="monotone" dataKey="count" name="Orders" stroke="#a3865a" strokeWidth={2} fill="url(#oc)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BestSellersChart({ data }: { data: { name: string; qty: number }[] }) {
  const points = data.map((d) => ({ ...d, short: d.name.length > 22 ? d.name.slice(0, 22) + "…" : d.name }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={points} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5ddd0" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#7a6f62" }} tickLine={false} axisLine={{ stroke: "#e5ddd0" }} />
        <YAxis type="category" dataKey="short" width={150} tick={{ fontSize: 11, fill: "#241c15" }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5ddd0", fontSize: 12 }} />
        <Bar dataKey="qty" name="Units sold" fill="#a3865a" radius={[0, 4, 4, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}
