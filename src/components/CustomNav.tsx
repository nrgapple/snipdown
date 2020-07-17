import { Navbar, Nav, NavDropdown, NavLink, Dropdown } from "react-bootstrap"
import Link from "next/link"
import { camelToWords, removeExtension } from "../util"
import { MarkGithubIcon } from "@primer/octicons-react"
import { Snip, GithubUser } from "../util/types"

interface Props {
  snips: Snip[] | undefined
  isLoggedIn: boolean
  user: GithubUser | undefined
  logout: () => void
}

const CustomNav = ({ snips, isLoggedIn, user, logout }: Props) => {
  return (
    <Navbar>
      <Navbar.Brand>
        <img
          style={{ marginRight: "4px" }}
          src="logo.png"
          height="25px"
          width="25px"
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
                  className="rounded-circle shadow"
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
            Login with
            <MarkGithubIcon className="github-logo pl-1" size="small" />
          </Nav.Link>
        )}
      </Nav>
    </Navbar>
  )
}

export default CustomNav
