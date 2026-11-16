import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/current-admin";
import { getOrdersCSV } from "@/lib/dal/orders";

export async function GET(_req: NextRequest) {
  await requireAdmin("orders.read");
  const csv = await getOrdersCSV();
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
