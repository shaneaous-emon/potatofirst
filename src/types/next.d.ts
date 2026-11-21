export {};

type RouteParams<T extends string> = T extends `${string}[${infer Param}]${infer Rest}`
  ? { [K in Param]: string } & RouteParams<Rest>
  : Record<string, string | string[] | undefined>;

declare global {
  type PageProps<T extends string = string> = {
    params: Promise<RouteParams<T>>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
  };
}
