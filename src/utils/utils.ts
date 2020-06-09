export function getColorFromStatus(status: string): string {
  switch (status) {
    case "Running":
      return "#5B8FF9";
    case "Success":
      return "#30BF78";
    case "NotExecuted":
      return "#F6BD16";
    case "Error":
      return "#E8684A";
  }

  return "#5D7092";
}
