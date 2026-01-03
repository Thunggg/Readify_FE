"use server"

import { AccountApiRequest } from "@/api-request/account";
import { cookies } from "next/headers";

export default async function MeProfile() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const response = await AccountApiRequest.getMe(accessToken ?? "");

  return (
    <div>
      <h1>
        {response.payload.success
          ? response.payload.data.email
          : response.payload.data.message}
      </h1>
    </div>
  );
}