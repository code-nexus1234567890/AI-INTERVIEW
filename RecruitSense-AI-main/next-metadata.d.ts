declare module 'next/dist/lib/metadata/types/metadata-interface.js' {
  export type ResolvingMetadata = any;
  export type ResolvingViewport = any;
}

declare module 'next' {
  const next: any;
  export default next;
  export type NextConfig = any;
  export type Metadata = any;
  export type Viewport = any;
}

declare module 'next/navigation' {
  export const useRouter: any;
  export const usePathname: any;
  export const useSearchParams: any;
  export const useParams: any;
  export const redirect: any;
  export const notFound: any;
}

declare module 'next/link' {
  const Link: any;
  export default Link;
}

declare module 'next/image' {
  const Image: any;
  export default Image;
}

declare module 'next/font/google' {
  export const Raleway: any;
  export const Geist: any;
  export const Geist_Mono: any;
  export const Inter: any;
  export const Outfit: any;
  export const Roboto: any;
  export const Open_Sans: any;
  export const Montserrat: any;
}

declare module 'next/server' {
  export const NextResponse: any;
  export type NextRequest = any;
  export type NextResponse = any;
}

declare module 'next/server.js' {
  export const NextResponse: any;
  export type NextRequest = any;
  export type NextResponse = any;
}

declare module 'next/types.js' {
  export type Metadata = any;
  export type ResolvingMetadata = any;
  export type ResolvingViewport = any;
  export type Route = any;
  export type RouteImpl<T> = any;
}
