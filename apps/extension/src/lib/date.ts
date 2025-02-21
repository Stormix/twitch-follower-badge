export const formatDate = (date: Date | undefined) => {
  try {
    if (!date) return ""
    return new Date(date)?.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    })
  } catch (error) {
    console.error("Failed to format date", error)
    return date
  }
}
