import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return Response.json(
      { success: false, message: "No access token found" },
      { status: 401 }
    );
  }

  return Response.json(
    { success: true, token: accessToken },
    { status: 200 }
  );
}
