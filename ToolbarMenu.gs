function onOpen() {
  let ui = SpreadsheetApp.getUi(); // Or DocumentApp, SlidesApp or FormApp.
  ui.createMenu('Sched') //New menu in sheets called 'Custom Menu'
      .addItem('Generate Schedule', 'generateSchedule')
      .addItem('Generate Calendar', 'generateDates')
      .addSubMenu(SpreadsheetApp.getUi().createMenu('Troubleshoot')
        .addItem('Perform all Checks', 'validateAllFromToolbar')
        .addItem('Clean Data', 'cleanData')
        .addItem('Check for Missing Responses', 'checkMissingResponsesFromToolbar')
        .addItem('Check for Unauthorized Responses', 'checkUnauthorizedResponsesFromToolbar')
        .addItem('Verify Teacher Preferences', 'validatePrefsFromToolbar')
      )
      .addItem('How do I troubleshoot?', 'helpMenu2')
      .addItem('What is this?', 'helpMenu1')
      .addToUi();
}