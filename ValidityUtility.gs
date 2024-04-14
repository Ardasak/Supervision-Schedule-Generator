/// This runs all validation checks & methods

function validateAllFromToolbar() {
  validateAll(true)
}

function validateAll(promptIfOkay) {
  let ui = SpreadsheetApp.getUi();

  if (!validateSheetNames())
    return false

  if (!isCleaned())
    cleanData()

  if (!validateAllResponded())
    return false

  if (!validateResponsesAuthorized())
    return false

  if (!validateTeachPrefs())
    return false

  if (promptIfOkay) {
    ui.alert("All data is valid and ready to generate a new schedule.")
  }

  return true
}

function validateSheetNames() {
  let ui = SpreadsheetApp.getUi();  

  if (scSheet == null) {
    ui.alert("Error: There must be a \"Schedule\" Sheet containing a blank monthly schedule.")

    return false
  }
  else if (dhSheet == null) {
    ui.alert("Error: There must be a \"Dates & Holidays\" Sheet containing a list of holidays planned for this school year.")

    return false
  }
  else if (tlSheet == null) {
    ui.alert("Error: There must be a \"Teacher List\" Sheet containing a list of all teacher names and emails.")

    return false
  }
  else if (tpSheet == null) {
    ui.alert("Error: There must be a \"Teacher Preferences\" Sheet containing responses from a teacher preferences Google Form.")

    return false
  }

  return true
}

/// This checks for people who should've responded but haven't

function checkMissingResponsesFromToolbar() {
  validateAllResponded(true)
}

// Returns true if data is complete, or if user is okay with the incomplete data.
// Returns false if data is incomplete and user is not okay with the incomplete data.
function validateAllResponded(promptIfOkay) {
  let ui = SpreadsheetApp.getUi();
  
  if (!isCleaned()) {
    cleanData()
  }

  /// Find end of list
  let tlLastRow = getLastRow(tlSheet)
  let tpLastRow = getLastRow(tpSheet)

  // Get emails to work with
  let allEmails = tlSheet.getRange("B2:B" + tlLastRow.toString()).getValues()
  //Logger.log(allEmails)
  let respondedEmails = tpSheet.getRange("A2:A" + tpLastRow.toString()).getValues()
  let flaggedEmails = []

  // Cross-reference listed teachers & responses, flag emails that haven't responded
  for (let i = 0; i < allEmails.length; i++) {
    let checkingEmail = allEmails[i][0]
    var found = false
    for (let ii = 0; ii < respondedEmails.length; ii++) {
      if (respondedEmails[ii][0] == checkingEmail) {
        found = true
        break
      }
    }
    if (!found)
      flaggedEmails.push(checkingEmail)
  }
  //Logger.log(allEmails)
  //Logger.log(respondedEmails)

  // Alert user to any issue and let them choose what to do
  if (flaggedEmails.length > 0) {
    // Alert user that there are teachers who were supposed to respond who haven't
    let response = ui.alert(
      "A total of "
      + flaggedEmails.length.toString()
      + " teachers did not respond.\n\nAny rows in the Teacher Preferences Sheet with any content count as a response, emails and prep periods are required at minimum for all responses.\n\nDo you want to add their emails to the preferences list to add their data manually?",
      ui.ButtonSet.YES_NO
    )

    // Don't add emails to TP list, show user the list of teachers who didn't respond. Prompt them whether they 
    if (response == ui.Button.NO) {
      naughtyTeacherList = ""

      for (let i = 0; i < flaggedEmails.length; i++) {
        naughtyTeacherList += flaggedEmails[i] + (
          i == flaggedEmails.length - 1 ? "" : (
            i == flaggedEmails.length - 2 ? ", and" : ","
          )
        )
        + "\n"
      }

      // TODO: fix this prompt when promptIfOkay==true to make it look nicer
      response = ui.alert(
        "These are the teachers who didn't respond:\n"
        + naughtyTeacherList
        + "\nIf you proceed these staff won't be scheduled at all.\nWould you like to proceed anyways?",
        ui.ButtonSet.YES_NO
      )

      if (response == ui.Button.NO) {
        return false
      }
      else if (response == ui.Button.YES) {
        return true
      }
    }
    // Add emails to TP list then exit, no further action warranted
    else if (response == ui.Button.YES) {
      let addingRange = tpSheet.getRange(
        "A"
        + (tpLastRow+1).toString()
        + ":A"
        + (tpLastRow+flaggedEmails.length).toString()
      )

      let newEmailValues = []

      for (i = 0; i < flaggedEmails.length; i++) {
        newEmailValues.push([flaggedEmails[i]])
      }

      //Logger.log(addingRange.getHeight())
      //Logger.log(newEmailValues.length)

      addingRange.setValues(newEmailValues)

      return false
    }
  }

  if (promptIfOkay == true) {
    ui.alert("All teachers listed have responded.")
  }

  // TODO: check for minimum data (email, prep)
  return true
}

/// This checks for people who have responded but shouldn't have

function checkUnauthorizedResponsesFromToolbar() {
  validateResponsesAuthorized(true)
}

