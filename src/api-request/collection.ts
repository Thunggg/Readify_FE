import http from "@/lib/http";
import type { ApiResponse } from "@/types/api";
import type {
  AddBooksToCollectionBody,
  AdminCollection,
  CreateCollectionBody,
  UpdateCollectionBody,
} from "@/types/collection";

const BASE_ADMIN = "/admin/collections";

const safe = (v?: string | null) => (typeof v === "string" ? v.trim() : "");

export const CollectionApiRequest = {
  adminGetCollections() {
    return http.get<ApiResponse<AdminCollection[]>>(BASE_ADMIN, {
      credentials: "include",
      cache: "no-store",
    });
  },

  adminGetById(collectionId: string) {
    return http.get<ApiResponse<AdminCollection>>(`${BASE_ADMIN}/${safe(collectionId)}`, {
      credentials: "include",
      cache: "no-store",
    });
  },

  adminCreate(body: CreateCollectionBody) {
    return http.post<ApiResponse<AdminCollection>>(BASE_ADMIN, body, {
      credentials: "include",
    });
  },

  adminUpdate(collectionId: string, body: UpdateCollectionBody) {
    return http.patch<ApiResponse<AdminCollection>>(`${BASE_ADMIN}/${safe(collectionId)}`, body, {
      credentials: "include",
    });
  },

  adminDelete(collectionId: string) {
    return http.delete<ApiResponse<{ _id: string }>>(`${BASE_ADMIN}/${safe(collectionId)}`, null, {
      credentials: "include",
    });
  },

  adminAddBooks(collectionId: string, body: AddBooksToCollectionBody) {
    return http.patch<ApiResponse<AdminCollection & { addedCount: number }>>(
      `${BASE_ADMIN}/${safe(collectionId)}/books`,
      body,
      {
        credentials: "include",
      }
    );
  },
};
