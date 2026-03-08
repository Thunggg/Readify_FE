import ReviewsTable from "./reviews-table";

export default function ReviewsPage() {
  return (
    <div className="py-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reviews</h2>
        <p className="text-muted-foreground">
          View, manage, and reply to customer reviews
        </p>
      </div>
      <ReviewsTable />
    </div>
  );
}
