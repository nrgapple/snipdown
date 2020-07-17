import SnipDown from "./[code]"
import { GetServerSideProps } from "next"

interface DataProps {
  code: string
}

const Home = ({ code }: DataProps) => {
  return <SnipDown code={code} />
}

export const getServerSideProps: GetServerSideProps<DataProps> = async (
  context
) => {
  if (context.query.code) {
    return {
      props: {
        code: context.query.code,
      } as DataProps,
    }
  }
  return {
    props: {} as DataProps,
  }
}

export default Home
