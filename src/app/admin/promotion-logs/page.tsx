import PromotionLogsTable from "./promotion-logs-table";

export default async function PromotionLogsPage() {
  return (
    <div className="py-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Promotion Logs
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          View promotion activities and history
        </p>
      </div>

      <PromotionLogsTable />
    </div>
  );
}
