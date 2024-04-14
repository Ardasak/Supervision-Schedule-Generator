function isCleaned() {
  return tpSheet.getRange("A1").getValues()[0][0] != "Timestamp"
}

function cleanData() {
  /// Make sure this isn't run more than once on data
  if (isCleaned()) {
    Logger.log("Data has already been cleaned.")
    return
  }
  
  /// Set up ranges for manipulation
  let fullDataRange = tpSheet.getDataRange()
  let bottomRow = Math.floor(fullDataRange.getLastRow())
  let headers = tpSheet.getRange("A1:G1")

  // Range of data to move
  let data = tpSheet.getRange(
    "B1:G" + bottomRow.toString()
  ).getValues()

  // Range of where to move data
  let range = tpSheet.getRange(
    "A1:F" + bottomRow.toString()
  )

  /// Move all data left to override/delete the Timestamp column
  range.setValues(data)
  // Delete data left behind
  tpSheet.getRange("G:G").clear()

  /// Format rule: highlight empty cells yellow to warn for potential errors
  var rule = SpreadsheetApp.newConditionalFormatRule()
      .whenCellEmpty()
      .setBackground("#FFF2CC")
      .setRanges([range])
      .build();
  var rules = tpSheet.getConditionalFormatRules();
  rules.push(rule);
  tpSheet.setConditionalFormatRules(rules);

  /// Change column headers
  headers.setValues([
    ["Email","Prep","Cont %", "Prefer", "Prefer not", "Clubs", "Notify?"]
  ])

  // Notification checkboxes
  checkboxRange = tpSheet.getRange("G2:G" + tpSheet.getLastRow())
  checkboxRange.insertCheckboxes()

  /// Resize all columns to fit data, do this last
  tpSheet.autoResizeColumns(1, 6);
}