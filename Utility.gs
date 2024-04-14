function getLastRow(sheet) {
  return Math.floor(sheet.getDataRange().getLastRow())
}

// TODO: account for duplicate last names (checking all names is necessary)
function nameFromEmail(email) {
  let range = tlSheet.getDataRange()
  let values = range.getValues()

  //Logger.log(values)

  for (let row = 1; row < range.getLastRow(); row++) {
    if (values[row][1] == email)
      return values[row][0]
  }

  Logger.log(`NAME NOT FOUND?? ${email}`)

  return "NOT FOUND"
}

function lastName(name) {
  return name.split(", ")[0]
}

function firstName(name) {
  return name.split(", ")[1]
}

let problematicNames = {}
// email = [FirstName1, FirstName2, FirstName3]

function initializeProblematicNames() {
  let allNames = tlSheet.getRange("B2:B" + tlSheet.getLastRow().toString()).getValues().map(x => {return x[0]})

  
  // identifies duplicates, thank you https://flexiple.com/javascript/find-duplicates-javascript-array
  //const duplicateNames = array.filter((item, index) => array.indexOf(item) !== index); // ARCHIVED BC DOESN'T KEEP INDEX

  for (i in allNames) {
    const name1 = filteredLastName(allNames[i])

    for (ii in allNames) {
      const name2 = filteredLastName(allNames[ii])

      if (ii != i && name1 == name2) {
        if (problematicNames[name1] == null) {
          problematicNames[name1] = []
        }

        problematicNames[name1].push(firstName(allNames[i]))
        problematicNames[name1].push(firstName(allNames[ii]))
      }
    }
  }

  Logger.log(problematicNames)
}

function filteredLastName(email) {
  const name = nameFromEmail(email)
  let temp = name.split(", ")

  let   last = temp[0]
  const first = temp[1]

  // If the last name is hyphenated, take the last name of the options.
  if (last.includes("-")) {
    temp = last.split("-")
    last = temp[temp.length - 1]
  }

  return last
}

function deleteResponses(naughtyResponseList) {
  // TODO: delete entire rows of unauthorized responses and move the rows up etc etc yk the drill
}

function helpMenu1() {
  SpreadsheetApp.getUi().alert(
    "Welcome to the supervisor scheduling tool. This tool will help Earl of March SS streamline and automate the assignment of teachers to supervise various school areas while taking the preferences of all teachers into account.\n\nThis tool can be used in just one Google Sheet as long as you would like.\n\nThis is how you set it up:\n1. Make a copy of the provided template sheet\n2. Fill out the holiday dates in the \"Dates & Holidays\" Sheet (MM/DD/YYYY).\n3. Fill out the month & year you want to generate a schedule for in the \"Schedule\" Sheet.\n4. Fill out the \"Teacher List\" Sheet with all secondary teacher (or staff members who can supervise) names and emails formatted as necessary.\n5. Have teachers respond to a copy of the provided template Google Form with their availability and preferences.\n6. Export the responses of that form to this Google Sheet and name the Sheet \"Teacher Preferences\".\n7. You're ready! Click the \"Generate Schedule\" button.\n\nWhen it's time for next month's schedule: Repeat steps 3 through 7.\n\nIf you want to reuse this sheet copy for a future year, be sure to complete all steps 2 through 7 as holidays change each year. Please note that Steps 4 through 6 are only necessary if teachers join or leave the school, or if you expect teachers availability to change. (eg. new year or semester is starting)"
  )
}

function helpMenu2() {
  SpreadsheetApp.getUi().alert(
    "Welcome to the supervisor scheduling tool. Please ensure you've read the help under \"What is this?\" before reading this.\n\nWhen you click the \"Generate Schedule\" button, if everything is already in order a full schedule will be immediately generated. If there are any issues when you try to generate a schedule, you will be alerted to them and provided with options to fix them. The other buttons (Clean Data, Check for Missing Responses, Check for Unauthorized, Validate Preferences) are all troubleshooters that are run automatically while generating a schedule that are run automatically, but the buttons are there if you would like to check for problems individually. Note that if a schedule has already been generated and you try to generate a new one there will be no issues but the old schedule will be overwritten with a new one."
  )
}
















