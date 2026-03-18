import CollectionForm from "../../collection-form";

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CollectionForm mode="edit" collectionId={id} />;
}
