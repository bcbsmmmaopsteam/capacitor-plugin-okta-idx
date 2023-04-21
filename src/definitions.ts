export interface CapOktaIdxPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
  fetchTokens(data: any): Promise<any> ;
}
