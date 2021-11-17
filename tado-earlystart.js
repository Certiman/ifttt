var message = ""
var titleMessage = ""

// 1. find a DAY OFF event today:
var todayIsADayOff = false
/**
 * When a certain calendar contains event named DAY OFF, it will skip the early firing of tado heating blocks.
 * When the event contains the Strings "room A", "room B" or "room M", the creation of events in the same calendar 
 * which will trigger early KASA lighting scenes, will also be skipped. 
 */
let holidayList = GoogleCalendar.listEventsForDate.filter(opt => opt.Title === 'DAY OFF')
if ( holidayList.length > 0 ){
  // for DAY OFF events in the afternoon, we still activate the heating early.
  let dayoffDate = new Date(holidayList[0].Start)
  let dayoffLuckies = holidayList[0].Description
  if ( dayoffLuckies.search("room A") > 0 ) {
    // skip sending the trigger for lights in room A (Kid Two)
    GoogleCalendar.quickAddEvent2.skip() // The lighting scene trigger event will not be put in the calendar.
  }
  if ( dayoffLuckies.search("room B") > 0 ) {
    // skip sending the trigger for lights in room B (Kid One)
    GoogleCalendar.quickAddEvent3.skip() // idem
  }
  if ( dayoffLuckies.search("room M") > 0 ) {
    // skip sending the trigger for lights in room M (Master bedroom)
    GoogleCalendar.quickAddEvent1.skip() // idem
  }
  // message = message + "dayOffDate.getHours: "+dayoffDate.getHours()
  todayIsADayOff = ( dayoffDate.getHours() < 10 ) 
}else{
  // no DAY OFF events found.
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
  GoogleCalendar.quickAddEvent1.skip() // no lights MB
  GoogleCalendar.quickAddEvent2.skip() // no lights room A
  GoogleCalendar.quickAddEvent3.skip() // no lights room B
  titleMessage="No early heating today!"
  message="Tado was not to be activated at the startEarly event. Variable todayIsADayOff: "+todayIsADayOff+", todoIsInAwayMode: "+tadoIsInAwayMode
}else{
  // Activate early heating - no skipping
  titleMessage="Rise and shine, early!"
  message="Tado fired up early today. Variable todayIsADayOff: "+todayIsADayOff+", todoIsInAwayMode: "+tadoIsInAwayMode
}

// IfNotifications.sendRichNotification.setTitle(titleMessage)
IfNotifications.sendRichNotification.setMessage(message)
