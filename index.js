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

const {Engine, Render, Runner, World, Bodies, MouseConstraint, Mouse} = Matter;

const width = 800;
const height = 600;

const engine = Engine.create();
const {world} = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width,
        height
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

//allows the mouse to move non static shapes around
World.add(world, MouseConstraint.create(engine, {
    mouse: Mouse.create(render.canvas)
}));

// Walls
const walls = [
    //400px to the right, (half of canvas length) 0px down (top of canvas)
    Bodies.rectangle(400, 0, 800, 40, {isStatic: true}),
    //400px to the right (half of canvas length), 600px down (bottom of canvas)
    Bodies.rectangle(400, 600, 800, 40, {isStatic: true}),
    //800px to the right (right side of canvas), 300px down (half of canvas height)
    Bodies.rectangle(800, 300, 40, 600, {isStatic: true}),
    //0px to the right (left side of canvas), 300px down (half of canvas height)
    Bodies.rectangle(0, 300, 40, 600, {isStatic: true})
];
World.add(world, walls);




//first two numbers specify the location of the center of the shape
//the next two numbers specify how tall and wide the shape should be
const shape = Bodies.rectangle(200, 200, 50, 50, {
    //gravity is enabled, but we want the shape to remain in place 
    isStatic: true
});

//adding the shape to the world
World.add(world, shape);

// Random Shapes

for (let i = 0; i < 20; i++) {
    World.add(world, Bodies.rectangle(Math.random() * width, Math.random() * height, 40, 40));
};