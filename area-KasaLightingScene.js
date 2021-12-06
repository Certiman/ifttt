// FAILS - Variables will need to be HH:MM strings for comparison
// Variables will need to be Moment objects for comparison
let timeSunrise = moment(new Date(Weather.currentWeather[0].SunriseAt))
let timeSunset = moment(new Date(Weather.currentWeather[0].SunsetAt))
let currentTime = Meta.currentUserTime

let sunIsStillShining = ( 
  currentTime.isBefore(timeSunset) && currentTime.isAfter(timeSunrise)
)

if (sunIsStillShining){
  Kasa.activateScene.skip() // Skip the scene when sun has risen and not set yet
  IfNotifications.sendRichNotification.setTitle("No lighting scene was activated")
  IfNotifications.sendRichNotification.setMessage("With sunrise at "+hourSunrise+" and sunset at "+hourSunset+", your arrival-triggered lighting scene was not activated at "+currentHour+"!")
}
