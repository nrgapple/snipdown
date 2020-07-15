import { useEffect, useState } from "react"
import Link from "next/link"
import Router from "next/router"
import Layout from "../components/Layout"
import { InferGetServerSidePropsType, GetServerSideProps } from "next"
import {
  dateFormatter,
  isSnipFile,
  camelToWords,
  removeExtension,
} from "../util"
import { Snip, GithubUser, GistData, FileData } from "../util/types"
import { Uris, Routes } from "../util/links"
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
  Tabs,
  Tab,
  Button,
  CardGroup,
  InputGroup,
  FormControl,
} from "react-bootstrap"
import { Container } from "next/app"
import Editor from "../components/Editor"
import ReactMarkdown from "react-markdown"
import CodeBlock from "../components/CodeBlock"
import dynamic from "next/dynamic"
import context from "react-bootstrap/esm/AccordionContext"

interface DataProps {
  code?: string
  snip?: Snip
}

type hasTokenType = "waiting" | "false" | "true"

const SnipDown = ({ code, snip }: DataProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [token, setToken] = useState("")
  const [hasToken, setHasToken] = useState<hasTokenType>("waiting")
  const [user, setUser] = useState<GithubUser>()
  const [snips, setSnips] = useState<Snip[]>()
  const [content, setContent] = useState<Snip>({
    title: "",
    content: "",
    id: "",
  } as Snip)
  const [canEdit, setCanEdit] = useState(false)
  const [isEdit, setIsEdit] = useState(false)

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
    const token = localStorage.getItem("auth_token") ?? ""
    if (token) {
      setToken(token)
      setIsLoggedIn(true)
      setHasToken("true")
    } else {
      setHasToken("false")
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
      const resp = await octokit.request(`PATCH /gists/${content.id}`, {
        gist_id: content.id,
        files: { [content.title]: file },
        description: "update",
      })
      if (resp.status === 200) {
        console.log("Howdy, It Worked!")
      }
    } catch (e) {
      console.log(e)
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
      const resp = await octokit.request(`POST /gists`, {
        files: { [content.title]: file },
      })
      if (resp.status === 200) {
        console.log("Howdy, It Worked!")
      }

      const { id } = resp.data
      Router.push("/[id]", `/${id}`)
    } catch (e) {
      console.log(e)
    }
  }

  const getGist = async (id: string) => {
    const octokit = new Octokit({
      auth: token,
    })

    const resp = await octokit.request(`/gists/${id}`)
    const gist: GistData = resp.data
    const file = gist.files[Object.keys(gist.files)[0]]
    setContent({
      id: id,
      title: file.filename,
      content: file.content,
    })
  }

  const logout = () => {
    setToken("")
    setIsLoggedIn(false)
    setSnips(undefined)
    setUser(undefined)
    localStorage.removeItem("auth_token")
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
      <Navbar bg="dark" variant="dark">
        <Navbar.Brand>SnipDown</Navbar.Brand>
        <Nav className="mr-auto">
          {snips && (
            <NavDropdown title="Your Snips" id="collasible-nav-dropdown">
              {snips.map((x, i) => (
                <Dropdown.Item key={i}>
                  <Link href="/[id]" as={`/${x.id}`}>
                    {camelToWords(removeExtension(x.title))}
                  </Link>
                </Dropdown.Item>
              ))}
            </NavDropdown>
          )}
        </Nav>
        <Nav>
          {isLoggedIn ? (
            user && (
              <Dropdown id="collasible-nav-dropdown">
                <Dropdown.Toggle variant="clear">
                  <img width="30px" src={user.avatarUrl} />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => logout()}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )
          ) : (
            <Nav.Link
              href={`https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_KEY}&redirect_uri=${process.env.NEXT_PUBLIC_BASE_URI}&state=123456&response_type=code&scope=gist`}
            >
              Login with Github
            </Nav.Link>
          )}
        </Nav>
      </Navbar>
      <Container fluid>
        <Row>
          <Col>
            {content && (
              <Card style={{ margin: "32px" }}>
                <Card.Header>
                  <>
                    {isEdit && !content.id ? (
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
                        <InputGroup.Append>
                          <InputGroup.Text id="basic-addon2">
                            .sd.md
                          </InputGroup.Text>
                        </InputGroup.Append>
                      </InputGroup>
                    ) : (
                      <Card.Title>
                        {camelToWords(removeExtension(content.title))}
                      </Card.Title>
                    )}
                    <Button onClick={() => setIsEdit(!isEdit)}>
                      {isEdit ? "Preview" : "Edit"}
                    </Button>
                    {isEdit &&
                      (content.id ? (
                        <Button onClick={() => updateGist()}>Save</Button>
                      ) : (
                        <Button onClick={() => createGist()}>Create</Button>
                      ))}
                  </>
                </Card.Header>
                <Card.Body>
                  {isEdit ? (
                    <Editor
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
