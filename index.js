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

const {Engine, Render, Runner, World, Bodies, Body, Events} = Matter;

const cellsHorizontal = 3;
const cellsVertical = 3;
const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const {world} = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        //renders outline rather than solid shape
        wireframes: false,
        width,
        height
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
    //0px down (top of canvas)
    Bodies.rectangle(width / 2, 0, width, 2, {label: 'barrier', isStatic: true}),
    //{height}px down (bottom of canvas)
    Bodies.rectangle(width / 2, height, width, 2, {label: 'barrier', isStatic: true}),
    //{width}px to the right (right side of canvas)
    Bodies.rectangle(width, height / 2, 2, height, {label: 'barrier', isStatic: true}),
    //0px to the right (left side of canvas)
    Bodies.rectangle(0, height / 2, 2, height, {label: 'barrier', isStatic: true})
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
const grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

// for (let i = 0; i < 3; i++) {
//     grid.push([]);
//     for (let j = 0; j < 3; j++) {
//         grid[i].push(false);
//     };
// };

const verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsVertical - 1).fill(false));

const horizontals = Array(cellsHorizontal - 1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

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
        if (nextRow < 0 || 
            nextRow >= cellsVertical || 
            nextColumn < 0 || 
            nextColumn >= cellsHorizontal) {
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

        stepThroughCell(nextRow, nextColumn)
    };
};

stepThroughCell(startRow, startColumn);

horizontals.forEach ((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            5,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: '#912221'
                }
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
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2,
            5,
            unitLengthY,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: '#912221'
                }
            }
        );
        World.add(world, wall)
    });
});



// Goal
const goal = Bodies.rectangle(
    width - unitLengthX / 2, 
    height - unitLengthY / 2, 
    unitLengthX * 0.7,
    unitLengthY * 0.7, 
    { 
        label: 'goal',
        isStatic: true,
        render: {
            fillStyle: '#12C712'
        }
    }
);

World.add(world, goal);

// Ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(
    unitLengthX / 2, 
    unitLengthY / 2,
    ballRadius,
    {
        label: 'ball',
        render: {
            fillStyle: '#E4EBF4'
        }
    }
    
);

World.add(world, ball);

document.addEventListener('keydown', event => {
    const {x, y} = ball.velocity;
    const maxVelocity = 8;

    if (event.key === 'w' || event.key ==='ArrowUp') {
        Body.setVelocity(ball, {x, y: Math.max(y - 5, -maxVelocity)}) 
    }

    if (event.key === 's' || event.key ==='ArrowDown') {
        Body.setVelocity(ball, {x, y: Math.min(y + 5, maxVelocity)}) 
     }

     if (event.key === 'a' || event.key ==='ArrowLeft') {
        Body.setVelocity(ball, {x: Math.max(x - 5, -maxVelocity), y})  
     }

     if (event.key === 'd' || event.key ==='ArrowRight') {
        Body.setVelocity(ball, {x: Math.min(x + 5, maxVelocity), y})  
     }
});

// Win Condition

Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach(collision => {
        const labels = ['ball', 'goal'];

        if (
            labels.includes(collision.bodyA.label) &&
            labels.includes(collision.bodyB.label)
        ) {
            document.querySelector('.hidden').classList.remove('hidden');
            world.gravity.y = 1;
            world.bodies.forEach(body => {
                if (body.label !== 'barrier') {
                    Body.setStatic(body, false)
                    Body.setDensity(body, 0.005);
                    Body.scale(body, 1, 1);
                    Body.setMass(body, 1);
                };
                
            })
        }
    })
})