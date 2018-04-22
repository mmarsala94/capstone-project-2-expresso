const express = require('express');
const apiRouter = express.Router();
const employeeRouter = require('./employee.js');
const menuRouter = require('./menu.js');

apiRouter.use('/employee', employeeRouter);
apiRouter.use('/menu', menuRouter);

module.exports = apiRouter;
