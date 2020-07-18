import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/router"
import Layout from "../components/Layout"
import { GetServerSideProps } from "next"
import { isSnipFile, camelToWords, removeExtension } from "../util"
import {
  Snip,
  GithubUser,
  GistData,
  FileData,
  fileExt,
  hasTokenType,
} from "../util/types"
import { Routes } from "../util/links"
import { Octokit } from "@octokit/core"
import { Language } from "prism-react-renderer"
import { Row, Col } from "react-bootstrap"
import { Container } from "next/app"
import CustomNav from "../components/CustomNav"
import SnipButtons from "../components/SnipButtons"
import MDCard from "../components/MDCard"
import Branding from "../util/banding"
import BottomToast from "../components/BottomToast"
import SnipTitle from "../components/SnipTitle"
import { handleDownload } from "../util/helpers"
import SnipFooter from "../components/SnipFooter"

interface DataProps {
  code?: string
  snip?: Snip
}

const SnipDown = ({ code, snip }: DataProps) => {
  const router = useRouter()
  const [isInitLoading, setIsInitLoading] = useState<boolean>(true)
  const [isLoadingGist, setIsLoadingGist] = useState<boolean>(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [token, setToken] = useState("")
  const [hasToken, setHasToken] = useState<hasTokenType>("waiting")
  const [user, setUser] = useState<GithubUser>()
  const [snips, setSnips] = useState<Snip[]>()
  const [content, setContent] = useState<Snip>({
    title: "",
    content: Branding.defaultMDText,
    id: "",
  } as Snip)
  const [isEdit, setIsEdit] = useState(true)
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState<string>()
  const mdRef = useRef<any>(null)

  useEffect(() => {
    if (code && hasToken === "false") {
      setIsLoggedIn(true)
      ;(async () => {
        try {
          const resp = await fetch(`/api/authenticate/${code}`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          })
          const data = await resp.json()
          if (data && data.token) {
            setIsLoggedIn(false)
            localStorage.setItem("auth_token", data.token)
            setToken(data.token)
            setIsLoggedIn(true)
            router.push("/")
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
      if (token && !isLoggedIn) {
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
      router.push(`/${id}`)
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

  const toggleEdit = () => {
    setIsEdit(!isEdit)
  }

  const allowEdit = (): boolean => {
    return !!(
      !snip ||
      !snip.id ||
      (snips && snips?.find((x) => x.id === snip.id))
    )
  }

  return (
    <Layout
      title={snip ? camelToWords(removeExtension(snip.title)) : undefined}
      url={
        snip
          ? `${process.env.NEXT_PUBLIC_BASE_URI}${Routes.SNIP}/${snip.id}`
          : undefined
      }
    >
      <div className="content">
        <CustomNav
          user={user}
          isLoggedIn={isLoggedIn}
          snips={snips}
          logout={logout}
        />
        {!isInitLoading && (
          <Container>
            <Row className="justify-content-center pb-3">
              <Col className="justify-content-sb" xs={11} md={9} lg={7}>
                <SnipButtons
                  isEdit={isEdit}
                  isLoggedIn={isLoggedIn}
                  isLoadingGist={isLoadingGist}
                  toggleEdit={toggleEdit}
                  createGist={createGist}
                  updateGist={updateGist}
                  content={content}
                  allowEdit={allowEdit}
                  handleDownload={(ex: fileExt) =>
                    handleDownload(ex, mdRef, content)
                  }
                />
              </Col>
            </Row>
            {isEdit && !content.id && (
              <Row className="justify-content-center pb-3">
                <Col xs={11} md={9} lg={7}>
                  <SnipTitle content={content} setContent={setContent} />
                </Col>
              </Row>
            )}
            <Row className="justify-content-center pb-5">
              <Col xs={11} md={9} lg={7}>
                {content && (
                  <MDCard
                    isEdit={isEdit}
                    content={content}
                    setContent={setContent}
                    mdRef={mdRef}
                  />
                )}
              </Col>
            </Row>
          </Container>
        )}
        <BottomToast show={show} message={message} setShow={setShow} />
        <SnipFooter />
      </div>
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
