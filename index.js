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

const {Engine, Render, Runner, World, Bodies} = Matter;

const cells = 3;
const width = 600;
const height = 600;

const engine = Engine.create();
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
    Bodies.rectangle(width / 2, 0, width, 40, {isStatic: true}),
    //{height}px down (bottom of canvas)
    Bodies.rectangle(width / 2, height, width, 40, {isStatic: true}),
    //{width}px to the right (right side of canvas)
    Bodies.rectangle(width, height / 2, 40, height, {isStatic: true}),
    //0px to the right (left side of canvas)
    Bodies.rectangle(0, height / 2, 40, height, {isStatic: true})
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
    };
};

stepThroughCell(startRow, startColumn);

//first two numbers specify the location of the center of the shape
//the next two numbers specify how tall and wide the shape should be
const shape = Bodies.rectangle(200, 200, 50, 50, {
    //gravity is enabled, but we want the shape to remain in place 
    isStatic: true
});

//adding the shape to the world
World.add(world, shape);