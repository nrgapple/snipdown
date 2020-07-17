import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"

interface Props {
  language: string
  value: string
}

const CodeBlock = ({ language, value }: Props) => {
  return (
    <SyntaxHighlighter
      codeTagProps={{ className: "code-block" }}
      language={language}
    >
      {value}
    </SyntaxHighlighter>
  )
}

export default CodeBlock
