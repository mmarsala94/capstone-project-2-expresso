const express = require('express');
const employeeRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const timesheetsRouter = require('./timesheets.js');

employeeRouter.use('/:employeeId/timesheets', timesheetsRouter);

employeeRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Employee WHERE Employee.is_current_employee = 1',
    (err, employees) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({employees: employees});
      }
    });
});

employeeRouter.post('/', (req, res, next) => {
	const name = req.body.name,
		  position = req.body.position,
		  wage = req.body.wage,
		  is_current_employee = req.body.is_current_employee === 0 ? 0 : 1;
	if(!name || !position || !wage){
		res.status(404).send();
	}
	const sql = 'INSERT INTO Employee(name, position, wage, is_current_employee) VALUES($name, $position, $wage, $is_current_employee)';
	const values = {
		$name: name,
		$position: position,
		$wage: wage,
		$is_current_employee: is_current_employee 
	}
	db.run(sql, values, function(error){
		if(error){
			next(error);
		} else{
			db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`, (error, employee) => {
				res.status(201).json({employee: employee});
			});
		}
	});

});

employeeRouter.param('employeeId', (req, res, next, employeeId) => {
  const sql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
  const values = {$employeeId: employeeId};
  db.get(sql, values, (error, employee) => {
    if (error) {
      next(error);
    } else if (employee) {
      req.employee = employee;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

employeeRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).json({employee: req.employee});
});

employeeRouter.put('/:employeeId', (req, res, next) => {
	const name = req.body.name,
		  position = req.body.position,
		  wage = req.body.wage,
		  is_current_employee = req.body.is_current_employee === 0 ? 0 : 1;
	if(!name || !position || !wage){
		res.status(400).send();
	}

	const sql = 'UPDATE Employee SET name = $name, position = $position, ' +
      'wage = $wage, is_current_employee = $is_current_employee ' +
      'WHERE Employee.id = $employeeId';
	const values = {
		$name: name,
		$position: position,
		$wage: wage,
		$is_current_employee: is_current_employee,
		$employeeId: req.params.employeeId
	};
	db.run(sql, values, function(error){
		if(error){
			next(error);
		} else{
			db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`, (error, employee) => {
				res.status(200).json({employee: employee});
		});
	}
  });
});

employeeRouter.delete('/:employeeId', (req, res, next) => {
	const is_current_employee = 0;
	const sql = 'UPDATE Employee SET is_current_employee = 0 WHERE Employee.id = $employeeId';
	const values = {
		$employeeId: req.params.employeeId
	};
	db.run(sql, values, function(error){
		if(error){
			next(error);
		} else {
      db.get(`SELECT * FROM Artist WHERE Employee.id = ${req.params.employeeId}`,
        (error, employee) => {
          res.status(200).json({employee: employee});
        });
    }
	});
});


module.exports = employeeRouter;