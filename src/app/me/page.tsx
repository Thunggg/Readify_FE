"use server"

import envConfig from "@/configs/config-env";
import { cookies } from "next/headers";

export default async function MeProfile() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const response = await fetch(
    `${envConfig?.NEXT_PUBLIC_API_ENDPOINT ?? ""}/accounts/me`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Cookie: `accessToken=${accessToken}` } : {}),
      },
    }
  ).then(async (res) => {
    const payload = await res.json();

    const data = {
      status: res.status,
      payload,
    };

    if (!res.ok) {
      throw data;
    }
    return data;
  });

  return (
    <div>
      <h1>{response.payload.data.email}</h1>
    </div>
  );
}