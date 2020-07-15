import "../styles/index.css"
import "../styles/theme.scss"
import { AppProps } from "next/app"

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
