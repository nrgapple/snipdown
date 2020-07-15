import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import theme from "prism-react-renderer/themes/nightOwl"
import CSS from "csstype"

interface Props {
  language: string
  value: string
}

const CodeBlock = ({ language, value }: Props) => {
  return <SyntaxHighlighter language={language}>{value}</SyntaxHighlighter>
}

export default CodeBlock
