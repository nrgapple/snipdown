import { useEffect, useState } from "react"
import Layout from "../components/Layout"
import { InferGetServerSidePropsType, GetServerSideProps } from "next"
import {
  dateFormatter,
  isSnipFile,
  camelToWords,
  removeExtension,
} from "../util"
import { Snip, GithubUser, GistData } from "../util/types"
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
} from "react-bootstrap"
import { Container } from "next/app"
import Editor from "../components/Editor"
import ReactMarkdown from "react-markdown"
import CodeBlock from "../components/CodeBlock"

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
  const [content, setContent] = useState<Snip>()
  const [canEdit, setCanEdit] = useState(false)

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
    if (user) {
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
      language: file.language.toLowerCase() as Language,
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
                <Dropdown.Item onClick={() => getGist(x.id)} key={i}>
                  {camelToWords(removeExtension(x.title))}
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
              href={`https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_KEY}&redirect_uri=${process.env.NEXT_PUBLIC_BASE_URI}&state=123456&response_type=code`}
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
              <Card>
                <Card.Body>
                  <Card.Title>
                    {camelToWords(removeExtension(content.title))}
                  </Card.Title>
                  <Tabs defaultActiveKey="editor">
                    <Tab eventKey="editor" title="Editor">
                      <Editor
                        language={content.language}
                        initialCode={content.content}
                      />
                    </Tab>
                    <Tab eventKey="preview" title="Preview">
                      <ReactMarkdown
                        source={content.content}
                        renderers={{ code: CodeBlock }}
                      />
                    </Tab>
                  </Tabs>
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
