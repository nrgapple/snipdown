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

  // const imgRes = await fetch(url as string, {
  //   method: "GET",
  // })
  // const blob = await imgRes.blob()
  // const text = await blob.text()
  // res.setHeader("Content-Type", imgRes.headers.get("content-type")!)
  // res.setHeader("Content-Length", blob.size)
  // res.send(
  //   `data:${imgRes.headers.get("content-type")};base64,${Buffer.from(
  //     text,
  //     "binary"
  //   ).toString("binary")}`
  // )
}
