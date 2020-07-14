import "../styles/index.css"
import "bootstrap/dist/css/bootstrap.min.css"
import { AppProps } from "next/app"

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
