const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
//   const sql = 'SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId';
//   const values = {$timesheetId: timesheetId};
//   db.get(sql, values, (error, timesheet) => {
//     if (error) {
//       next(error);
//     } else if (timesheet) {
//       next();
//     } else {
//       res.sendStatus(404);
//     }
//   });
// });

timesheetsRouter.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM Timesheet WHERE Timesheet.employee_id = $employeeId';
  const values = { $employeeId: req.params.employeeId};
  db.all(sql, values, (error, timesheets) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({timesheets: timesheets});
    }
  });
});

timesheetsRouter.post('/', (req, res, next) =>{
	const hours = req.body.timesheet.hours,
  	    rate = req.body.timesheet.rate,
  	    date = req.body.timesheet.date,
  	    employee_id = req.body.timesheet.employee_id;
  const employeeSql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
  const employeeValues = {$employeeId: employee_id};
  db.get(employeeSql, employeeValues, (error, employee) => {
    if (error) {
      next(error);
    } else {

  if(!hours || !rate || !date || !employee){
  	res.status(400).send();
  }

	const sql = 'INSERT INTO Timesheet(hours, rate, date, employee_id) VALUES($hours, $rate, $date, $employee_id)';
	const values = {
		$hours: hours,
		$rates: rate,
		$date: date,
		$employee_id: employee_id
	}

	db.run(sql, values, function(error){
		if(error){
			next(error);
		} else{
			db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`, (error, timesheet) =>{
				res.status(201).json({timesheet: timesheet});
			});
		}
	});
}
});
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
	  const hours = req.body.timesheet.hours,
  	      rate = req.body.timesheet.rate,
  	      date = req.body.timesheet.date,
  	      employee_id = req.body.timesheet.employee_id;
    const employeeSql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
    const employeeValues = {$employeeId: employee_id};
	db.get(employeeSql, employeeValues, (error, employee) => {
	    if (error) {
	      next(error);
	    } else {
	    if(!hours || !rate || !date || !employee){
	  	res.status(400).send();
	  }
	}
 });
  const sql = 'UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employee_id WHERE Timesheet.id = $timesheetId';
  const values = {
    $hours: hours,
    $rate: rate,
    $date: date,
    $employee_id: employee_id,
    $timesheetId: req.params.timesheetId
  };

  db.run(sql, values, function(error){
    if(error){
      next(error);
    } else{
      db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`, (error, timesheet) =>{
        res.status(200).json({timesheet: timesheet});
      });
    }
  });

});

timesheetsRouter.delete(':/timesheetId', (req, res, next) => {
    const sql = 'DELETE FROM Timesheet WHERE Timesheet.id = $timesheetId';
    const values = {$timesheetId: req.params.timesheetId};

    db.run(sql, values, function(error){
      if(error){
        next(error);
      } else{
        res.status(204).send();
      }
    });
});

module.exports = timesheetsRouter;