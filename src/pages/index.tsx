import Head from "next/head"
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import { Navbar, NavbarBrand, Card, Button, ButtonGroup } from "react-bootstrap"
import Layout from "../components/Layout"
import Link from "next/link"
import Branding from "../util/banding"
import { useState, useEffect } from "react"
import { Octokit } from "@octokit/core"
import { env } from "process"
import { Uris } from "../util/links"
import { GetServerSideProps } from "next"

interface DataProps {
  code: string
}

interface GithubUser {
  login: string
  avatarUrl: string
}

type hasTokenType = "waiting" | "false" | "true"

const Home = ({ code }: DataProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [token, setToken] = useState("")
  const [hasToken, setHasToken] = useState<hasTokenType>("waiting")
  const [user, setUser] = useState<GithubUser>()

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

    const { data } = await octokit.request(`/gists`)
    console.log(data)
  }

  return (
    <Layout>
      <div>
        {isLoggedIn ? (
          user && (
            <div>
              <span>
                <img width="30px" src={user.avatarUrl} />
              </span>
              <span>{user.login}</span>
            </div>
          )
        ) : (
          <a
            href={`https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_KEY}&redirect_uri=${process.env.NEXT_PUBLIC_BASE_URI}&state=123456&response_type=code`}
          >
            {isLoggedIn ? "Hey!" : "Login"}
          </a>
        )}
        <div>
          <button onClick={getGists}>Get Gists</button>
        </div>
      </div>
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
