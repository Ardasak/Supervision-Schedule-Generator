// Adapted from https://stackoverflow.com/a/1184359/18625082
function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getDesiredMonth() {
  const monText = scSheet.getRange("A1").getValues()[0][0].toLowerCase()

  for (let i = 0; i < 12; i++) {
    if (months[i] == monText) {
      return i
    }
  }
}

function getDesiredYear() {
  const yearText = scSheet.getRange("B1").getValues()[0][0]

  return parseInt(yearText)
}

function dateTest() {
  // July 2009
  Logger.log(daysInMonth(2009, 6)); // 31
  // February 2009 & February 2008
  Logger.log(daysInMonth(2009, 1)); // 28
  Logger.log(daysInMonth(2008, 1)); // 29
}