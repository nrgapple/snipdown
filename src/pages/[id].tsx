import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import Router from "next/router"
import Layout from "../components/Layout"
import { GetServerSideProps } from "next"
import { isSnipFile, camelToWords, removeExtension } from "../util"
import { Snip, GithubUser, GistData, FileData } from "../util/types"
import { Routes } from "../util/links"
import { Octokit } from "@octokit/core"
import { Language } from "prism-react-renderer"
import {
  Navbar,
  Nav,
  NavDropdown,
  Dropdown,
  Row,
  Col,
  Card,
  Button,
  InputGroup,
  FormControl,
  NavLink,
  ButtonGroup,
  Spinner,
  Toast,
} from "react-bootstrap"
import { Container } from "next/app"
import Editor from "../components/Editor"
import ReactMarkdown from "react-markdown"
import CodeBlock from "../components/CodeBlock"
import htmlToImage from "html-to-image"
//@ts-ignore
import download from "downloadjs"
import { MarkGithubIcon } from "@primer/octicons-react"

interface DataProps {
  code?: string
  snip?: Snip
}

type hasTokenType = "waiting" | "false" | "true"

const defaultText = `# Add a title

1. Give
2. Some
3. Steps

[link-it](https://google.com)

## Talk about something related

Something related.

### Oh, a code snippet?

\`\`\`js

console.log("Thats cool")

\`\`\`

|Table| It|
|-----|---|
|123  | 09|
|456  | 87|
`

