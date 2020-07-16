import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"

interface Props {
  src: string
}

const PreImg = ({ src }: Props) => {
  return (
    <img id="pre-img" alt="preview-img" src={src} />
  )
}

export default PreImg
