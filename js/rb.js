
//these will probably be user configurable things
var userWorkSessionLength = 45; //minutes
var userRestBreakLength = 10; //minutes

//I like to use a global object to contain and manage all global variables
var rbGlobals = {};

//turn all of the above values into seconds
rbGlobals.workSessionLength = userWorkSessionLength * 60;
rbGlobals.restBreakLength = userRestBreakLength * 60;

//statistics that we can use
rbGlobals.scriptUptime = 0; //total seconds script has been running
rbGlobals.timeSinceLastClockUpdate = 0; //elapsed time in seconds since the last clock display update
rbGlobals.clockUpdateFrequency = 60; //seconds to pass between clock display updates

//rb object that wraps all functions
var rb;
rb = {
	//sets our current status to the provided 'working,' 'resting,' or ...?
	setStatus: function(theStatus)
	{
		rbGlobals.currentStatus = theStatus;
		rbGlobals.currentTime = rb.getClock();
		switch (theStatus) {
			case 'working':
				console.log('Now working...');
				rbGlobals.nextEventTime = rb.getNextEventTime(rbGlobals.currentTime,rbGlobals.workSessionLength);
				break;
			case 'resting':
				console.log('Now resting...');
				rbGlobals.nextEventTime = rb.getNextEventTime(rbGlobals.currentTime,rbGlobals.restBreakLength);
				break;
			default:
				return false;
		}
		return;
	},

	//updates the display with whatever is going on!
	refresh: function() {

		//run the appropriate calcluations based off current status
		switch (rbGlobals.currentStatus) {
			case 'working':
				rb.refreshWorking();
				break;
			case 'resting':
				rb.refreshResting();
				break;
		}

		//update the clock display
		if (rbGlobals.timeSinceLastClockUpdate >= rbGlobals.clockUpdateFrequency)
			rb.clockDisplayUpdate();

		//update statistics
		rbGlobals.scriptUptime = rbGlobals.scriptUptime + 1;
		rbGlobals.timeSinceLastClockUpdate = rbGlobals.timeSinceLastClockUpdate + 1;

	},

	//fetches the current time in seconds since unix epoch
	getClock: function() {
		return Math.round((new Date()).getTime() / 1000);
	},

	//takes a length of time in seconds and adds it to the provided time to return the next event time (seconds since unix epoch)
	getNextEventTime: function(currentTime,eventLength)
	{
		return currentTime + eventLength;
	},

	//takes the current time, the next event time, and returns the minutes until then
	getMinutesUntilNextEvent: function(currentTime,eventTime)
	{
		//todo - round seconds and show them appropriately
		return Math.round((eventTime - currentTime) / 60);
	},

	//converts unix epoch timestamp into the desired human readable time
	makeHumanReadable: function(unixTime) {
		//get min, hours and seconds from unixTime
		var date = new Date(unixTime * 1000);
		var hours = date.getHours().toString();
		var minutes = date.getMinutes().toString();
		var seconds = date.getSeconds().toString();

		console.log(hours);

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
	},

	//refresh the display when working
	refreshWorking: function() {
		//get the current time
		var currentTime = rb.getClock();

		//get the minutes remaining until the break
		var minutesUntilBreak = rb.getMinutesUntilNextEvent(currentTime,rbGlobals.nextEventTime);

		//if it's break time, say so and then change our current status
		if (minutesUntilBreak <= 0) {
			console.log('BREAK TIME!');
			setStatus('resting');
		}
	},

	//refresh the display when resting
	refreshResting: function()
	{
		//get the current time
		var currentTime = rb.getClock();

		//get the minutes remaining until work begins
		var minutesUntilWork = rb.getMinutesUntilNextEvent(currentTime,rbGlobals.nextEventTime);

		//if it's time to get back to work say so and then change our current status
		if (minutesUntilWork <= 0) {
			console.log('BACK TO WORK!');
			setStatus('working');
		}
	},

	//eventually this will update the vector clock perhaps....
	clockDisplayUpdate: function()
	{	
		//get the current time
		var currentTime = rb.getClock();
		console.log('Time until next event: ' + rb.getMinutesUntilNextEvent(currentTime,rbGlobals.nextEventTime));

		//reset the display update timer
		rbGlobals.timeSinceLastClockUpdate = 0;
	},

}; //end of rb object

//initally of course we will be working, so set that status as well as the first break time
rb.setStatus('working');

//start the program by calling refresh every second
var refreshInterval = setInterval(function(){rb.refresh()},1000);