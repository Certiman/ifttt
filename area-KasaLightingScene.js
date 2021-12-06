// Variables will need to be HH:MM strings for comparison
let hourSunrise = Weather.currentWeather[0].SunriseAt.substr(11,5)
let hourSunset = Weather.currentWeather[0].SunsetAt.substr(11,5)
let currentHour = Meta.currentUserTime.hour()+":"+Meta.currentUserTime.minute()

if (currentHour < hourSunset || currentHour > hourSunrise){
  Kasa.activateScene.skip() // Skip the scene when sun has risen and not set yet
  IfNotifications.sendRichNotification.setTitle("No lighting scene was activated")
  IfNotifications.sendRichNotification.setMessage("With sunrise at "+hourSunrise+" and sunset at "+hourSunset+", your arrival-triggered lighting scene was not activated at "+currentHour+"!")
}
