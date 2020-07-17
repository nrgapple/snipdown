import { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { url },
  } = req
  console.log(url)
  const imgRes = await fetch(url as string, {
    method: "GET",
  })
  const blob = await imgRes.blob()
  const buff = await blob.arrayBuffer()
  res
  res.send(
    `data:${imgRes.headers.get("content-type")};base64,${Buffer.from(
      buff
    ).toString("base64")}`
  )
  res.setHeader("content-type", imgRes.headers.get("content-type")!)
}
