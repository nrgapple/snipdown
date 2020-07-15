import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { useRef, useEffect } from "react"

interface Props {
  language: string
  value: string
}

const CodeBlock = ({ language, value }: Props) => {
  return <SyntaxHighlighter language={language}>{value}</SyntaxHighlighter>
}

export default CodeBlock
