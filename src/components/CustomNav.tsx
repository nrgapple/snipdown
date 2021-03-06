import { Navbar, Nav, NavDropdown, NavLink, Dropdown } from "react-bootstrap"
import Link from "next/link"
import { camelToWords, removeExtension } from "../util"
import { MarkGithubIcon } from "@primer/octicons-react"
import { Snip, GithubUser } from "../util/types"
import styles from "./CustomNav.module.css"
import { memo } from "react"

interface Props {
  isLoading: boolean
  snips: Snip[] | undefined
  isLoggedIn: boolean
  user: GithubUser | undefined
  logout: () => void
}

const CustomNav = ({ isLoading, snips, isLoggedIn, user, logout }: Props) => {
  return (
    <Navbar style={{ height: "70px" }}>
      <Navbar.Brand
        style={{
          display: "flex",
          alignItems: "center",
          marginRight: "0",
          height: "100%",
        }}
      >
        <img src="logo.png" height="25px" width="25px" />
        <div className={styles.crackContainer}>
          {
            //@ts-ignore
            <span className={styles.crackOutside} datatext="SnipDown">
              <span className={styles.crackInside}>SnipDown</span>
            </span>
          }
        </div>
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
        {isLoggedIn && user ? (
          <Dropdown id="collasible-nav-dropdown" alignRight>
            <Dropdown.Toggle className="nav-toggle" variant="clear">
              <img
                height="30px"
                width="30px"
                src={user.avatarUrl}
                className="rounded-circle shadow"
              />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => logout()}>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          <Nav.Link
            style={{
              display: "flex",
              alignItems: "center",
            }}
            href={`https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_KEY}&redirect_uri=${process.env.NEXT_PUBLIC_BASE_URI}&state=123456&response_type=code&scope=gist`}
          >
            Login with
            <MarkGithubIcon className="github-logo pl-1" size="small" />
          </Nav.Link>
        )}
      </Nav>
    </Navbar>
  )
}

export default memo(CustomNav)
