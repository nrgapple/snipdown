import {
  Navbar,
  Nav,
  NavDropdown,
  Row,
  Col,
  ButtonGroup,
  Button,
  Card,
  Dropdown,
} from "react-bootstrap"
import Layout from "../components/Layout"
import Link from "next/link"
import Branding from "../util/banding"
import { useState, useEffect } from "react"
import { Octokit } from "@octokit/core"
import { GetServerSideProps } from "next"
import { Container } from "next/app"
import Highlight, { defaultProps, Language } from "prism-react-renderer"
import Editor from "../components/Editor"

interface DataProps {
  code: string
}

interface GithubUser {
  login: string
  avatarUrl: string
}

interface Snip {
  title: string
  content: string
  id: string
  language: Language
}

interface FileData {
  filename: string
  language: string
  content: string
}

interface FilesData {
  [file: string]: FileData
}

interface GistData {
  id: string
  description: string
  files: FilesData
}

type hasTokenType = "waiting" | "false" | "true"

const camelToWords = (input: string) => {
  const result = input.replace(/([A-Z])/g, " $1")
  return result.charAt(0).toUpperCase() + result.slice(1)
}

const removeExtension = (file: string) => {
  return file.replace(/(.sd.md)/g, "")
}

const isSnipFile = (file: string) => {
  return RegExp(/(.sd.md)/g).test(file)
}

const Home = ({ code }: DataProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [token, setToken] = useState("")
  const [hasToken, setHasToken] = useState<hasTokenType>("waiting")
  const [user, setUser] = useState<GithubUser>()
  const [isOpen, setIsOpen] = useState(false)
  const [snips, setSnips] = useState<Snip[]>()
  const [content, setContent] = useState<Snip>()

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

  return (
    <Layout>
      <Navbar bg="dark" variant="dark">
        <Navbar.Brand>SnipDown</Navbar.Brand>
        <Nav className="mr-auto">
          {snips && (
            <NavDropdown title="Your Snips" id="collasible-nav-dropdown">
              {snips.map((x) => (
                <Dropdown.Item onClick={() => getGist(x.id)}>
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
                  <Dropdown.Item>Logout</Dropdown.Item>
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
                  <Card.Text>
                    <Editor
                      language={content.language}
                      initialCode={content.content}
                    />
                  </Card.Text>
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
  if (context.query.code) {
    console.log(context.query.code)
    return {
      props: {
        code: context.query.code,
      } as DataProps,
    }
  } else {
    return {
      props: {} as DataProps,
    }
  }
}

export default Home
