"use server";

import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = await cookies();

  const res = await request.json();
  const accessToken = res.payload.data.accessToken;

  if (!accessToken) {
    return Response.json(
      { message: "Login failed", error: "Access token not found", status: 401 },
      { status: 401 }
    );
  }

  cookieStore.set({
    name: "accessToken",
    value: accessToken,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    // 7 days
    maxAge: 60 * 60 * 24 * 7,
  });

  return Response.json(
    { message: "Login successful", accessToken },
    { status: 200 }
  );
}
