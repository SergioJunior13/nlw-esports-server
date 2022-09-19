export function convertMinutesToHourString(minutesInput: number) {
  const hours = Math.floor(minutesInput / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (minutesInput % 60).toString().padStart(2, "0");

  return [hours, minutes].join(":");
}
