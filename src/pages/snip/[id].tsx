import { useEffect } from "react"
import Layout from "../../components/Layout"
import { InferGetServerSidePropsType, GetServerSideProps } from "next"
import { dateFormatter } from "../../util"
import { Snip } from "../../util/types"
import { Uris, Routes } from "../../util/links"

interface DataProps {
  snip: Snip
}

const DevLog = ({
  snip,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <Layout
      title={`DevLog - ${snip.title} - ${dateFormatter(
        new Date(snip.createdAt)
      )}`}
      url={`${Uris.base}${Routes.SNIP}/${snip.id}`}
    />
  )
}

export const getServerSideProps: GetServerSideProps<DataProps> = async (
  context
) => {
  if (context.params && context.params.name && context.params.id) {
    const newSnip: Snip = {
      title: "Example",
      body: "## This is the body",
      createdAt: new Date(),
      id: 1,
    }

    // const resp = await fetch(
    //   `https://progressiveapp.store/api/public/log/${context.params.id}`
    // )
    // const devLog: DevLogType = await resp.json()
    //console.log(devLog)
    return {
      props: {
        snip: newSnip,
      } as DataProps,
    }
  } else {
    return {
      props: {} as DataProps,
    }
  }
}

export default DevLog
