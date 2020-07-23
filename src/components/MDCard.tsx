import { Card } from "react-bootstrap"
import Editor from "./Editor"
import CodeBlock from "./CodeBlock"
import PreImg from "./PreImg"
import ReactMarkdown from "react-markdown"
import { Snip } from "../util/types"
import { memo } from "react"

interface Props {
  isEdit: boolean
  content: Snip
  setContent: (content: Snip) => void
  mdRef: any
}

const MDCard = ({ isEdit, setContent, content, mdRef }: Props) => {
  return (
    <Card className="shadow round for-border for-color" ref={mdRef}>
      <Card.Body>
        {isEdit ? (
          <Editor
            style={{ minHeight: "60vh" }}
            language="markdown"
            value={content.content}
            onChange={(value) => setContent({ ...content, content: value })}
          />
        ) : (
          <ReactMarkdown
            source={content.content}
            renderers={{
              code: CodeBlock,
              image: PreImg,
            }}
          />
        )}
      </Card.Body>
    </Card>
  )
}

export default memo(MDCard)
