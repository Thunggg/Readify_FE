"use server"

import { AccountApiRequest } from "@/api-request/account";
import envConfig from "@/configs/config-env";
import { cookies } from "next/headers";

export default async function MeProfile() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const response = await AccountApiRequest.getMe(accessToken ?? "");

  console.log(response);

  return (
    <div>
      <h1>{response?.payload?.data?.email}</h1>
    </div>
  );
}