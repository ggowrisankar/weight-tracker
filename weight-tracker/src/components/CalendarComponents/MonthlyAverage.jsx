export default function MonthlyAverage({ monthlyAverage, currentDate, month, year, hasMonthEnded }) {
  if (monthlyAverage && hasMonthEnded(currentDate, month, year)) {
    //--MONTHLY AVERAGE FIELD--
    return <div className="monthly-average">Monthly Average: {monthlyAverage}</div>;
  }
  return null;
}