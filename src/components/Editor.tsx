import React, { Fragment, Component, useState, useEffect } from "react"
import CSS from "csstype"

import SimpleEditor from "react-simple-code-editor"
import Highlight, { defaultProps, Language } from "prism-react-renderer"
import theme from "prism-react-renderer/themes/nightOwl"

const exampleCode = `
(function someDemo() {
  var test = "Hello World!";
  console.log(test);
})();

return () => <App />;
`

const styles = {
  root: {
    boxSizing: "border-box",
    fontFamily: '"Dank Mono", "Fira Code", monospace',
    ...theme.plain,
  } as CSS.Properties,
}

interface Props {
  initialCode?: string
  language: Language
}

const Editor = ({ initialCode, language }: Props) => {
  const [code, setCode] = useState(exampleCode)

  const onValueChange = (code: string) => {
    setCode(code)
  }

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode)
    }
  }, [initialCode])

  const highlight = (code: string) => (
    <Highlight {...defaultProps} theme={theme} code={code} language={language}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <Fragment>
          {tokens.map((line, i) => (
            <div {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </Fragment>
      )}
    </Highlight>
  )

  return (
    <SimpleEditor
      value={code}
      onValueChange={onValueChange}
      highlight={highlight}
      padding={10}
      style={styles.root}
    />
  )
}

export default Editor
