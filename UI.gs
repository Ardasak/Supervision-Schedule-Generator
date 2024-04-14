function searchDisplay(){
  var sheet = SpreadsheetApp.getActiveSheet();
  var ui = SpreadsheetApp.getUi();
  var searchData = ui.prompt("Search a name: ").getResponseText();

  var schedule = sheet.getRange('D4:H23');
  var values = schedule.getValues();

  schedule.setBackground("white");

  values = traverseArray(values, searchData.toString());

  values.forEach((item) => {
    sheet.getRange(item[0] + 4, item[1] + 4).setBackground("yellow");
  });
}

function convertMonth(month){
  var dict = {
    "January": "Jan",
    "February": "Feb",
    "March": "Mar",
    "April": "Apr",
    "May": "May",
    "June": "Jun",
    "July": "Jul",
    "August": "Aug",
    "September": "Sep",
    "October": "Oct",
    "November": "Nov",
    "December": "Dec"
  };

  return dict[month];
}

function filter(list){
  list.forEach((item, index) => {
    item = item.filter(function (el) {
    return el instanceof Date;
  });

    list[index] = item;
  })
}

function generateRange(startDate, endDate){
  var dict = {
    "Jan": 31,
    "Feb": 28, 
    "Mar": 31,
    "Apr": 30,
    "May": 31,
    "Jun": 30,
    "Jul": 31,
    "Aug": 31,
    "Sep": 30,
    "Oct": 31,
    "Nov": 30,
    "Dec": 31
  };

  var outputArray = [];

  startDate = startDate.toString().slice(4);
  endDate = endDate.toString().slice(4);

  var startMonth = startDate.toString().slice(0,3);
  var startDay = startDate.toString().slice(4,6);

  var endMonth = endDate.toString().slice(0,3);
  var endDay = endDate.toString().slice(4,6);

  if(startMonth == endMonth){
    var dayDifference = parseInt(endDay) - parseInt(startDay) + 1
    
    for(let i = 0; i < dayDifference; i++){
      var format = startMonth + " " + (parseInt(startDay) + i).toString() + startDate.toString().slice(6, 11)
      outputArray.push(format)
    }
  }
  else{
    var dayDifference = parseInt(endDay) + (dict[startMonth] - startDay) + 1;

    for(let i = 0; i < dayDifference; i++){
      if(i < (dict[startMonth] - startDay + 1)){
        var format = startMonth + " " + (parseInt(startDay) + i).toString() + startDate.toString().slice(6, 11)
        outputArray.push(format)
      }
      else{
        var monthList = Object.keys(dict);
        var startMonthIndex = monthList.indexOf(startMonth);
        var format = monthList[startMonthIndex < 11 ? startMonthIndex + 1 : 0] + " " + (i - (dict[startMonth] - startDay)).toString() + endDate.toString().slice(6, 11);
        outputArray.push(format);
      }
    }
  }

  return outputArray;
}

function findTheDate(sheet, index){
  // var dateRange = createDateSpan()

  var all = sheet.getRange("A1:I25").getValues();
  var daysOff = SpreadsheetApp.getActive().getSheetByName('Days Off');
  var output = "";

  var offList1 = daysOff.getRange("B3:C11").getValues();
  var offList2 = daysOff.getRange("B13:E14").getValues();

  filter(offList1);
  filter(offList2);

  offList1 = offList1.concat(offList2);

  var offListDayString = [];
  var offListRangeString = [];

  for(let i = 0; i < offList1.length; i++){
    if(offList1[i].length == 1){
      offListDayString.push(offList1[i].toString().slice(4, 15));
    }
    else{
      offListRangeString.push(offList1[i]);
    }
  }

  offListRangeString.forEach((item, index) => {
    offListRangeString[index] = generateRange(item[0], item[1])
  })

  month = formatMonth(all[0][0]);
  year = all[0][1];
  
  day = all[index[0] % 2 == 0 ? 0 : 1][index[1] + 3];
  day = day.toString().split(",");

  for(let i = 0; i < day.length; i++){
    dayTemp = day[i].toString().replace(/\D/g,'');

    if(day.length == 1){
      dayTemp = "0" + day;
    }

    var date = convertMonth(month) + " " + dayTemp + " " + year;

    if(offListDayString.includes(date) || offListRangeString.flat().includes(date)){
      day.splice(i, 1);
    }
  }

  day.forEach((item, index) => {
    if(day.length == 1){
      output += item;
    }
    else{
      if(index + 1 != day.length){
        output += item + ", ";
      }
      else{
        output += "and " + item;
      }
    }
  });

  output += " of " + month + "<br>";

  return output;
}

