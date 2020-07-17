import next, { NextApiRequest, NextApiResponse } from "next"
import request from "request"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { url, responseType },
  } = req

  switch (responseType) {
    case "blob":
      req.pipe(request(url as string)).pipe(res)
      break
    case "text":
    default:
      request(
        { url: url as string, encoding: "binary" },
        (error, response, body) => {
          if (error) {
            return next(error)
          }
          res.send(
            `data:${response.headers["content-type"]};base64,${Buffer.from(
              body,
              "binary"
            ).toString("base64")}`
          )
        }
      )
  }
}
