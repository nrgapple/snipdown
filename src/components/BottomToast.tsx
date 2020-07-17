import { Toast } from "react-bootstrap"

interface Props {
  show: boolean
  message: string | undefined
  setShow: (x: boolean) => void
}

const BottomToast = ({ show, message, setShow }: Props) => {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Toast onClose={() => setShow(false)} show={show} delay={3000} autohide>
        <Toast.Body>{message}</Toast.Body>
      </Toast>
    </div>
  )
}

export default BottomToast
