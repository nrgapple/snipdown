import React, {
  Fragment,
  Component,
  useState,
  useEffect,
  ReactChild,
  memo,
} from "react"
import CSS from "csstype"

import SimpleEditor from "react-simple-code-editor"
import Highlight, { defaultProps, Language } from "prism-react-renderer"
import theme from "prism-react-renderer/themes/duotoneLight"

const styles = {
  root: {
    boxSizing: "border-box",
    fontFamily: '"Dank Mono", monospace',
    ...theme,
  } as CSS.Properties,
}

interface Props {
  language: Language
  onChange: (code: string) => void
  value: string
  placeholder?: string
  textareaClassName?: string
  style: React.CSSProperties
}

const Editor = ({
  language,
  onChange,
  value,
  placeholder,
  textareaClassName,
  style,
}: Props) => {
  const onValueChange = (code: string) => {
    onChange(code)
  }

  const highlight = (code: string) => (
    <Highlight {...defaultProps} theme={theme} code={code} language={language}>
      {({ className, tokens, getLineProps, getTokenProps }) => (
        <Fragment>
          {tokens.map((line, i) => (
            <div {...getLineProps({ line, key: i })}>
              {line.map((token, key) => {
                if (line.every((x) => x.content === "")) {
                  token.empty = true
                }
                return <span {...getTokenProps({ token, key, className })} />
              })}
            </div>
          ))}
        </Fragment>
      )}
    </Highlight>
  )

  return (
    <SimpleEditor
      value={value}
      onValueChange={onValueChange}
      highlight={highlight}
      padding={10}
      insertSpaces
      style={style}
      placeholder={placeholder}
      textareaClassName={textareaClassName}
      preClassName="preclass"
    />
  )
}

export default memo(Editor)
