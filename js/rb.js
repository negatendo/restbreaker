
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

//ux tracking thingies
rbGlobals.isPaused = false;

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

	//returns status
	getStatus: function(theStatus)
	{
		return rbGlobals.currentStatus;
	},

	//updates the display with whatever is going on!
	refresh: function() {
		//first check to see if we are paused
		if (!rbGlobals.isPaused)
		{
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
			
			//update the time until next update
			rbGlobals.timeSinceLastClockUpdate = rbGlobals.timeSinceLastClockUpdate + 1;
		} else {
			//we will want to increase the time until the next event for each minute its paused
			rbGlobals.nextEventTime = rbGlobals.nextEventTime + 1;
		}
		
		//update script uptime (regardless of pausing)
		rbGlobals.scriptUptime = rbGlobals.scriptUptime + 1;
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
			rb.setStatus('resting');
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
			rb.setStatus('working');
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

		//update the displays
		$('#status').html('Currently ' + rb.getStatus());
		$('#clock').html(rb.getMinutesUntilNextEvent(currentTime,rbGlobals.nextEventTime) + ' minutes left.');
		document.title = rb.getStatus() + ' - ' + rb.getMinutesUntilNextEvent(currentTime,rbGlobals.nextEventTime) + ' minutes left.'
	},

	//pauses/resume timers
	doPauseResume: function()
	{
		if (rbGlobals.isPaused)
		{
			console.log('Resuming');
			rbGlobals.isPaused = false;
			$('#substatus').html('Running');
			$('#pausebutton').html('Pause');
		} else {
			console.log('Pausing');
			rbGlobals.isPaused = true;
			$('#substatus').html('Paused');
			$('#pausebutton').html('Resume');
		}

		//call an immediate refresh
		rb.refresh();

		return true;
	},

	//forces a rest or work session switch
	doRestWorkNow: function()
	{
		//make time until next event equal now plus a bit more
		rbGlobals.nextEventTime = rb.getClock() + 1;
		//switch our status
		switch (rbGlobals.currentStatus) {
			case 'working':
				console.log('Forcing rest');
				rb.refreshWorking();
				$('#forcebutton').html('Work Now');
				break;
			case 'resting':
				console.log('Forcing work');
				rb.refreshResting();
				$('#forcebutton').html('Rest Now');
				break;
		}

		//force unpause if applicable
		if (rbGlobals.isPaused)
		{
			rbGlobals.isPaused = false;
			rb.doPauseResume();
		}

		//call an immediate refresh and display update
		rb.refresh();
		rb.clockDisplayUpdate();
		
		return true;
	}
}; //end of rb object

//start our engines
$( document ).ready(function() {
	console.log('Getting ready...');

	//initally of course we will be working, so set that status as well as the first break time
	rb.setStatus('working');

	//start the program by calling refresh every second
	var refreshInterval = setInterval(function(){rb.refresh()},1000);

	//inital refresh and display update
	rb.refresh();
	rb.clockDisplayUpdate();

	console.log('Ready!');
});


