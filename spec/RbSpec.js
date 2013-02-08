describe ("rb.js", function () {
	//setup
	describe("general setup", function() {
		//check for existance of rbGlobals object
		it("rbGlobals exists", function() {
			expect(rbGlobals).toEqual(jasmine.any(Object));
		});

		it("default work session length should be number", function() {
			expect(rbGlobals.workSessionLength).toEqual(jasmine.any(Number));
		});

		it("default break session length should be number", function() {
			expect(rbGlobals.restBreakLength).toEqual(jasmine.any(Number));
		});

		it("script uptime should be a number", function() {
			expect(rbGlobals.scriptUptime).toEqual(jasmine.any(Number));
		});

		it("script uptime should not yet be counting", function () {
			var current_uptime = rbGlobals.scriptUptime;
			expect(current_uptime).toEqual(0);
		});

		it("time since last update should be zero", function () {
			expect(rbGlobals.timeSinceLastClockUpdate).toEqual(0);
		});

		it("update frequency should be 60 seconds", function () {
			expect(rbGlobals.clockUpdateFrequency).toEqual(60);
		});
	});

	//test getNextEventTime()
	describe("getNextEventTime()", function () {
		it("getNextEventTime() should return 200", function () {
			expect(rb.getNextEventTime(100,100)).toEqual(200);
		});
	});

	//test getClock()
	describe("getClock()", function () {
		it("getClock() should return number", function () {
			expect(rb.getClock()).toEqual(jasmine.any(Number));
		});
	});

	//test getMinutesUntilNextEvent()
	describe("getMinutesUntilNextEvent()", function () {
		it("getMinutesUntilNextEvent() should return 0 when given same timestamps", function () {
			expect(rb.getMinutesUntilNextEvent(1000,1000)).toEqual(0);
		});
	});

	//test makeHumanReadable()
	describe("makeHumanReadable()", function () {
		var now = rb.getClock();
		var pattern = /[0-9][0-9]:[0-9][0-9]:[0-9][0-9]/;
		it("makeHumanReadable() should return valid 00:00:00 formatted time", function () {
			expect(rb.makeHumanReadable(now)).toMatch(pattern);
		});
	});

	//test refreshWorking()
	describe ("refreshWorking()", function () {

		beforeEach(function() {
			//set the next event time to 0 for testing
			rbGlobals.nextEventTime = 0;
		});

		it("given no time left in event refreshWorking() changes to resting", function () {
			rb.refreshWorking();
			expect(rbGlobals.currentStatus).toEqual('resting');
		});

	});

	//test refreshResting()
	describe ("refreshResting()", function () {

		beforeEach(function() {
			//set the next event time to 0 for testing
			rbGlobals.nextEventTime = 0;
		});

		it("given no time left in event refreshResting() changes to working", function () {
			rb.refreshResting();
			expect(rbGlobals.currentStatus).toEqual('working');
		});

	});

	//test clockDisplayUpdate()
	describe ("clockDisplayUpdate()", function () {

		it("clockDisplayUpdate() changes timeSinceLastClockUpdate to 0", function () {
			rb.clockDisplayUpdate()
			expect(rbGlobals.timeSinceLastClockUpdate).toEqual(0);
		});

	});

	//test setStatus()
	describe("setStatus()", function() {
		//set our globals to something easy to test with between each test
		beforeEach(function() {
			rbGlobals.currentTime = 100;
			rbGlobals.workSessionLength = 100;
			rbGlobals.restBreakLength = 100;
		});

	 	//switch to an invalid status
	 	it('setStatus given invalid status returns false', function () {
	 		expect(rb.setStatus(false)).toEqual(false);
	 	});

	 	//setStatus to working updates rbGlobals.nextEventTime properly
	 	it('setStatus to working updates nextEventTime', function () {
			rb.setStatus('working');
			expect(rbGlobals.nextEventTime)		
	 	});
	});

	//test refresh()
	describe("refresh()", function() {

	  it("expect refreshWorking to be called if working", function() {
	  	spyOn(rb, 'refreshWorking');
	  	rbGlobals.currentStatus = 'working';
	  	rb.refresh();
	    expect(rb.refreshWorking).toHaveBeenCalled();
	  });

	  it("expect refreshResting to be called if working", function() {
	  	spyOn(rb, 'refreshResting');
	  	rbGlobals.currentStatus = 'resting';
	  	rb.refresh();
	    expect(rb.refreshResting).toHaveBeenCalled();
	  });

	  it("expect clockDisplayUpdate to be called when  it's time", function() {
	  	rbGlobals.timeSinceLastClockUpdate = 1;
	  	rbGlobals.clockUpdateFrequency = 0;
	  	spyOn(rb, 'clockDisplayUpdate');
	  	rbGlobals.currentStatus = 'working';
	  	rb.refresh();
	    expect(rb.clockDisplayUpdate).toHaveBeenCalled();
	  });

	  it("scriptUptime should increase after call", function () {
	  	var current_uptime = rbGlobals.scriptUptime;
	  	rb.refresh();
	  	var new_uptime = rbGlobals.scriptUptime;
	  	expect(new_uptime).toEqual(current_uptime + 1);
	  });

	  it("timeSinceLastClockUpdate should increase after call", function () {
	  	rbGlobals.timeSinceLastClockUpdate = 1;
	  	rbGlobals.clockUpdateFrequency = 5;
	  	var current_clocktime = rbGlobals.timeSinceLastClockUpdate;
	  	rb.refresh();
	  	var new_clocktime = rbGlobals.timeSinceLastClockUpdate;
	  	expect(new_clocktime).toEqual(current_clocktime + 1);
	  });

	});
});