import OrdersTable from "./orders-table";

export default function OrdersPage() {
    return (
        <div className="py-6 space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    Orders
                </h2>
                <p className="text-muted-foreground text-gray-500 dark:text-gray-400">
                    View list of orders and order status
                </p>
            </div>
            <OrdersTable />
        </div>
    );
}
