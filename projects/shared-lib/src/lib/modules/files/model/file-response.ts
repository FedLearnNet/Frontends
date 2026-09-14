export interface UploadProgress<T = unknown> {
  progress: number;
  inProgress: boolean;
  loaded?: number;
  total?: number;
  result?: T;
  error?: unknown;
}
