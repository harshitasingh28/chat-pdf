import { NextResponse } from "next/server";

export async function POST() {
  return new NextResponse("Stripe disabled", { status: 200 });
}