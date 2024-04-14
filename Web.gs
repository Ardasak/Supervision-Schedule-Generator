let scCopy = spreadsheet.getSheetByName("Schedule Display")

function doGet(e) {
  let index = HtmlService.createTemplateFromFile('index');

  index.teachers = getTeachers();
  return index.evaluate();
}

/**
 * Gets a list of teachers
 * 
 * @return {string[]} The teachers
 */
function getTeachers() {
  let teachers = tlSheet.getRange(`A3:A${tlSheet.getLastRow()}`).getValues().flat(Infinity);
  return teachers
}

function getTeacherSchedule(teacher) {
  let lName = teacher.split(",")[0].trim();
  console.log(lName);
  let teachersSchedule = scCopy.getRange("D4:H23").getValues();
  console.log(teachersSchedule);
  let scheduleIndexes = []
  for (let rowI = 0; rowI < teachersSchedule.length; rowI++) {
    for (let colI = 0; colI < teachersSchedule[rowI].length; colI++) {
      if (lName == teachersSchedule[rowI][colI]) {
        scheduleIndexes.push([rowI, colI]);
      }
    }
  }
  console.log(scheduleIndexes);
  let teacherSchedule = [];

  let year = scCopy.getRange("B1").getValue();
  let month = scCopy.getRange("A1").getValue();

  let daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

  for (let [rowI, colI] of scheduleIndexes) {
    let dates = scCopy.getRange(rowI % 2+1, 4 + colI).getValue().split(",").filter((val) => !/[a-zA-Z]/g.test(val)).map((val) => Number(val.trim()));
    dates.sort((a, b) => a-b);
    let dayOfWeek = daysOfWeek[colI];

    let loc = scCopy.getRange(rowI + 4 - rowI % 2, 1).getValue();
    let timeStr = scCopy.getRange(rowI + 4 - rowI % 2, 2).getValue();
    console.log([rowI, colI], year, month, dayOfWeek, loc, timeStr, dates);

    for (let date of dates) {
      teacherSchedule.push([date, `${dayOfWeek} ${month} ${date} at ${loc} from ${timeStr.split("-")[0].trim()} to ${timeStr.split("-")[1].trim()}.`])
    }
  }
  teacherSchedule.sort((a, b) => a[0] - b[0]);
  teacherSchedule = teacherSchedule.map((val) => val[1]);
  console.log(teacherSchedule)
  return teacherSchedule;
}