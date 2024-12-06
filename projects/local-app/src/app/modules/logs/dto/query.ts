export interface QueryInfoDto {
  id: string;
  queryId: string;
  queryString: string;
  status: string;
  statusMessage: string;
  timestamp: string | null;
}
