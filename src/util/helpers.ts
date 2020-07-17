const html2canvas = process.browser ? require("html2canvas") : null
//@ts-ignore
import download from "downloadjs"
import { fileExt, Snip } from "./types"

export const handleDownload = (ex: fileExt, mdRef: any, content: Snip) => {
  if (mdRef) {
    html2canvas(mdRef.current, {
      proxy: `/api/image`,
    }).then((canvas: any) => {
      const link = canvas.toDataURL(`image/${ex}`)
      download(
        link,
        `${
          content.title
            ? content.title.split(".")[0]
            : `snipdow-${new Date().toTimeString()}`
        }.${ex}`
      )
    })
  }
}
