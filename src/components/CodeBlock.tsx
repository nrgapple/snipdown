import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow as style } from "react-syntax-highlighter/dist/esm/styles/prism"

interface Props {
  language: string
  value: string
}

const CodeBlock = ({ language, value }: Props) => {
  return (
    <SyntaxHighlighter
      codeTagProps={{ className: "code-block" }}
      language={language}
      style={style}
    >
      {value}
    </SyntaxHighlighter>
  )
}

export default CodeBlock
