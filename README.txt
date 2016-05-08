Sohan Shah
Graphiq Coding Challenge


Basic Strategy: 
In order to solve this problem, I needed to create a 7-level staircase so the troll could get onto the 8-level tower. In order to access level n, the troll needs to have access to an adjacent block of level n - 1 (where n > 0). Therefore he adds blocks from the spots closest to the tower outward ("stair 7" to "stair 1") 1 level at a time. For each new level, he adds a block to one less stair (level 2 just on "stair 7" to "stair 2"; level 3 just on "stair 7" to "stair 3" and so on....). Once he creates level 7 on stair 7, he can advance to the tower and grab the gold!



Assumptions Made (based off recreating the map many times):
	1. the grid is always 16 by 16
	2. the tower is always 8 stories high and isn't within 2 spots of any walls (on any side)
	3. any spots spawned with a block on the beginning will only be 1 story high
	4. there are always enough blocks available to climb the tower


Project Solving Steps:
	1. Search for the location of the tower
		a. create a map of the grid to mark visited spots
		b. create backtracking stack to mark potential moves
		c. move in random directions (avoid walls and visited spots) until we find tower
			-if all 4 directions unavailable, backtrack to previous spot and try from there

	2. When we find tower, save its location. Reset the visited grid but mark the tower and the spots around it where we want to place stairs as visited. 

	3. Loop until we finish making the stairs:
		a. Figure out next stair we need to add to and what level we think we're adding.
		b. Go down stairs. Clear backtracking stack.
		c. Traverse map until we find an unused block. This uses the same strategy as 1c, moving in random directions and using the "visited" map and backtracking stack.
		d. Once we pick up a block, backtrack until backtrack stack is empty. We should end up at stair 1.
		e. Climb up stairs and drop block on correct level.

	4. Once stair 7 is created, climb onto tower and grab gold!


Edge Case Solutions:
	1. Backtrack when stuck: If all 4 directions from a specific cell lead to a wall or "visited" cell, we pop from the "backtrack" stack. We go in the direction opposite of what was popped so we end up on the cell from the previous turn. We run the same process from this cell.

	2. Cell is already desired level (only occurs for level 1): Since the spots I denote as "stairs" are hardcoded based on location relative to the tower, it is possible that they already have a level 1 block on them. If we arrive on a stair and it is already the desired level, we just update the desired stair location to the one below it and throw away this turn. We go down the stairs and immediately come back up as we are still holding a block. We are now trying to place the block on the previous stair.


One Direction vs Random Direction:

	There are two locations where we are somewhat "blindly" moving our troll: when we are looking for the tower, and when we are searching for a block. 

	At first I was doing this "search" process by moving the cell continously in one direction until there was an obstruction in the way, then exploring other directions sequentially (ie: if left is no good, always check up next). This method seemed slow because when searching for blocks, the troll would take the same exact path every time even though there were much closer blocks available than the one the troll eventually found.

	Therefore I tried out different logic where I would pick the next direction randomly every time I was on a new cell. For both methods, if all directions were invalid from a cell, I would backtrack.

	I implemented each of these methods and tried them on 100 runs to compare performance:

	SINGLE DIRECTION to find tower, RANDOM for blocks: 
	Average for 100 runs: 1337 turns, 6ms

	SINGLE DIRECTION FOR BOTH:
	Average for 100 runs: 2759 turns, 6ms

	RANDOM for both:
	Average for 100 runs: 1343 turns, 5ms 

	This shows that using the "random" logic helps for locating blocks and doesn't seem to make a difference in finding the tower. I just ended up using the "random" logic for both parts, as it led to the code being cleaner to follow and didn't lead to any noticeable dropoff in performance.

Possible Optimizations (and why I didn't implement them):
	
	1. I'm making a 32 by 32 "visited" grid right now, even though the provided grid is only 16 by 16. I did this because we don't actually know where we are on the grid and don't want to end up at a spot >0 or <15 if we start out too far in one direction. The 32 by 32 grid works because if we start at (16,16) we don't run into any spots that are outside the map. A possible optimization would be to figure out how to do this project with a smaller "visited" map, but 32 by 32 isn't exactly pushing memory limits and space complexity isn't the biggest part of this project, so I felt code readability and simpilicity trumps the smaller space complexity in this case.

	2. Right now in the edge case where a cell is already the desired level while we are trying to drop a block on it (edge case number 2 above), I go all the way down the stairs and back up to put it on the next spot. Previously I had it so it would drop the block on the next desired step on the way down, but it made the code a lot less readable.
	Since this only happens on level 1 (and even then, the chances of it happening on a lot of stairs are very slim), I decided to take it out for code readability/simplicity. Implementing it would only save around 40 turns max (and an average of closer to 10) which isn't too many turns in the big scheme of things.


