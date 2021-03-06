/*
*	Assumptions (based off recreating the map many times):
*	1. the grid is always 16 by 16
*	2. the tower is always 8 stories high and is not within 2 spots of any walls (on any side)
* 	3. any spots spawned with a block on the beginning will only be 1 story high
*	4. there are always enough blocks available to climb the tower
*
*	Optimization TODO:
	1. instead of going one way on wall, go random way (create array & generate random value)
	2. possibly mod so grid 16 by 16 instead of 32 by 32
	3. in edge cases, go back upstairs right away

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
visitedMap = new Array(32),		//our map for visited cells
curX = 16,						//starting location: (16, 16)
curY = 16,
prev = -1,						//for backtracking
towerX = -1,
towerY = -1;

//placing the stairs
var 
nextStair = 7;				
curLevel = 1;
minStair = 1;

//booleans
var 
firstTurn = true,
backtracked = false,
towerFound = false,
holdingBlock = false;


//direction representation
var 
LEFT = 0,
UP = 1,
RIGHT = 2,
DOWN = 3,
STUCK = 4,
curDir = -1;

//GOAL
var
FINDTOWER = 0,
DOWNSTAIRS = 1,
FINDBLOCK = 2,
BACKTRACK = 3,
UPSTAIRS = 4,
GRABTHEGOLD = 5,
goal = FINDTOWER;



// Replace this with your own wizardry
this.turn = function(cell){

	if (curDir == -2) {		//default error case: Would break here but don't know how in js, so I just keep throwing away the turn. Should never happen.
		console.log("Incorrect Direction Error");
		return "drop";	//throw away move
	}
	if (goal == FINDTOWER) {
		if (firstTurn == true) {		
			this.createMap();			//need to create visited map on first turn
			firstTurn = false;
			curDir = Math.random() * 4 >> 0;	//start in random direction
		}

		if (cell.left.type == GOLD || cell.right.type == GOLD || 	//located the tower
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
			goal = DOWNSTAIRS;	
		}

	}

	if (goal == DOWNSTAIRS) {	//need to get to stair 1
		return this.goDownStairs();
	}

	if (goal == FINDBLOCK) {	//check if we've found a square
		if (cell.type == BLOCK) {
			goal = BACKTRACK;
			holdingBlock = true;
			return "pickup";
		}
	}

	if (goal == BACKTRACK) {
		if (backtrackStack.length == 0) {	//means we are on stair 1 so break
			goal = UPSTAIRS;
		}
		else {							//go back to previous spot
			backtracked = true;
			prev = backtrackStack.pop();
			curDir = this.oppositeDir(prev);
			return this.move(curDir);
		}
	}

	if (goal == UPSTAIRS) {		//go up stairs and place block accordingly
		return this.goUpStairs(cell.level);
	}


	if (goal == GRABTHEGOLD) {		//on step 7
		console.log("Troll wins!");
		return "left";
	}




	visitedMap[curX][curY] = true;			//mark current spot as visited

	
	//find next valid direction
	curDir = this.checkDirRandom(cell, [LEFT, UP, RIGHT, DOWN]);


	if (curDir == STUCK) {			//we need to backtrack the previous way

		//NOTE: if stack is empty: can't backtrack, just hit all 4 directions
		prev = backtrackStack.pop();
		curDir = this.oppositeDir(prev);
		backtracked = true;
	}
	return this.move(curDir);

}

// More wizardry here



this.createMap = function() {		//2d 32 by 32 array
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
		backtrackStack.push(curDir);	//in case we need to backtrack (but don't add if we backtracked to get here)
	}
	else {	//don't want to push to stack here, just move to spot
		backtracked = false;
	}

	//update location and move troll
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
	//should never hit this
	if (direction == -1) {
		console.log("INVALID MOVE: -1");
		curDir = -2;
		return "drop";
	}
}




this.goodSpot = function(xPos, yPos, type) {		//checks if wall exists at spot or if we've visited it before
	if (xPos < 0 || xPos > 31 || yPos < 0 || 
		yPos > 31 || visitedMap[xPos][yPos] == true) {
		return false;
	}
	if (type == WALL) {
		return false;
	}
	return true;
}

this.checkDirRandom = function(cell, dirArray) {	//GOES IN DIFFERNT DIRECTION EVERY TIME (FINDS BLOCKS BETTER)
	if (dirArray.length == 0) {		//base case: all 4 directions invalid
		return STUCK;
	}

	var index = Math.random() * dirArray.length >> 0;	//generate random index
	var dir = dirArray.splice(index, 1)[0];			//retrive direction and remove it from array

	//check if direction is valid: if yes, troll will move that way
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

	return this.checkDirRandom(cell, dirArray);	//try again with last attempted direction removed


}


//////////*OLD TRAVERSAL METHOD: NO LONGER BEING USED*//////////////////
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
////////////////////////////////////////////////////////////////////



this.oppositeDir = function(dir) {	//get opposite direction (for backtracking)
	switch(dir){
		case LEFT :
			return RIGHT;
		case UP:
			return DOWN;
		case DOWN:
			return UP;
		case RIGHT: 
			return LEFT;
		default:  		//should never hit here
			console.log("Invalid direction: " + dir);
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
			
			//update location
			curX = towerX;
			curY = towerY + 1;

			if (holdingBlock == true) {		//edge case: prev stair already on right level so block not placed
				goal = UPSTAIRS;
				return "pickup";	//throw away the turn (already holding block)
			}

			goal = FINDBLOCK;
			//recreate visited grid and backtrack Array, not allowing visit of spots around towers
			this.createMap();

			backtrackStack = Array();

			//we can go either right or up from this spot (random between 1 or 2)
			curDir = (Math.random() * 2 >> 0) + 1;
			return this.move(curDir);
		default:
			console.log("Not on stairs: shouldn't happen");
			return this.move(-1);
	}
}

this.goUpStairs = function(level) {
	var curStair = this.getStair();

	//check if this is the stair we are looking for
	if (curStair == nextStair) {	

		var tempLevel = curLevel;	//save this value in case it gets changed
		nextStair = curStair - 1;	//next location to create stair

		if (nextStair == minStair - 1) {	//time to move onto next level
			nextStair = 7;
			curLevel += 1;	
			minStair += 1;	//one less stair needs to be created on this level
		}

		if (curLevel == 8)	{	//all done!
			goal = GRABTHEGOLD;
		}
		else {
			goal = DOWNSTAIRS;	//next move is to go down stairs again
		}

		//check if level already exists (would only happen with level 1)
		if (level == tempLevel) {
			return "pickup";	//just waste the turn (impossible to pick up)
		}
		else {
			holdingBlock = false;
			return "drop";
		}
	}

	//not on desired stair: we need to go up 
	switch(curStair){
		case 1:
			return this.move(LEFT);
		case 2:
			return this.move(DOWN);
		case 3:
			return this.move(DOWN);
		case 4: 
			return this.move(RIGHT);
		case 5:
			return this.move(RIGHT);
		case 6:
			return this.move(UP);
		//if we were on stair 7, we would have already returned
		default: 					//we should never hit this 
			console.log("Can't ascend any more");
			return this.move(-1);
	}
}
 
}








