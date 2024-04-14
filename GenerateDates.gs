const months = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

/**
 * Main function to generate dates
 * By Sam, Yichen
 * 
 */
function generateDates() {
  let spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  let scheduleSheet = spreadSheet.getSheetByName("Schedule");

  // Gets which month the schedule is for
  let scheduleMonth = parseCalendar();
  if (scheduleMonth == undefined) {
    scheduleSheet.getRange("A1").setBackground("orange");
    scheduleSheet.getRange("B1").setBackground("orange");
    Logger.log("Invalid month and/or year!");
    SpreadsheetApp.getUi().alert("Invalid month and/or year!");
    return;
  } else {
    scheduleSheet.getRange("A1").setBackground("white");
    scheduleSheet.getRange("B1").setBackground("white");
  }
  Logger.log(
    "Schedule is for " +
      months[scheduleMonth.getUTCMonth()].charAt(0).toUpperCase() +
      months[scheduleMonth.getUTCMonth()].slice(1) +
      " " +
      scheduleMonth.getUTCFullYear()
  );

  // Fetch all the holidays + dates not requiring supervision
  let holidays = getHolidays();
  Logger.log(
    "Found " +
      Object.values(holidays).reduce((acc, val) => acc + val.length, 0) +
      " holidays"
  );

  // Gets all the weekdays in the month
  let monthDays = getMonthDays(scheduleMonth);
  Logger.log(
    "There are " +
      monthDays.reduce((acc, val) => acc + val.length, 0) +
      " weekdays in " +
      months[scheduleMonth.getUTCMonth()].charAt(0).toUpperCase() +
      months[scheduleMonth.getUTCMonth()].slice(1)
  );

  // Convert dates to strings with holidays
  let values = [
    [[], [], [], [], []],
    [[], [], [], [], []],
  ]; // [day1Or2][dayOfWeek][dateIndex] - [dateStr, isBold]
  monthDays.forEach((days, dayOfWeek) => {
    days.forEach((date) => {
      let holiday = getHoliday(holidays, date);
      if (holiday == "year") {
        // Ignore dates outside the school year
        return; // Continue
      }
      values[isDay1(date) ? 0 : 1][dayOfWeek].push([
        (holiday ? holiday + " " : "") + date.getUTCDate().toString(),
        holiday == undefined,
      ]);
    });
  });

  let bolded = SpreadsheetApp.newTextStyle().setBold(true).build();
  let unbolded = SpreadsheetApp.newTextStyle().setBold(false).build();

  const delimiter = ", ";

  // Combine dateStrs
  let valuesStr = [
    ["", "", "", "", ""],
    ["", "", "", "", ""],
  ]; // [day1Or2][dayOfWeek] - dateStr
  values.forEach((row, dayNumber) => {
    row.forEach((days, dayOfWeek) => {
      days.forEach(([dateStr, isBold]) => {
        valuesStr[dayNumber][dayOfWeek] += dateStr + delimiter;
      });
      if (valuesStr[dayNumber][dayOfWeek].length > 0) {
        valuesStr[dayNumber][dayOfWeek] = valuesStr[dayNumber][
          dayOfWeek
        ].substring(
          0,
          valuesStr[dayNumber][dayOfWeek].length - delimiter.length
        );
      }
    });
  });

  // Convert dateStrs to rich text values with boldness
  let valuesRich = [
    [[], [], [], [], []],
    [[], [], [], [], []],
  ]; // [day1Or2][dayOfWeek][dateIndex] - dateVal
  valuesStr.forEach((row, dayNumber) => {
    row.forEach((datesStr, dayOfWeek) => {
      let richValue = SpreadsheetApp.newRichTextValue().setText(datesStr);
      let index = 0;
      values[dayNumber][dayOfWeek].forEach(([dateStr, isBolded]) => {
        richValue.setTextStyle(
          index,
          index + dateStr.length,
          isBolded ? bolded : unbolded
        );
        index += dateStr.length + delimiter.length; // comma counts as one character
      });
      valuesRich[dayNumber][dayOfWeek] = richValue.build();
    });
  });

  // Set values to sheet
  scheduleSheet.getRange("D1:H1").setRichTextValues([valuesRich[0]]);
  scheduleSheet.getRange("D2:H2").setRichTextValues([valuesRich[1]]);
}

