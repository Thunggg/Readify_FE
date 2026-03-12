import TicketsTable from "./tickets-table";

export default async function TicketsPage() {
  return (
    <div className="py-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tickets</h2>
        <p className="text-muted-foreground">
          Manage customer support tickets
        </p>
      </div>

      <TicketsTable />
    </div>
  );
}

