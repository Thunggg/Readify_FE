export type ApiBaseResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  statusCode: number;
};

export type ApiSuccessResponse<T> = ApiBaseResponse<T> & {
  success: true;
};

export type ApiErrorDetail = {
  field?: string;
  message: string;
  code?: string;
};

export type ApiErrorData = {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
};

export type ApiErrorResponse = ApiBaseResponse<ApiErrorData> & {
  success: false;
};

// Convenient union for API responses
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
