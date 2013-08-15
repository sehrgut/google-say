var EventEmitter = require('events').EventEmitter;
var format = require('util').format;

/*
	## TODO
	* TaskMan#report
*/

function TaskMan(name) {
	this._name = name;
	this._activeTasks = 0;
	this._completedTasks = 0;
	this._tasks = {};
}

TaskMan.prototype = new EventEmitter();

TaskMan.prototype._end = function () {
	if (! this._activeTasks)
		this.emit('end', {
			name: this._name,
			completedTasks: this._completedTasks
		});
};

TaskMan.prototype.start = function (taskName) {
	this._activeTasks++;

	if (! (taskName in this._tasks))
		this._tasks[taskName] = 0;
	this._tasks[taskName]++;
	
	this.emit('start', { taskName: taskName });
};

TaskMan.prototype.stop = function (taskName) {
	if (taskName in this._tasks) {
		this._tasks[taskName]--;

		if (this._tasks[taskName] == 0)
			delete this._tasks[taskName];

		this._activeTasks--;
		this._completedTasks++;

		this.emit('stop', { taskName: taskName });
		
		this._end();
	} else {
		this.emit('error', {
			msg: "Cannot stop non-existent task.",
			data: { taskName: taskName }
		});
	}
};

module.exports = TaskMan;