/**
 * Gets the current month and year from calendar
 *
 * @return {Date|undefined} The first day of the resulting month, if valid
 */
function parseCalendar() {
  let spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  let scheduleSheet = spreadSheet.getSheetByName("Schedule");

  let year = scheduleSheet.getRange("B1").getValue();
  let month = scheduleSheet.getRange("A1").getValue().toLowerCase();
  month = months.indexOf(month);

  if (year < 1000 || year > 9999 || isNaN(Number(year))) {
    return undefined;
  } else if (month == -1) {
    return undefined;
  }

  return normalizeDate(new Date(year, month, 1));
}

/**
 * The holidays in a school year
 * @typedef {Object} Holidays
 * @property {Date[]} TG - Thanksgiving
 * @property {Date[]} WB - Winter Break
 * @property {Date[]} FD - Family Day
 * @property {Date[]} MB - March Break
 * @property {Date[]} GF - Good Friday
 * @property {Date[]} EM - Easter Monday
 * @property {Date[]} VD - Victoria Day
 * @property {Date[]} ED1 - Semester 1 Exams
 * @property {Date[]} ED2 - Semester 2 Exams
 * @property {Date[]} PA - PA or PD Days
 * @property {Date[]} OT - Other Closures
 * @property {Date[]} year - School year
 */

/**
 * Gets all the days where there is no supervision duty
 *
 * @returns {Holidays} The {@link Holidays} in the year
 */
function getHolidays() {
  let spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  let holidaySheet = spreadSheet.getSheetByName("Days Off");

  // Get and normalize all the holidays
  let schoolYear = holidaySheet
    .getRange("B2:C2")
    .getValues()[0]
    .map((dateStr) => normalizeDate(new Date(dateStr)));
  let thanksgiving = holidaySheet
    .getRange("B3:B3")
    .getValues()[0]
    .map((dateStr) => normalizeDate(new Date(dateStr)));
  let winterBreak = holidaySheet
    .getRange("B4:C4")
    .getValues()[0]
    .map((dateStr) => normalizeDate(new Date(dateStr)));
  let familyDay = holidaySheet
    .getRange("B5:B5")
    .getValues()[0]
    .map((dateStr) => normalizeDate(new Date(dateStr)));
  let marchBreak = holidaySheet
    .getRange("B6:C6")
    .getValues()[0]
    .map((dateStr) => normalizeDate(new Date(dateStr)));
  let goodFriday = holidaySheet
    .getRange("B7:B7")
    .getValues()[0]
    .map((dateStr) => normalizeDate(new Date(dateStr)));
  let easterMonday = holidaySheet
    .getRange("B8:B8")
    .getValues()[0]
    .map((dateStr) => normalizeDate(new Date(dateStr)));
  let victoriaDay = holidaySheet
    .getRange("B9:B9")
    .getValues()[0]
    .map((dateStr) => normalizeDate(new Date(dateStr)));
  let examDays1 = holidaySheet
    .getRange("B10:C10")
    .getValues()[0]
    .map((dateStr) => normalizeDate(new Date(dateStr)));
  let examDays2 = holidaySheet
    .getRange("B11:C11")
    .getValues()[0]
    .map((dateStr) => normalizeDate(new Date(dateStr)));
  let pa = holidaySheet
    .getRange("B13:Z13")
    .getValues()[0]
    .map((dateStr) => normalizeDate(new Date(dateStr)));
  let others = holidaySheet
    .getRange("B14:Z14")
    .getValues()[0]
    .map((dateStr) => normalizeDate(new Date(dateStr)));

  // Removes the empty fields
  // The "default" Date is in 1969
  pa = pa.filter((date) => date.getFullYear() > 1969); 
  others = others.filter((date) => date.getFullYear() > 1969);

  return {
    TG: thanksgiving,
    WB: winterBreak,
    FD: familyDay,
    MB: marchBreak,
    GF: goodFriday,
    EM: easterMonday,
    VD: victoriaDay,
    ED1: examDays1,
    ED2: examDays2,
    PA: pa,
    OT: others,
    year: schoolYear,
  };
}