const SnipDown = ({ code, snip }: DataProps) => {
  const [isInitLoading, setIsInitLoading] = useState<boolean>(true)
  const [isLoadingGist, setIsLoadingGist] = useState<boolean>(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [token, setToken] = useState("")
  const [hasToken, setHasToken] = useState<hasTokenType>("waiting")
  const [user, setUser] = useState<GithubUser>()
  const [snips, setSnips] = useState<Snip[]>()
  const [content, setContent] = useState<Snip>({
    title: "",
    content: defaultText,
    id: "",
  } as Snip)
  const [isEdit, setIsEdit] = useState(true)
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState<string>()
  const mdRef = useRef<any>(null)

  useEffect(() => {
    if (code && hasToken === "false") {
      ;(async () => {
        try {
          const resp = await fetch(
            `${process.env.NEXT_PUBLIC_CORS_POXY}/authenticate/${code}`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            }
          )
          const data = await resp.json()
          if (data && data.token) {
            var url = window.location.href
            url = url.split("?")[0]
            window.location.href = url
            localStorage.setItem("auth_token", data.token)
            setToken(data.token)
            setIsLoggedIn(true)
          }
        } catch (e) {
          console.error(e)
        }
      })()
    }
  }, [code, hasToken])

  useEffect(() => {
    try {
      const token = localStorage.getItem("auth_token") ?? ""
      if (token) {
        setToken(token)
        setIsLoggedIn(true)
        setHasToken("true")
      } else {
        setHasToken("false")
      }
    } finally {
      setIsInitLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) {
      getUser()
    }
  }, [token])

  useEffect(() => {
    if (user && !snips) {
      getGists()
    }
  }, [user])

  useEffect(() => {
    if (snip) {
      setIsEdit(false)
      setContent(snip)
    }
  }, [snip])

  const getUser = async () => {
    const octokit = new Octokit({
      auth: token,
    })

    const { data } = await octokit.request(`/user`)
    setUser({ ...data, avatarUrl: data.avatar_url })
  }

  const getGists = async () => {
    const octokit = new Octokit({
      auth: token,
    })

    const resp = await octokit.request(`/gists`)
    const data: GistData[] = resp.data
    const snipGistsData: GistData[] = data.filter((x) =>
      isSnipFile(x.files[Object.keys(x.files)[0]].filename)
    )
    setSnips((curr) =>
      snipGistsData.map((x) => {
        const file = x.files[Object.keys(x.files)[0]]
        return {
          title: file.filename,
          content: file.content,
          id: x.id,
          language: file.language as Language,
        }
      })
    )
  }

  const updateGist = async () => {
    if (!content || !user) return
    const octokit = new Octokit({
      auth: token,
    })

    const file: FileData = {
      filename: content.title,
      language: "markdown",
      content: content.content,
    }

    try {
      setIsLoadingGist(true)
      const resp = await octokit.request(`PATCH /gists/${content.id}`, {
        gist_id: content.id,
        files: { [content.title]: file },
        description: "update",
      })
      setMessage("Updated")
      setShow(true)
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoadingGist(false)
    }
  }

  const createGist = async () => {
    if (!content || !user) return
    const octokit = new Octokit({
      auth: token,
    })

    const file: FileData = {
      filename: `${content.title.replace(/ /g, "")}.sd.md`,
      language: "markdown",
      content: content.content,
    }

    try {
      setIsLoadingGist(true)
      const resp = await octokit.request(`POST /gists`, {
        files: { [content.title]: file },
      })
      const { id } = resp.data
      Router.push("/[id]", `/${id}`)
      setMessage("Created")
      setShow(true)
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoadingGist(false)
    }
  }

  const logout = () => {
    setToken("")
    setIsLoggedIn(false)
    setSnips(undefined)
    setUser(undefined)
    localStorage.removeItem("auth_token")
  }

  const handlePng = () => {
    if (mdRef && content.title) {
      htmlToImage.toPng(mdRef.current).then((link) => {
        download(link, `${content.title.split(".")[0]}.png`)
      })
    }
  }

  const handleJpeg = () => {
    if (mdRef && content.title) {
      htmlToImage.toJpeg(mdRef.current).then((link) => {
        download(link, `${content.title.split(".")[0]}.jpeg`)
      })
    }
  }

  const handleSvg = () => {
    if (mdRef && content.title) {
      htmlToImage.toSvgDataURL(mdRef.current).then((link) => {
        download(link, `${content.title.split(".")[0]}.svg`)
      })
    }
  }

  const allowEdit = () => {
    return (
      isLoggedIn &&
      (!snip || !snip.id || (snips && snips?.find((x) => x.id === snip.id)))
    )
  }

  return (
    <Layout
      title={snip ? snip.title : undefined}
      url={
        snip
          ? `${process.env.NEXT_PUBLIC_BASE_URI}${Routes.SNIP}/${snip.id}`
          : undefined
      }
    >
      <Navbar>
        <Navbar.Brand>
          <img
            style={{ margin: "12px" }}
            src="logo.png"
            height="30px"
            width="30px"
          />
          SnipDown
        </Navbar.Brand>
        <Nav className="mr-auto">
          {snips && (
            <NavDropdown title="Your Snips" id="collasible-nav-dropdown">
              {snips.map((x, i) => (
                <Link href="/[id]" as={`/${x.id}`} key={i} passHref>
                  <NavDropdown.Item key={i}>
                    {camelToWords(removeExtension(x.title))}
                  </NavDropdown.Item>
                </Link>
              ))}
            </NavDropdown>
          )}
          <Link href="/" passHref>
            <NavLink>New</NavLink>
          </Link>
        </Nav>
        <Nav>
          {isLoggedIn ? (
            user && (
              <Dropdown id="collasible-nav-dropdown" alignRight>
                <Dropdown.Toggle variant="clear">
                  <img
                    width="30px"
                    src={user.avatarUrl}
                    className="rounded-circle"
                  />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => logout()}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )
          ) : (
            <Nav.Link
              style={{
                display: "flex",
                alignItems: "center",
              }}
              href={`https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_KEY}&redirect_uri=${process.env.NEXT_PUBLIC_BASE_URI}&state=123456&response_type=code&scope=gist`}
            >
              Login with GitHub
              <MarkGithubIcon className="pl-1" size="small" />
            </Nav.Link>
          )}
        </Nav>
      </Navbar>
      <Container fluid>
        {!isInitLoading ? (
          <>
            <Row className="justify-content-center pb-2">
              <Col
                xs={11}
                md={9}
                lg={7}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                {allowEdit() && (
                  <ButtonGroup className="pr-2">
                    <Button
                      className="float-left bg-transparent text-primary line-bottom"
                      onClick={() => setIsEdit(!isEdit)}
                      disabled={!content.title || !content.content}
                    >
                      {isEdit ? "Preview" : "Edit"}
                    </Button>
                  </ButtonGroup>
                )}
                {isEdit &&
                  (content.id ? (
                    <Button
                      className="float-right bg-transparent text-secondary line-bottom"
                      onClick={() => updateGist()}
                    >
                      {!isLoadingGist ? "Save" : <Spinner animation="grow" />}
                    </Button>
                  ) : (
                    <Button
                      className="float-right bg-transparent text-secondary line-bottom"
                      onClick={() => createGist()}
                      disabled={
                        !content.content || !content.title || !isLoggedIn
                      }
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
                        "Login to Create"
                      )}
                    </Button>
                  ))}

                {!isEdit && (
                  <>
                    <Dropdown as={ButtonGroup} className="bg-transparent">
                      <Button
                        className="bg-transparent text-secondary line-bottom"
                        onClick={() => handlePng()}
                        variant="success"
                      >
                        Export
                      </Button>

                      <Dropdown.Toggle
                        split
                        variant="success"
                        id="dropdown-split-basic"
                        className="bg-transparent text-secondary line-bottom"
                      />
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handlePng()}>
                          PNG
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleJpeg()}>
                          JPEG
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleSvg()}>
                          SVG
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </>
                )}
              </Col>
            </Row>
            {isEdit && !content.id && (
              <Row className="justify-content-center pb-3">
                <Col xs={11} md={9} lg={7}>
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
                    />
                  </InputGroup>
                </Col>
              </Row>
            )}
            <Row className="justify-content-center">
              <Col xs={11} md={9} lg={7}>
                {content && (
                  <Card className="shadow" ref={mdRef}>
                    <Card.Body>
                      {isEdit ? (
                        <Editor
                          style={{ minHeight: "60vh" }}
                          language="markdown"
                          value={content.content}
                          onChange={(value) =>
                            setContent({ ...content, content: value })
                          }
                        />
                      ) : (
                        <ReactMarkdown
                          source={content.content}
                          renderers={{ code: CodeBlock }}
                        />
                      )}
                    </Card.Body>
                  </Card>
                )}
              </Col>
            </Row>
          </>
        ) : (
          <div />
        )}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Toast
            onClose={() => setShow(false)}
            show={show}
            delay={3000}
            autohide
          >
            <Toast.Body>{message}</Toast.Body>
          </Toast>
        </div>
      </Container>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps<DataProps> = async (
  context
) => {
  if (context.params && context.params.id) {
    try {
      const octokit = new Octokit()
      const resp = await octokit.request(`/gists/${context.params.id}`)
      const gist: GistData = resp.data
      const file = gist.files[Object.keys(gist.files)[0]]
      if (isSnipFile(file.filename)) {
        return {
          props: {
            snip: {
              id: gist.id,
              title: file.filename,
              content: file.content,
              language: file.language.toLowerCase() as Language,
            },
          } as DataProps,
        }
      }
    } catch (e) {
      console.log(e)
    }
  }
  return {
    props: {} as DataProps,
  }
}

export default SnipDown
