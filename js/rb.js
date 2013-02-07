
//these will probably be user configurable things
var userWorkSessionLength = 45; //minutes
var userRestBreakLength = 10; //minutes

//I like to use a global object to contain and manage all global variables
var myGlobals = {};

//turn all of the above values into seconds
myGlobals.workSessionLength = userWorkSessionLength * 60;
myGlobals.restBreakLength = userRestBreakLength * 60;

//statistics that we can use
myGlobals.scriptUptime = 0; //total seconds script has been running
myGlobals.timeSinceLastClockUpdate = 0; //elapsed time in seconds since the last clock display update
myGlobals.clockUpdateFrequency = 60; //seconds to pass between clock display updates

//initally of course we will be working, so set that status as well as the first break time
setStatus('working');

//start the program by calling refresh every second
var refreshInterval = setInterval(function(){refresh()},1000);

//sets our current status to the provided 'working,' 'resting,' or ...?
function setStatus(theStatus)
{
	myGlobals.currentStatus = theStatus;
	myGlobals.currentTime = getClock();
	switch (theStatus) {
		case 'working':
			console.log('Now working...');
			myGlobals.nextEventTime = getNextEventTime(myGlobals.currentTime,myGlobals.workSessionLength);
			break;
		case 'resting':
			console.log('Now resting...');
			myGlobals.nextEventTime = getNextEventTime(myGlobals.currentTime,myGlobals.restBreakLength);
			break;
	}
}

//updates the display with whatever is going on!
function refresh() {

	//run the appropriate calcluations based off current status
	switch (myGlobals.currentStatus) {
		case 'working':
			refreshWorking();
			break;
		case 'resting':
			refreshResting();
			break;
	}

	//update the clock display
	if (myGlobals.timeSinceLastClockUpdate >= myGlobals.clockUpdateFrequency)
		clockDisplayUpdate();

	//update statistics
	myGlobals.scriptUptime = myGlobals.scriptUptime + 1;
	myGlobals.timeSinceLastClockUpdate = myGlobals.timeSinceLastClockUpdate + 1;

}

//fetches the current time in seconds since unix epoch
function getClock() {
	return Math.round((new Date()).getTime() / 1000);
}

//takes a length of time in seconds and adds it to the provided time to return the next event time (seconds since unix epoch)
function getNextEventTime(currentTime,eventLength,inMinutes)
{
	return currentTime + eventLength;
}

//takes the current time, the next event time, and returns the minutes until then
function getMinutesUntilNextEvent(currentTime,eventTime)
{
	//todo - round seconds and show them appropriately
	return Math.round((eventTime - currentTime) / 60);
}

//converts unix epoch timestamp into the desired human readable time
function makeHumanReadable(unixTime) {
	//get min, hours and seconds from unixTime
	var date = new Date(unixTime * 1000);
	var hours = date.getHours().toString();
	var minutes = date.getMinutes().toString();
	var seconds = date.getSeconds().toString();

	//pad each variable with a 0 if needed
	if (hours.length == 1)
		hours = '0' + hours;
	if (minutes.length == 1)
		minutes = '0' + minutes;
	if (seconds.length == 1)
		seconds = '0' + seconds;

	//format and return
	var formattedTime = hours + ':' + minutes + ':' + seconds;
	return formattedTime;
}

//refresh the display when working
function refreshWorking() {
	//get the current time
	var currentTime = getClock();

	//get the minutes remaining until the break
	var minutesUntilBreak = getMinutesUntilNextEvent(currentTime,myGlobals.nextEventTime);

	//if it's break time, say so and then change our current status
	if (minutesUntilBreak <= 0) {
		console.log('BREAK TIME!');
		setStatus('resting');
	}
}

//refresh the display when resting
function refreshResting()
{
	//get the current time
	var currentTime = getClock();

	//get the minutes remaining until work begins
	var minutesUntilWork = getMinutesUntilNextEvent(currentTime,myGlobals.nextEventTime);

	//if it's time to get back to work say so and then change our current status
	if (minutesUntilWork <= 0) {
		console.log('BACK TO WORK!');
		setStatus('working');
	}
}

function clockDisplayUpdate()
{	
	//get the current time
	var currentTime = getClock();
	console.log('Time until next event: ' + getMinutesUntilNextEvent(currentTime,myGlobals.nextEventTime));

	//reset the display update timer
	myGlobals.timeSinceLastClockUpdate = 0;
}