function validateResponsesAuthorized(promptIfOkay) {
  let ui = SpreadsheetApp.getUi();
  /// Find end of list
  let tlLastRow = getLastRow(tlSheet)
  let tpLastRow = getLastRow(tpSheet)

  // Get emails to work with
  let allEmails = tlSheet.getRange("B2:B" + tlLastRow.toString()).getValues()
  let respondedEmails = tpSheet.getRange("A2:A" + tpLastRow.toString()).getValues()
  flaggedEmails = []

  // Cross-reference listed teachers & responses, flag emails who responded but shouldn't have
  for (let i = 0; i < respondedEmails.length; i++) {
    let checkingEmail = respondedEmails[i][0]
    var found = false
    for (let ii = 0; ii < allEmails.length; ii++) {
      if (allEmails[ii][0] == checkingEmail) {
        found = true
        break
      }
    }
    if (!found)
      flaggedEmails.push(checkingEmail)
  }

  // Alert user to any issue and let them choose what to do
  if (flaggedEmails.length > 0) {
    naughtyResponseList = ""

    for (let i = 0; i < flaggedEmails.length; i++) {
      naughtyResponseList += flaggedEmails[i] + (
        i == flaggedEmails.length - 1 ? "" : (
          i == flaggedEmails.length - 2 ? ", and" : ","
        )
      )
      + "\n"
    }

    let response = ui.alert(
      flaggedEmails.length
      + " responses are from unauthorized emails:\n"
      + naughtyResponseList
      + "\nNote: If you expect an email to be authorized you will have to click \"No\" then add their name and email to the \"Teacher List\" Sheet. If you accidentally delete these responses you may retrieve them from the Google Form again, it's recommended to delete the \"Teacher Preferences\" Sheet and begin the generation process again so no other data is lost or damaged.\n\nWould you like to delete all of these unauthorized responses?",
      ui.ButtonSet.YES_NO
    )

    if (response == ui.Button.NO) {
      return false
    }
    else if (response == ui.Button.YES) {
      response = ui.alert(
        "If you accidentally delete these responses you may retrieve them from the Google Form again, it's recommended to delete the \"Teacher Preferences\" Sheet and begin the generation process again so no other data is lost or damaged\n\nAre you sure you want to delete these responses?",
        ui.ButtonSet.YES_NO
      )

      if (response == ui.Button.NO) {
        return false
      }
      else if (response == ui.Button.YES) {
        deleteResponses(naughtyResponseList)
      }
    }
  }
  else if (promptIfOkay) {
    ui.alert("No one has responded that isn't allowed to.")
  }

  return true
}

/// Check if entered teacher preference data is valid

const locations = [
  "Library First Period",
  "Library",
  "Cafeteria",
  "Lower Foyer",
  "Lower Halls/Music Area",
  "Upper Foyer",
  "Upper Halls/Gym Balcony", // NOTE: this location is modified from the original sheet,
  "Gym"
]

const prepPeriods = [
  "A","B","C","D"
]

const contPcs = [
  33,
  67,
  100
]

const clubDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday"
]

function validatePrefsFromToolbar() {
  validateTeachPrefs(true)
}

function validateTeachPrefs(promptIfOkay) {
  let ui = SpreadsheetApp.getUi();

  if (!isCleaned()) {
    cleanData()
  }

  // Check for excess data to prevent confusion
  let dataRange = tpSheet.getDataRange()
  if (dataRange.getLastColumn() > 7) {
    ui.alert("Error in teacher preference data: Too many columns. The last one should be Clubs under column F")
    
    return false
  }

  let dataErrors = ""

  let data = dataRange.getValues()

  //Logger.log(dataRange)
  //Logger.log("datarangeteehee")

  // Check emails, pre, cont %, prefer, not prefer, clubs
  for (rowId in data) {
    const row = data[rowId]

    if (rowId == 0) continue

    rowId = (parseInt(rowId) + 1).toString() // For error messages to be human-readable, data is still zero-indexed even though the sheet is one-indexed

    /*Logger.log(rowId.toString())
    Logger.log(row.toString())
    Logger.log(typeof(rowId))
    Logger.log(typeof(row))*/

    // Email: ensure domain is @ocdsb.ca, even though there is already an email authentication sytem being run. Possibly unnecessary.
    if (!row[0].endsWith("@ocdsb.ca")) {
      dataErrors += `Email '${row[0]}' at row ${rowId} is from an invalid domain: not @ocdsb.ca.\n`
    }

    // Prep period: Consider using char codes for this instead for minor performance improvements
    if (!prepPeriods.includes(row[1])) {
      dataErrors += `Prep period '${row[1]}' at row ${rowId} is invalid.\n`
    }

    // Contract % Status: Make sure it is exactly 33, 67, or 11
    if (!contPcs.includes(row[2])) {
      dataErrors += `Contract status % '${row[2]}' at row ${rowId} is invalid\n`
    }

    // Preferred location
    if (row[3].length > 0 && !locations.includes(row[3])) {
      dataErrors += `Preffered location '${row[3]}' at row ${rowId} is invalid\n`
    }

    // Preferred not to be location
    if (row[4].length > 0 && !locations.includes(row[4])) {
      dataErrors += `Preffered not to be location '${row[4]}' at row ${rowId} is invalid\n`
    }

    // Clubs days
    let clubsValid = row[5].length == 0

    if (!clubsValid) {
      for (day of row[5].split(", ")) {
        if (!clubDays.includes(day)) {
          dataErrors += `One or more days for clubs on row ${rowId} are invalid\n`
        }
      }
    }
  }

  if (dataErrors.length > 0) {
    ui.alert(
      "The following errors were found in the \"Teacher Preference\" Sheet.\n"
      + dataErrors
      + "\n"
    )

    return false
  }
  else {
    if (promptIfOkay) {
      ui.alert(
        "No errors were found in the \"Teacher preference\" Sheet."
      )
    }

    return true
  }
}

// TODO: better outputs during the data validation process if everything is going alright

// TODO: make "responses" plural/singular dependent text

// TODO: review all files and replace unnecessary "else if" conditions that can be "else" conditions with proper comments, it's just this way temporarily for readability before proper commenting is done