/**
 * Gets the days in the month formatted into days of the week
 *
 * @param {Date} scheduleMonth - A normalized date of the month and year
 * @returns {Date[][]} An array of the days of the week containing an array of normalized dates
 */
function getMonthDays(scheduleMonth) {
  let date = new Date(
    `${scheduleMonth.getUTCFullYear()}-${String(
      scheduleMonth.getUTCMonth() + 1
    ).padStart(2, "0")}-01T00:00:00Z`
  ); // In UTC
  date.setUTCDate(0); // A date of 0 is the same the last day of the previous month
  let daysInMonth = date.getUTCDate();

  let monthDays = [[], [], [], [], []];
  for (let monthDate = 1; monthDate <= daysInMonth; monthDate++) {
    let date = new Date(
      `${scheduleMonth.getUTCFullYear()}-${String(
        scheduleMonth.getUTCMonth() + 1
      ).padStart(2, "0")}-${String(monthDate).padStart(2, "0")}T00:00:00Z`
    ); // In UTC
    if (date.getUTCDay() == 0 || date.getUTCDay() == 6) {
      // Sunday or Saturday
      continue;
    }
    monthDays[date.getUTCDay() - 1].push(date);
  }
  return monthDays;
}

/**
 * Removes timezones and time from a date
 * Sets the date to 12 am UTC
 *
 * @param {Date} date - The date to normalize
 * @returns {Date} The normalized date, undefined if invalid
 */
function normalizeDate(date) {
  return new Date(
    `${date.getFullYear()}-${String(date.getMonth() + 1)
      .padStart(2, "0")}-${String(date.getDate())
      .padStart(2, "0")}T00:00:00Z`
  );
}

/**
 * Takes a normalized date and converts it to a string
 * Does not include time or timezone
 *
 * @param {Date} date - The normalized date to convert
 * @returns {string} The resulting string
 */
function normalizeDateString(date) {
  return date
    .toLocaleString("en-CA", { timeZone: "Africa/Abidjan" })
    .split(",")[0]; // A GMT+0000 timezone
}

/**
 * Takes two normalized dates and compares their day,
 * month and year to see if they are the same date
 * Does not include time or timezone
 *
 * @param {Date} dateA - The first date
 * @param {Date} dateB - The second date
 * @returns {boolean} If the dates are equal
 */
function sameDate(dateA, dateB) {
  return (
    dateA.getUTCFullYear() == dateB.getUTCFullYear() &&
    dateA.getUTCMonth() == dateB.getUTCMonth() &&
    dateA.getUTCDate() == dateB.getUTCDate()
  );
}

/**
 * Gets the holiday, if exists, on a normalized date
 *
 * @param {Holidays} holidays - The {@link Holidays}
 * @param {Date} date - The date to check
 * @return {string|undefined} The holiday, if it exists
 */
function getHoliday(holidays, date) {
  for (let [holidayName, holidayDates] of Object.entries(holidays)) {
    if (holidayName == "year") {
      if (
        date.getTime() < holidayDates[0].getTime() ||
        date.getTime() > holidayDates[1].getTime()
      ) {
        return holidayName;
      }
      continue;
    }

    if (
      holidayName == "PA" ||
      holidayName == "OT" ||
      holidayDates.length == 1
    ) {
      // These contain list of dates
      for (let holidayDate of holidayDates) {
        if (sameDate(holidayDate, date)) {
          return holidayName;
        }
      }
    }

    if (holidayDates.length == 2) {
      // These are a range of dates
      if (
        date.getTime() <= holidayDates[1].getTime() &&
        date.getTime() >= holidayDates[0].getTime()
      ) {
        if (holidayName == "ED1" || holidayName == "ED2") {
          return "ED";
        }
        return holidayName;
      }
    }
  }
}

/**
 * Gets if the normalized date is a Day 1
 *
 * @param {Date} date - The normalized date
 * @return {boolean} - If the date is a day 1
 */
function isDay1(date) {
  return date.getUTCDate() % 2 == 1;
}
