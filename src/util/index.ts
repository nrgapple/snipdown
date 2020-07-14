import moment from "moment"

export const dateFormatter = (date: Date) => {
  const momentDate = moment(date.toString())
  return momentDate.format("MM/DD/YY h:mm a")
}

export const camelToWords = (input: string) => {
  const result = input.replace(/([A-Z])/g, " $1")
  return result.charAt(0).toUpperCase() + result.slice(1)
}

export const removeExtension = (file: string) => {
  return file.replace(/(.sd.md)/g, "")
}

export const isSnipFile = (file: string) => {
  return RegExp(/(.sd.md)/g).test(file)
}
