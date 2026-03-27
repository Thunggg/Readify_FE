import http from "@/lib/http";
import { ApiResponse } from "@/types/api";
import { Media, MediaFolder, MediaType } from "@/types/media";

export const MediaApiRequest = {
  /**
   * Upload media file (image/video/file)
   * @param file - File object từ input
   * @param dto - UploadMediaDto với type và folder
   */
  upload: async (file: File, dto: { type: MediaType; folder: MediaFolder }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", dto.type);
    formData.append("folder", dto.folder);

    const response = await http.post<ApiResponse<Media>>(
      "/media/upload",
      formData,
      {
        credentials: "include",
      }
    );
    return response;
  },

  /**
   * Upload riêng ảnh sách (BE route tách biệt khỏi avatar)
   */
  uploadBookImage: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return http.post<ApiResponse<Media>>("/media/upload/book", formData, {
      credentials: "include",
    });
  },

  /**
   * Upload avatar (wrapper function cho tiện)
   */
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return http.post<ApiResponse<Media>>("/media/upload/avatar", formData, {
      credentials: "include",
    });
  },
};
