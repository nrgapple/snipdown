interface Props {
  src: string
}

const PreImg = ({ src }: Props) => {
  return <img alt="preview-img" src={src} />
}

export default PreImg
