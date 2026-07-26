export interface TErrorSources {
    message: string;
}

export interface TErrorResponse {
    statusCode?: number;
    success: boolean;
    message: string;
    errorSources: TErrorSources[];
    stack?: string;
    error?: unknown;
}