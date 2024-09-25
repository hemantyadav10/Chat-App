export const formatMessageTimestamp = (timestampInMs) => {
  const messageDate = new Date(timestampInMs);
  const currentDate = new Date();

  const messageDay = messageDate.getDate();
  const messageMonth = messageDate.getMonth();
  const messageYear = messageDate.getFullYear();

  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Check if the message was sent today
  if (messageDay === currentDay && messageMonth === currentMonth && messageYear === currentYear) {
    // If it's the same day, display the time in HH:MM AM/PM format
    let hours = messageDate.getHours();
    const minutes = messageDate.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // Adjust for 0 to be 12

    return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  } else {
    // If it's a different day, display the date in DD/MM/YYYY format
    const day = messageDate.getDate().toString().padStart(2, '0');
    const month = (messageDate.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based
    const year = messageDate.getFullYear();

    return `${day}/${month}/${year}`;
  }
};