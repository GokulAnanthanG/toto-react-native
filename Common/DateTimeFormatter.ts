export function formatDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date); // Example: 1 Aug 2021
  } catch (err) {
    console.log(err);
    return null;
  }
}

export function formatTime(timeString: string) {
  try {
 
    const date = new Date(timeString);

    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true, // Ensures AM/PM format
    }).format(date);
  } catch (err) {
    console.log(err);
    return null;
  }
}
