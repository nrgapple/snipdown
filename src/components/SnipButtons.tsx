import { ButtonGroup, Button, Spinner, Dropdown } from "react-bootstrap"
import { Snip, fileExt } from "../util/types"
import { Fragment, memo } from "react"

interface Props {
  isEdit: boolean
  isLoggedIn: boolean
  isLoadingGist: boolean
  content: Snip
  toggleEdit: () => void
  createGist: () => void
  updateGist: () => void
  allowEdit: () => boolean
  handleDownload: (ex: fileExt) => void
}

const SnipButtons = ({
  isEdit,
  content,
  toggleEdit,
  allowEdit,
  isLoggedIn,
  createGist,
  updateGist,
  isLoadingGist,
  handleDownload,
}: Props) => {
  return (
    <Fragment>
      {allowEdit() && (
        <ButtonGroup className="pr-2">
          <Button
            className="float-left tool-button inset-shadow round"
            onClick={toggleEdit}
            disabled={!content.content}
          >
            {isEdit ? "Preview" : "Edit"}
          </Button>
        </ButtonGroup>
      )}
      {isEdit &&
        (content.id ? (
          <Button
            className="float-right tool-button inset-shadow round"
            onClick={() => updateGist()}
          >
            {!isLoadingGist ? "Save" : <Spinner animation="grow" />}
          </Button>
        ) : (
          <Button
            className="float-right tool-button inset-shadow round"
            onClick={() => createGist()}
            disabled={!content.content || !content.title || !isLoggedIn}
          >
            {isLoggedIn ? (
              !content.title ? (
                "Add a Title"
              ) : !content.content ? (
                "Add some Content"
              ) : !isLoadingGist ? (
                "Create"
              ) : (
                <Spinner animation="grow" />
              )
            ) : (
              "Login to Save"
            )}
          </Button>
        ))}

      {!isEdit && (
        <>
          <Dropdown as={ButtonGroup} className="bg-transparent">
            <Button
              className="tool-button inset-shadow round-left"
              onClick={() => handleDownload("png")}
              variant="success"
            >
              Export
            </Button>

            <Dropdown.Toggle
              split
              variant="success"
              id="dropdown-split-basic"
              className="tool-button inset-shadow round-right"
            />
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleDownload("png")}>
                PNG
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleDownload("jpeg")}>
                JPEG
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </>
      )}
    </Fragment>
  )
}

export default memo(SnipButtons)
