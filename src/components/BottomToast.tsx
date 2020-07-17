import { Toast, ToastHeader } from "react-bootstrap"

interface Props {
  show: boolean
  message: string | undefined
  setShow: (x: boolean) => void
}

const BottomToast = ({ show, message, setShow }: Props) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        position: "absolute",
        bottom: 10,
        left: 0,
        right: 0,
      }}
    >
      <Toast
        style={{
          width: "250px",
          zIndex: 100000,
        }}
        onClose={() => setShow(false)}
        show={show}
        delay={3000}
        autohide
      >
        <Toast.Body>{message}</Toast.Body>
      </Toast>
    </div>
  )
}

export default BottomToast
