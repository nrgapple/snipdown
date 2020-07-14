import moment from "moment"

export const dateFormatter = (date: Date) => {
  const momentDate = moment(date.toString())
  return momentDate.format("MM/DD/YY h:mm a")
}
