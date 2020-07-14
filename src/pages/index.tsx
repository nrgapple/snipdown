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

const Home = ({ code }: DataProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [token, setToken] = useState("")

  useEffect(() => {
    console.log(code)
    if (code) {
      ;(async () => {
        const resp = await fetch(
          `https://github.com/login/oauth/access_token?client_secret=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET}&client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_KEY}&code=${code}`
        )
        console.log(resp)
        setIsLoggedIn(true)
      })()
      // localStorage.setItem("auth_token", resp.data.accessToken)
      // setToken(tokenQuery)
      // setIsLoggedIn(true)
    }
  }, [code])

  useEffect(() => {
    setToken(localStorage.getItem("auth_token") ?? "")
  }, [])

  const getGists = async () => {
    const octokit = new Octokit({
      auth: token,
    })

    const { data } = await octokit.request(`/user`)
    console.log(data)
  }

  console.log(token)

  return (
    <Layout>
      <div>
        <a
          href={`https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_KEY}&redirect_uri=${Uris.base}&state=123456&response_type=code`}
        >
          {isLoggedIn ? "Hey!" : "Login"}
        </a>
      </div>
      <div>
        <button onClick={() => getGists()}>Make request</button>
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
