import { Row, Col } from "react-bootstrap"

interface Props {}

const SnipFooter = () => {
  return (
    <Row className="justify-content-center">
      <Col xs={11} md={9} lg={7} style={{ height: "230px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-evenly",
            height: "50px",
          }}
        >
          <a
            className="color-link"
            href="https://github.com/nrgapple/snipdown/issues/new"
            target="_blank"
          >
            Issue
          </a>
          <a
            className="color-link"
            href="https://github.com/nrgapple/snipdown"
            target="_blank"
          >
            Source
          </a>
          <a
            className="color-link"
            href="https://codesandbox.io/s/github/nrgapple/snipdown"
            target="_blank"
          >
            Sandbox
          </a>
          <a className="color-link" href="" target="_blank">
            About
          </a>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "40px",
          }}
        >
          creators of{" "}
          <a
            className="color-link pl-1"
            href="https://twitter.com/PWAStore1"
            target="_blank"
          >
            @PWAStore
          </a>
        </div>
      </Col>
    </Row>
  )
}

export default SnipFooter
