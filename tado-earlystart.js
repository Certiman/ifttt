/* @certiman - November 2021 - version 2
 * The script below assumes your tado heating schedule for weekdays contains (late) starting times in holiday mode. Since neither IFTTT, nor TADO
 * allow to change starting times, extra early heating blocks are triggered (IF) when in weekdays working mode, which are skipped again IF a special calendar
 * contains events named "DAY OFF" (using the filter code below). When the early heating blocks are not skipped, other events triggering lighting in several rooms are added.
 * These events are handled with code from https://github.com/Certiman/ifttt/kasa-googlecalendar-turnOn.js
 *
 * The HEATING ON event should contain the "room X" strings in which lights are NOT activated when it is NOT a day off. 
 *   Other rooms will be lit, unless NO room is mentioned at all.
 *
 * Summary of the chain of events:
 * 1. IF: A Calendar event with the title "Do we start early heating?" serves as the IF event for this script.
 * 2. WITH: Several queries to tado history and the weather for tomorrow (not yet) are used in the filter code below, to block stuff in the then.
 * 3. THEN: Several actions like starting to heat for 90 to 120 minutes and adding some calendar events at the time of needed lighting.
 */

var message = ""
var titleMessage = ""
var luckies = []

// 1. find a DAY OFF event today:
var todayIsADayOff = false
/**
 * When a certain calendar contains event named DAY OFF, it will skip the early firing of tado heating blocks.
 * When the DAY OFF event contains the Strings "room A", "room B" or "room M", the creation of events in the same calendar 
 * which will trigger early KASA lighting scenes, will be skipped. 
 * But if nothing is mentioned in the event, they will ALL be skipped.
 * 
 * For the HEATING ON event, the inverse happens:
 */
let holidayList = GoogleCalendar.listEventsForDate.filter(opt => opt.Title === 'DAY OFF')
let workingdayList = GoogleCalendar.listEventsForDate.filter(opt => opt.Title === 'HEATING ON')

if ( holidayList.length > 0 ){
  // DAY OFF - only light up in the unlucky rooms, as mentioned in the DAY OFF EVENT
  let dayoffUNLuckies = holidayList[0].Description
  if ( dayoffUNLuckies.search("room") < 0 ) {
    // if there are no rooms mentioned, skip all of them being lit
    GoogleCalendar.quickAddEvent1.skip() // no lights MB
    GoogleCalendar.quickAddEvent2.skip() // no lights room A
    GoogleCalendar.quickAddEvent3.skip() // no lights room B
  } else {
    // Inverse logic: "room X" string NOT found means SKIP those lights
    if ( dayoffUNLuckies.search("room A") < 0 ) {
      // No lights in room A (Kid Two)
      GoogleCalendar.quickAddEvent2.skip() // The lighting scene trigger event will not be put in the calendar.
      luckies.push("K")
    }
    if ( dayoffUNLuckies.search("room B") < 0 ) {
      // No lights in room B (Kid One)
      GoogleCalendar.quickAddEvent3.skip() // The lighting scene trigger event will be put in the calendar.
      luckies.push("M")
    }
    if ( dayoffUNLuckies.search("room M") < 0 ) {
      // No lights in room M (Master bedroom)
      GoogleCalendar.quickAddEvent1.skip() // idem
      luckies.push("P")
    }
  }
  
  // for DAY OFF events set after 10 AM, we do not activate the heating early.
  let dayoffDate = new Date(holidayList[0].Start)
  // message = message + "dayOffDate.getHours: "+dayoffDate.getHours()
  todayIsADayOff = ( dayoffDate.getHours() < 10 ) 
}else{
  // no DAY OFF events found. Maybe skip lighting for some luckies
  let dayoffLuckies = workingdayList[0].Description
  if ( dayoffLuckies.search("room") < 0 ) {
    // if there are no rooms mentioned, skip all of them being lit
    GoogleCalendar.quickAddEvent1.skip() // no lights MB
    GoogleCalendar.quickAddEvent2.skip() // no lights room A
    GoogleCalendar.quickAddEvent3.skip() // no lights room B
  } else {
    if ( dayoffLuckies.search("room A") > 0 ) {
      // skip sending the trigger for lights in room A (Kid Two)
      GoogleCalendar.quickAddEvent2.skip() // The lighting scene trigger event will not be put in the calendar.
       luckies.push("K")
    }
    if ( dayoffLuckies.search("room B") > 0 ) {
      // skip sending the trigger for lights in room B (Kid One)
      GoogleCalendar.quickAddEvent3.skip() // idem
       luckies.push("M")
    }
    if ( dayoffLuckies.search("room M") > 0 ) {
      // skip sending the trigger for lights in room M (Master bedroom)
      GoogleCalendar.quickAddEvent1.skip() // idem
       luckies.push("P")
    }
  }
  todayIsADayOff = false
}

// 2. determine if the tado system in away mode or not? The idea is not to activate heating when none is at home (step 3)
var dateTadoSwitchedAway = new Date("")
var dateTadoSwitchedHome = new Date("")
var tadoIsInAwayMode = false
var switchAway
var switchHome

if ( switchAway = TadoHeating.historyOfTadoSwitchingToAwayMode[0] ){
  dateTadoSwitchedAway = new Date(switchAway.SwitchedAt)
  //message=message+", tadoSA:"+dateTadoSwitchedAway.toISOString()
  if ( switchHome = TadoHeating.historyOfTadoSwitchesToHomeMode[0] ){
    dateTadoSwitchedHome = new Date(switchHome.SwitchedAt)
    // message=message+", tadoSH:"+dateTadoSwitchedHome.toISOString()
    // if it switched Away more recently than it switched home, we assume it is Away mode.
    tadoIsInAwayMode = ( moment(dateTadoSwitchedAway).isAfter(moment(dateTadoSwitchedHome)) ) 
    // works also: tadoIsInAwayMode = ( dateTadoSwitchedAway.getTime() > dateTadoSwitchedHome.getTime() ) 
  }else{
    // object historyOfTadoSwitchesToHomeMode null
    tadoIsInAwayMode = true
    // message=message+", tadoSH: null"
  }
}else{
  // object historyOfTadoSwitchingToAwayMode null
  // tadoIsInAwayMode can remain false
  // message=message+", tadoSA: null"
}

// 3. To skip or not to skip
if ( todayIsADayOff || tadoIsInAwayMode ) {
  // Do not activate early heating
  TadoHeating.startHeating1.skip()  // Living room
  TadoHeating.startHeating2.skip()  // Kitchen
  TadoHeating.startHeating3.skip()  // Veranda
  titleMessage="No early heating today!"
  message="Tado was not activated. Did not have to get up: "+luckies.join(" & ")
}else{
  // Activate early heating - no skipping
  titleMessage="Rise and shine, early!"
  message="Tado fired up early today. Did not have to get up: "+luckies.join(" & ")
}

// IfNotifications.sendRichNotification.setTitle(titleMessage)
IfNotifications.sendRichNotification.setMessage(message)
