export interface CapOktaIdxPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
