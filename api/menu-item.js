const express = require('express');
const menuItemRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemRouter.get('/', (req, res, next) => {
	sql = 'SELECT * FROM Menu WHERE MenuItem.menu_id = $menu_id';
	values = {$menu_id: req.params.menuId};

	db.all(sql, values, function(error, menuItems){
		if(error){
			next(error);
		} else{
			res.status(200).json({menuItems: menuItems});
		}
	});
});

menuItemRouter.post('/', (req, res, next) => {
	const name = req.body.menuItems.name,
		  description = req.body.menuItems.description,
		  inventory = req.body.menuItems.inventory,
		  price = req.body.menuItems.price,
		  menuId = req.body.menu_id;
	const menuSql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
	const menuValues = {$menuId: menuId};
		  db.get(menuSql, menuValues, (error, menu) =>{
		  	if(error){
		  		next(error);
		  	} else if(!name || !description || !inventory || !price){
		  		res.status(400).send();
		  	} else {
		  		const sql = 'INSERT INTO MenuItem(name, description, inventory, price) VALUES($name, $description, $inventory, $price)';
		  		const values = {
		  			$name: name,
		  			$description: description,
		  			$inventory: inventory,
		  			$price: price
		  		};
		  		db.run(sql, values, function(error){
		  			if(error){
		  				next(error);
		  			} else{
		  				db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastId}`, (error, menuItem) =>{
		  					res.status(201).json({menuItem: menuItem});
		  				});
		  			}
		  		});
		  	}
		  });


});

menuItemRouter.put('/:menuItemId', (req, res, next) => {
	const name = req.body.menuItem.name,
		  description = req.body.menuItem.description,
		  inventory = req.body.menuItem.inventory,
		  price = req.body.menuItem.price,
		  menuId = req.body.menuItem.menu_id;
	const menuSql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
	const menuValues = {$menuId: menuId};
	db.get(menuSql, menuValues, (error, menu) => {
		if(error){
			next(error);
		} else if(!name || !description || !inventory || !price) {
			res.status(400).send();
		} else {
			const sql = 'UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price WHERE MenuItem.id = $menuItemId';
			const values = {$name: name, $description: description, $inventory: inventory, $price: price, $menuItemId: req.params.menuItemId};
			db.run(sql, values, function(error){
				if(error){
					next(error);
				} else{
					db.get(`SELECT * FROM MenuItem WHERE Menu.id = ${req.params.menuItemId}`, (error, menuItem) =>{
						res.status(200).json({menuItem: menuItem});
					});
				}
			});
		}
	});
});

menuItemRouter.delete('/:menuItemId', (req, res, next) => {
	const menuId = req.body.menuItem.menu_id;
	const menuSql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
	const menuValues = {$menuId: menuId};

	db.get(menuSql, menuValues, (error, menu) => {
		if(error){
			next(error);
		} else{
			const sql = 'DELETE FROM MenuItem WHERE MenuItem.id = $menuItemId';
			const values = {menuItemId: req.params.menuItemId};
			db.run(sql, values, (error) => {
				if(error){
					next(error);
				} else {
					res.status(204).send();
				}
			});
		}
	});

});

module.exports = menuItemRouter;