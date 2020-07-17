import { NextApiRequest, NextApiResponse } from "next"
import https from "https"
import qs from "querystring"

function authenticate(
  code: string | string[],
  cb: (err: string | null, token?: string | string[]) => void
) {
  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_KEY
  const clientSecret = process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET

  const data = qs.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    code: code,
  })

  const options = {
    host: "github.com",
    port: "443",
    path: "/login/oauth/access_token",
    method: "POST",
    headers: { "content-length": data.length },
  }

  var body = ""
  var req = https.request(options, function (res) {
    res.setEncoding("utf8")
    res.on("data", function (chunk) {
      body += chunk
    })
    res.on("end", function () {
      cb(null, qs.parse(body).access_token)
    })
  })

  req.write(data)
  req.end()
  req.on("error", function (e) {
    cb(e.message)
  })
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { code },
  } = req

  authenticate(code, (err, token) => {
    var result
    if (err || !token) {
      result = { error: err || "bad_code" }
    } else {
      result = { token: token }
    }
    res.json(result)
  })
}
