import { cookies } from "next/headers";

import type { AdminAccount } from "@/types/account";

import AccountsTable from "./accounts-table";
import { AccountApiRequest } from "@/api-request/account";

export default async function AccountsPage() {

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value ?? "";

  const res = await AccountApiRequest.getAccountsList(accessToken, { page: 1, limit: 20 });

  let accounts: AdminAccount[] = [];

  if(res.payload.success){
    accounts = res.payload.data.items;
  } else {
    console.error(res.payload.message);
  }

  return (
    <div className="py-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Accounts</h2>
        <p className="text-muted-foreground">
          Create, update, and manage accounts
        </p>
      </div>

      <AccountsTable accounts={accounts}/>
    </div>
  );
}