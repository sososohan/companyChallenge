/*
*	Assumptions (based off recreating the map many times):
*	1. the grid is always 16 by 16
*	2. the tower is always 8 stories high and is not within 2 spots of any walls (on any side)
* 	3. any spots spawned with a block on the beginning will only be 1 story high
*	4. there are always enough blocks available to climb the tower
*/

//


function Stacker(){

var
EMPTY = 0,
WALL = 1,
BLOCK = 2,
GOLD = 3;

var 
backtrackStack=new Array(),		//used as stack (push/pop methods)
visitedMap = new Array(32),
curX = 16,
curY = 16,
prev = -1,
towerX = -1,
towerY = -1;



//booleans
var 
firstTurn = true,
backtracked = false,
towerFound = false;

//staircase booleans
var 
upStairs = false,
downStairs = false;

//direction representation
var 
LEFT = 0,
UP = 1,
RIGHT = 2,
DOWN = 3,
STUCK = 4,
curDir = -1;



// Replace this with your own wizardry
this.turn = function(cell){
	if (curDir == -2) {
		return "drop";
	}
	
	if (towerFound == false) {
		if (firstTurn == true) {
			this.createMap();			//need to create visited map
			firstTurn = false;
			curDir = Math.random() * 4 >> 0;
		}

		if (cell.left.type == GOLD || cell.right.type == GOLD || 
			cell.down.type == GOLD || cell.up.type == GOLD) {
			if (cell.left.type == GOLD) {
				towerX = curX - 1;
				towerY = curY;
			}
			else if (cell.down.type == GOLD) {
				towerX = curX;
				towerY = curY - 1;
			}
			else if (cell.right.type == GOLD) {
				towerX = curX + 1;
				towerY = curY;
			}
			else {	// tower is up
				towerX = curX;
				towerY = curY + 1;
			}
			towerFound = true;

			downStairs = true;	//we want to get back to first stair 
		}
		if (curDir == -1) {
			return "drop";
		}

		visitedMap[curX][curY] = true;
	}

	if (downStairs == true) {	//need to get to stair 1
		return this.goDownStairs();
	}

	//find a direction that works
	curDir = this.checkDir(cell, curDir, 0);

	if (curDir == STUCK) {			//we need to backtrack the previous way

		//NOTE: if stack is empty: can't backtrack, just hit all 4 directions
		prev = backtrackStack.pop();
		console.log("stuck: " + prev);
		curDir = this.oppositeDir(prev);
		backtracked = true;
	}
	// console.log("about to move: " + curDir);
	return this.move(curDir);

}

// More wizardry here



this.createMap = function() {
	for (var i = 0; i < 32; i++) {
		visitedMap[i] = new Array(32);
		for (var j = 0; j < 32; j++) {
	  		visitedMap[i][j] = false;
	  	}
	}
	if (towerFound == true) {	//map tower and spots around it (reserved for stairs) as visited
		visitedMap[towerX][towerY] = true;	//tower
		visitedMap[towerX][towerY + 1] = true; //stair 1
		visitedMap[towerX - 1][towerY + 1] = true; //stair 2...and so on below
		visitedMap[towerX - 1][towerY] = true;
		visitedMap[towerX - 1][towerY - 1] = true;
		visitedMap[towerX][towerY - 1] = true;
		visitedMap[towerX + 1][towerY - 1] = true;
		visitedMap[towerX + 1][towerY] = true;	//stair 7
	}
}





this.move = function(direction) {
	if (backtracked == false) {
		console.log("curX: " + curX + "curY: " + curY)
		backtrackStack.push(curDir);	//in case we need to backtrack (but don't add if we backtracked to get here)
	}
	else {	//no need to push to stack here
		backtracked = false;
	}


	if (direction == LEFT) {
		curX --;
		return "left";
	}
	else if (direction == UP) {
		curY ++;
		return "up";
	}
	if (direction == DOWN) {
		curY --;
		return "down";
	}
	if (direction == RIGHT) {
		curX ++;
		return "right";
	}

	if (direction == -1) {
		console.log("INVALID MOVE: -1");
		return "drop";
	}
}




this.goodSpot = function(xPos, yPos, type) {		//checks if wall exists at spot or if we've visited it before
	if (visitedMap[xPos][yPos] == true) {
		return false;
	}
	if (type == 1) {
		console.log("wall!");
		return false;
	}
	return true;
}




this.checkDir = function(cell, dir, attempt) {
	if (attempt == 4) {		//tried all 4 directions, need to backtrack
		return STUCK;
	}
	if (dir == LEFT) {
		if (this.goodSpot(curX - 1, curY, cell.left.type) == true) {
			return LEFT;
		}
	}
	if (dir == UP) {
		if (this.goodSpot(curX, curY + 1, cell.up.type) == true) {
			return UP;
		}
	}

	if (dir == DOWN) {
		if (this.goodSpot(curX, curY - 1, cell.down.type) == true) {
			return DOWN;
		}
	}
	if (dir == RIGHT) {
		if (this.goodSpot(curX + 1, curY, cell.right.type) == true) {
			return RIGHT;
		}
	}

	return this.checkDir(cell, (dir + 1) % 4, attempt + 1);
}




this.oppositeDir = function(dir) {
	switch(dir){
		case LEFT :
			return RIGHT;
		case UP:
			return DOWN;
		case DOWN:
			return UP;
		case RIGHT: 
			return LEFT;
		default:
			console.log("Invalid CURDIR: THIS SHOULDN'T HAPPEN): " + dir);
			return -1;
	}
}


this.getStair = function() {	//figure out which stair we're on or if we're not on one
	if (curX == towerX && curY == towerY + 1) {
		return 1;
	}
	else if (curX == towerX - 1 && curY == towerY + 1) {
		return 2;
	}
	else if (curX == towerX - 1 && curY == towerY) {
		return 3;
	}
	else if (curX == towerX - 1 && curY == towerY - 1) {
		return 4;
	}
	else if (curX == towerX && curY == towerY - 1) {
		return 5;
	}
	else if (curX == towerX + 1 && curY == towerY - 1) {
		return 6;
	}
	else if (curX == towerX + 1 && curY == towerY) {
		return 7;
	}
	else {	//not on stair
		return -1;
	}
}

this.goDownStairs = function() {
	switch(this.getStair()){
		case 7:
			return this.move(DOWN);
		case 6:
			return this.move(LEFT);
		case 5:
			return this.move(LEFT);
		case 4: 
			return this.move(UP);
		case 3:
			return this.move(UP);
		case 2:
			return this.move(RIGHT);
		case 1: 						//bottom of the stairs (our goal)
			downStairs = false;
			//recreate visited grid and backtrack Array, not allowing visit of spots around towers
			this.createMap();
			this.backtrackStack = Array();
			//we can go either right or up from this spot (random between 1 or 2)
			curDir = (Math.random() * 2 >> 0) + 1;
			return this.move(curDir);
		default:
			console.log("Not on stairs: shouldn't happen");
			return this.move(-1);
	}
}
 
}








