import { InputGroup, FormControl } from "react-bootstrap"
import { Snip } from "../util/types"

interface Props {
  content: Snip
  setContent: (cx: Snip) => void
}

const SnipTitle = ({ content, setContent }: Props) => {
  return (
    <InputGroup>
      <FormControl
        placeholder="Title"
        aria-label="Title"
        aria-describedby="basic-addon2"
        onChange={(e) =>
          setContent({
            ...content,
            title: e.currentTarget.value,
          })
        }
        value={content.title}
        className="round title-input inset-shadow input-shadow"
      />
    </InputGroup>
  )
}

export default SnipTitle
