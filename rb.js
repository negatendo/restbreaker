
//these will probably be user configurable things
var userWorkSessionLength = 5; //minutes
var userRestBreakLength = 5; //minutes

//I like to use a global object to contain and manage all global variables
var myGlobals = {};

//turn all of the above values into seconds
myGlobals.workSessionLength = userWorkSessionLength * 60;
myGlobals.restBreakLength = userRestBreakLength * 60;

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
	//show the appropriate output based on the current stauts
	switch (myGlobals.currentStatus) {
		case 'working':
			refreshWorking();
			break;
		case 'resting':
			refreshResting();
			break;
	}
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
	console.log("Current time: " + makeHumanReadable(currentTime));

	//show break time
	console.log("Break will be at: " + makeHumanReadable(myGlobals.nextEventTime));

	//get the minutes remaining until the break
	var minutesUntilBreak = getMinutesUntilNextEvent(currentTime,myGlobals.nextEventTime);
	console.log("Minutes left until break: " + minutesUntilBreak)

	//a line for readability sake
	console.log('-------------------------------------------------');

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
	console.log("Current time: " + makeHumanReadable(currentTime));

	//show work time
	console.log("Work will begin at: " + makeHumanReadable(myGlobals.nextEventTime));

	//get the minutes remaining until work begins
	var minutesUntilWork = getMinutesUntilNextEvent(currentTime,myGlobals.nextEventTime);
	console.log("Minutes left until work begins: " + minutesUntilWork)

	//a line for readability sake
	console.log('-------------------------------------------------');

	//if it's time to get back to work say so and then change our current status
	if (minutesUntilWork <= 0) {
		console.log('BACK TO WORK!');
		setStatus('working');
	}
}

