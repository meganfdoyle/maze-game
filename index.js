/*
Matter JS Terminology
  - World: object that contains all the different 'things' in the matter app
  - Engine: reads in the current state of the world from the world object
     then calculates changes in positions of all different shapes
  - Render: looks at all the different shapes and shows them on the screen when
     the engine processes an update
  - Runner: gets the engine and world to work together
    - Runs ~60 times per second
  - Body: a shape we are displaying
*/

const {Engine, Render, Runner, World, Bodies, Body} = Matter;

const cells = 10;
const width = 600;
const height = 600;

const unitLength = width / cells;

const engine = Engine.create();
engine.world.gravity.y = 0;
const {world} = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        //renders outline rather than solid shape
        wireframes: true,
        width,
        height
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
    //0px down (top of canvas)
    Bodies.rectangle(width / 2, 0, width, 2, {isStatic: true}),
    //{height}px down (bottom of canvas)
    Bodies.rectangle(width / 2, height, width, 2, {isStatic: true}),
    //{width}px to the right (right side of canvas)
    Bodies.rectangle(width, height / 2, 2, height, {isStatic: true}),
    //0px to the right (left side of canvas)
    Bodies.rectangle(0, height / 2, 2, height, {isStatic: true})
];
World.add(world, walls);

// Maze Generation

const shuffle = (arr) => {
    let counter = arr.length;

    while (counter > 0) {
        const index = Math.floor(Math.random() * counter);

        counter--;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }
    return arr;
};

//if we did fill([false, false, false], all three would have the same reference point
//i.e., if we updated one, they would all be updated; thus, map is required
const grid = Array(cells)
    .fill(null)
    .map(() => Array(cells).fill(false));

// for (let i = 0; i < 3; i++) {
//     grid.push([]);
//     for (let j = 0; j < 3; j++) {
//         grid[i].push(false);
//     };
// };

const verticals = Array(cells)
    .fill(null)
    .map(() => Array(cells - 1).fill(false));

const horizontals = Array(cells - 1)
    .fill(null)
    .map(() => Array(cells).fill(false));

const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

const stepThroughCell = (row, column) => {
    //if we've visited the cell already, then return
    if (grid[row][column]) {
        return;
    };

    //marks the cell as being visited
    grid[row][column] = true;

    //randomizes next potential cell selection
    const neighbors = shuffle([
        [row - 1, column, 'up'],
        [row + 1, column, 'down'],
        [row, column + 1, 'right'],
        [row, column - 1, 'left']

    ]);
    
    for (let neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor;

        //if the cell doesn't exist
        if (nextRow < 0 || nextRow >= cells || nextColumn < 0 || nextColumn >= cells) {
            //move on to the next neighbor
            continue;
        };

        //if a cell has already been visited, move to the next neighbor
        if (grid[nextRow][nextColumn]) {
            continue;
        };

        if (direction === 'left') {
            verticals[row][column - 1] = true;
        } else if (direction === 'right') {
            verticals[row][column] = true;
        } else if (direction === 'up') {
            horizontals[row - 1][column] = true;
        } else if (direction === 'down') {
            horizontals[row][column] = true;
        }

        stepThroughCell(nextColumn, nextRow)
    };
};

stepThroughCell(startRow, startColumn);

horizontals.forEach ((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLength + unitLength / 2,
            rowIndex * unitLength + unitLength,
            unitLength,
            10,
            {
                isStatic: true
            }
        );
        World.add(world, wall)
    });
});

verticals.forEach ((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLength + unitLength,
            rowIndex * unitLength + unitLength / 2,
            10,
            unitLength,
            {
                isStatic: true
            }
        );
        World.add(world, wall)
    });
});



// Goal
const goal = Bodies.rectangle(
    width - (unitLength / 2), 
    height - (unitLength / 2), 
    unitLength * 0.7,
    unitLength * 0.7, 
    { 
    isStatic: true
    }
);

World.add(world, goal);

// Ball
const ball = Bodies.circle(
    unitLength / 2, 
    unitLength / 2,
    //radius 
    unitLength / 4,

);

World.add(world, ball);

document.addEventListener('keydown', event => {
    const {x, y} = ball.velocity;

    if (event.key === 'w' || event.key ==='ArrowUp') {
        Body.setVelocity(ball, {x, y: y - 5}) 
    }

    if (event.key === 's' || event.key ==='ArrowDown') {
        Body.setVelocity(ball, {x, y: y + 5}) 
     }

     if (event.key === 'a' || event.key ==='ArrowLeft') {
        Body.setVelocity(ball, {x: x - 5, y})  
     }

     if (event.key === 'd' || event.key ==='ArrowRight') {
        Body.setVelocity(ball, {x: x + 5, y})  
     }
});