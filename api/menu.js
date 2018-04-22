const express = require('express');
const menuRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItemRouter = require('./menu-item.js');

menuRouter.use('/:menuId/menu-items', menuItemRouter);

menuRouter.get('/', (req, res, next) => {
	const sql = 'SELECT * FROM Menu';
	db.all(sql, (error, menus) =>{
		if(error){
			next(error);
		} else{
			res.status(200).json({menus: menus});
		}
	});
});

menuRouter.post('/', (req, res, next) => {
	const title = req.body.menu.title;
	if(!title){
		res.status(400).send();
	}

	const sql = 'INSERT INTO Menu(title) VALUES($title)';
	const values = {
		$title: title
	};
	db.run(sql, values, function(error){
		if(error){
			next(error);
		} else{
			db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastId}`, (error, menu) =>{
				res.status(201).json({menu: menu});
			});
		}
	});
});


menuRouter.param('menuId', (req, res, next, menuId) => {
  const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
  const values = {$menuId: menuId};
  db.get(sql, values, (error, menu) => {
    if (error) {
      next(error);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menuRouter.get('/:menuId', (req, res, next) => {
	res.send(200).json({menu: req.menu});
});

menuRouter.put('/:menuId', (req, res, next) => {
	const title = req.body.title;
	if(!title){
		res.status(400).send();
	}

	const sql = 'UPDATE Menu SET title = $title WHERE Menu.id = $menuId';

	const values = {
		$title: title,
		$menuId: req.params.menuId
	};

	db.run(sql, values, function(error){
		if(error){
			res.status(404).send();
		} else{
			db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`, (error, menu) => {
				res.status(200).json({menu: menu});
			});
		}
	});
});

menuRouter.delete('/:menuId', (req, res, next) => {

  const menuItemSql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId';
  const menuItemValues = {$menuId: req.params.menuId};
  db.get(menuItemSql, menuItemValues, (error, menuItem) => {
    if (error) {
      next(error);
    } else if (menuItem) {
      res.sendStatus(400);
    } else {
	  const sql = 'DELETE FROM Menu WHERE Menu.id = $menuId';
      const values = {$menuId: req.params.menuId};

      db.run(sql, values, function(error){
      	if(error){
      		next(error);
      	} else{
      		res.status(204).send();
      	}
      });
    }
  });
});

module.exports = menuRouter;