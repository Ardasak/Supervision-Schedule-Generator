const NUM_FIRST_PERIOD = 2                     // Number of locations that need assigning every day during 1st period (8:40 - 9:17)
const NUM_LUNCH = 8                            // Number of locations that need assigning every day during lunch (11:25 - 12:02)
const NUM_SLOTS = NUM_FIRST_PERIOD + NUM_LUNCH // Number of locations that need to be assigned every day

const USE_PREFS = false
const SHOW_LOADING = true

function generateSchedule() {
  if (!validateAll())
    return

  compileTeacherPrefs(true)

  generateDates()

  generateSupervisorTimetable()
}

function generateDayTitles() {
  let daysRange = scSheet.getRange("D1:H2")
  let desiredYear = getDesiredYear()
  let desiredMonth = getDesiredMonth()
}

// NOTE: detail which teachers are available least and which periods have the least options for teachers, then select randomly while counting how many times teachers are scheduled and randomly selecting equal level teachers.
function generateSupervisorTimetable() {
  //let infoRange = scSheet.getRange(`A4:B${3+2*NUM_SLOTS}`)
  let tableRange = scSheet.getRange(`D4:H${3+2*NUM_SLOTS}`)

  tableRange.clearContent()
  let schedule = tableRange.getValues()

  let teacherEmails = tpSheet.getRange("A2:A" + tpSheet.getLastRow().toString()).getValues().map(x => {return x[0]})

  Logger.log(teacherEmails)
  
  let timesTeacherScheduled = {}
  teacherEmails.forEach(email => {
    timesTeacherScheduled[email] = 0
  })

  // Used to find the teacher with the least availability
  /*let availPeriodByTeacher = []

  // Used to find all teachers available during a period
  let availTeacherByPeriod = []

  // 
  let teacherAvailabilities = {}

  // NOTE: Array.sort() sorts from least to greatest

  // Calculate the availability of all teachers and periods
  for (dayNum of [1,2]) {
    for (let day = 0; day < 5; day++) {

      for (email of teacherEmails) {
        teacherAvailabilities[email] = []

        if (teacherAvail(email, "L", clubDays[day], dayNum)) {
          teacherAvailabilities[email].push(`L${day}${dayNum}`)
        }
        
        if (teacherAvail(email, "A", clubDays[day], dayNum)) {
          teacherAvailabilities[email].push(`A${day}${dayNum}`)
        }
      }
    }
  }

  Logger.log(availPeriodByTeacher)
  Logger.log("SPACER")
  Logger.log(availTeacherByPeriod)
  Logger.log("SPACER2")
  Logger.log(timesTeacherScheduled)*/

  let loadingText = []
  for (let i = 0; i < (NUM_SLOTS*2); i++) {
    loadingText.push(["..."])
  }

  // Make full schedule based on availability
  for (let day = 0; day < 5; day++) {
    //Logger.log(`Generating for ${clubDays[day]}`)
    
    scSheet.getRange(4, 4+day, NUM_SLOTS * 2, 1).setValues(loadingText)

    let daySched = [
      [],
      []
    ]

    for (let loc = 0; loc < NUM_SLOTS; loc++) {
      if (loc == 0) {
        // initialize list to keep track of 1st period scheduling already done between day 1 and day 2
      }
      else if (loc == NUM_FIRST_PERIOD - 1) {
        // clear previous day 1 and day 2 schedules stored in daySched and keep track of library time slots
        daySched = [
          [],
          []
        ]
      }

      for (dayNum of [1,2]) {
        //Logger.log("Loop: " + dayNum)

        const curPeriod = loc<2?"A":"L"
        
        availTeachers = teacherEmails.filter(email => {
          return teacherAvail(email, curPeriod, day, dayNum)
          && !daySched[dayNum-1].includes(email)//!alreadyScheduled(email, schedule, loc, day, dayNum)
        })

        toSchedule = availTeachers[Math.floor(Math.random()*availTeachers.length)]

        //Logger.log(`Scheduling ${toSchedule} of ${availTeachers.length} as ${filteredLastName(toSchedule)}`)
        
        schedule[loc*2 + dayNum - 1][day] = filteredLastName(toSchedule)
        daySched[dayNum-1].push(toSchedule)
      }
    }
  }

  Logger.log(schedule)

  writeTimetable(schedule)

  // Schedule during lunch
}

function alreadyScheduled(email, schedule, loc, day, dayNum) {
  const name = filteredLastName(email)

  if (loc < NUM_FIRST_PERIOD) {
    for (i in NUM_FIRST_PERIOD) {
      if (schedule[i*2 + dayNum - 1][day] == name) {
        return true
      }
    }
  }
  else {
    for (i in NUM_LUNCH) {
      if (schedule[(i+NUM_FIRST_PERIOD)*2 + dayNum - 1][day] == name) {
        return true
      }
    }
  }

  return false
}



function writeTimetable(timetable) {
  let tableRange = scSheet.getRange(`D4:H${3+2*NUM_SLOTS}`)

  tableRange.setValues(timetable)
}

function addOrInit(table, key, modifier) {
  if (table[key] == null) {
    table[key] = modifier
  }
  else {
    table[key] += modifier
  }
}

let tPrefs = {}

// Only use skipValidCheck==true when you are 100% sure teacher data has been checked already during this execution (eg. generateSchedule() already uses validateAll())
function compileTeacherPrefs(skipValidCheck) {
  if (!skipValidCheck && !validateTeachPrefs())
    return false
  
  let dataRange = tpSheet.getDataRange()
  let data = dataRange.getValues()

  // TODO: consider Array.fill
  for (let rowId = 1; rowId < dataRange.getLastRow(); rowId++) {
    const row = data[rowId]
    tPrefs[row[0]] = [ // Index is email
      row[1], // 0 is prep A, B, C, or D
      row[2], // 1 is Contract Status 33, 67, or 100
      row[3], // 2 is preferred location
      row[4], // 3 is unpreferred location
      row[5].split(", ") // 4 is an array of days they run clubs during lunch
    ]
  }

  //Logger.log(tPrefs)
}

function tavTest() {
  compileTeacherPrefs()
  Logger.log(teacherAvail("siros.amini@ocdsb.ca", "L", 2, 1))
  Logger.log(teacherAvail("siros.amini@ocdsb.ca", "L", 2, 2))
}

/*
email: String = "sam.green@ocdsb.ca"
period: String = F (first period) or L (lunch)
*/
function teacherAvail(email, period, weekday, dayNum) {
  //return true
  weekday = clubDays[weekday]

  /*Logger.log(email)
  Logger.log(period)
  Logger.log(weekday)
  Logger.log(dayNum)*/

  const prefs = tPrefs[email]

  if (period == "L") {
    /*Logger.log("it's L")
    Logger.log(prefs[4])
    Logger.log(weekday)*/
    // Check for lunch clubs & prep
    if (prefs[4].includes(weekday)) {
      //Logger.log("a")
      return false
    }

    //Logger.log("b")

    if (dayNum == 1) {
      if (prefs[0] != "B" && prefs[0] != "C") {
        return true
      }
    }
    else if (dayNum == 2) {
      if (prefs[0] != "A" && prefs[0] != "D") {
        return true
      }
    }

    //Logger.log("c")
  }
  else if (period == "A") {
    if ((dayNum == 1 && prefs[0] == "A") || (dayNum == 2 && prefs[0] == "B")) {
      return true
    }
  }

  //Logger.log("d")

  return false
}








