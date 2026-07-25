import type { AppProps } from "next/app";
import "../styles/globals.css";
import "@fontsource/unifont";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
