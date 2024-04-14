let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
let scSheet = spreadsheet.getSheetByName("Schedule")
let dhSheet = spreadsheet.getSheetByName("Days Off")
let tlSheet = spreadsheet.getSheetByName("Teacher List")
let tpSheet = spreadsheet.getSheetByName("Teacher Preferences")

function nothing() {
  
}

function fixCs() {
  values = spreadsheet.getSelection().getActiveRangeList()

  /*values.forEach(function(v) {
    Logger.log(v)
  })*/
}

function randomData() {
  range = tpSheet.getRange("C2:C104")
  vals = range.getValues()

  //Logger.log(vals)
  //Logger.log(typeof(vals))

  for (let i = 0; i < vals.length; i++) {
    vals[i][0] = String.fromCharCode(Math.random() * 4 + 65)
  }

  //Logger.log(vals)
  //Logger.log(typeof(vals))

  range.setValues(vals)
}