function formatMonth(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function searchPersonDuty(name){
  var sheet = SpreadsheetApp.getActive().getSheetByName('Schedule Display');
  var all = sheet.getRange("A1:I25").getValues();
  var schedule = sheet.getRange('D4:H23');
  var values = schedule.getValues();
  var indexList = [];
  var output = "";

  indexList = traverseArray(values, name);

  indexList.forEach((item) => {
      output += all[item[0] + (item[0] % 2 == 0 ? 3 : 2)][0] + " at " + all[item[0] + (item[0] % 2 == 0 ? 3 : 2)][1] + " on " + findTheDate(sheet, item);
  });

  return output;
}

function traverseArray(values, name){
  var outputList = [];

  for(let i = 0; i < values.length; i++){
    for(let j = 0; j < values[i].length; j++){
      if(values[i][j].toString().slice(0, name.toString().length).toLowerCase().includes(name.toLowerCase())){
        if(name != ""){
          outputList.push([i, j]);
        }
      }
    }
  }

  return outputList;
}

function resetDisplay(){
  var sheet = SpreadsheetApp.getActiveSheet();

  var schedule = sheet.getRange('D4:H23');
  schedule.setBackground("white");
}

function getName(){
  var sheet = SpreadsheetApp.getActive().getSheetByName('Teacher List');
  var names = sheet.getRange("A3:A105").getValues();
  Logger.log(names[0][0].split(",")[1])
}

function notifyStaff(){
  var sheet = SpreadsheetApp.getActive().getSheetByName('Teacher List');


  var mails = sheet.getRange("B3:B105").getValues();
  var names = sheet.getRange("A3:A105").getValues();
  var boxes = sheet.getRange("C3:C105").getValues();

  boxes.forEach((item, index) => {
    if(item[0]){
      htmlBody = "An update was made on your schedule: <br><br><br>" + searchPersonDuty(names[index][0].split(",")[0]);
      
      MailApp.sendEmail({to: "ardasak434@gmail.com", subject: "Schedule Update", htmlBody: htmlBody});
    }
  })
}

function onEdit(e){
  var sheet = SpreadsheetApp.getActive().getSheetByName('Teacher List');


  var all = sheet.getRange("C2");
  var boxes = sheet.getRange("C3:C" + sheet.getLastRow().toString());

  if(e.range.getRow() == 2){
    if(all.getValue()){
      boxes.setValue(true);
    }
    else{
      boxes.setValue(false);
    }
  }
  else{
    boxes.getValues().forEach((item) => {
    if(!item[0]){
      all.setValue(false);
      throw "Ended";
    }
    all.setValue(true);
  })  
  }
}

function createTrigger(){
  ScriptApp.newTrigger("remindStaff")
   .timeBased()
   .everyWeeks(1)
   .create();
}

function remindStaff(){
  var sheet = SpreadsheetApp.getActive().getSheetByName('Teacher List');

  var mails = sheet.getRange("B3:B105").getValues();
  var names = sheet.getRange("A3:A105").getValues();
  
  mails.forEach((item, index) => {
    MailApp.sendEmail({to: "ardasak434@gmail.com", subject: "Weekly Schedule Reminder", htmlBody: searchPersonDuty(names[index][0].split(",")[0])});
  });
}

function copySheet () {
  let spreadSheet = SpreadsheetApp.getActiveSpreadsheet();

  let source = spreadSheet.getSheetByName("Schedule").getRange("A1:H25");
  let destination = spreadsheet.getSheetByName("Schedule Display").getRange("A1:H25");
  
  source.copyTo(destination);
}
