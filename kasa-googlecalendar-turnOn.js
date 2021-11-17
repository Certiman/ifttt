/*
 * ANother script creates events in the IFTTT calendar with the title containing the room to light up.
 * This script can only skip one room because of the way the IF is written.
let inRoomM = GoogleCalendar.eventFromSearchStarts.Title.search("room M") > 0
let inRoomA = GoogleCalendar.eventFromSearchStarts.Title.search("room A") > 0
let inRoomB = GoogleCalendar.eventFromSearchStarts.Title.search("room B") > 0

if ( inRoomM ){
  // Kasa.turnOn1.skip() // light room M
  Kasa.turnOn2.skip() // do not light room A
  Kasa.turnOn3.skip() // do not light room B
}else if ( inRoomA ){
  Kasa.turnOn1.skip()
  // Kasa.turnOn2.skip()
  Kasa.turnOn3.skip()
}else if ( inRoomB ){
  Kasa.turnOn1.skip()
  Kasa.turnOn2.skip()
  // Kasa.turnOn3.skip()
}

// Ugliest ever
