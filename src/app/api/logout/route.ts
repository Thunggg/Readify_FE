"use server";

import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  // Delete the accessToken cookie
  cookieStore.delete("accessToken");

  return Response.json(
    { message: "Logout successful" },
    { status: 200 }
  );
}
