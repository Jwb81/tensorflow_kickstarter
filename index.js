const tf = require('@tensorflow/tfjs-node');

// Define a model for linear regression.
// const model = tf.sequential({
//     layers: [
//         tf.layers.dense({ inputShape: 2, units: 1, activation: 'sigmoid' }),
//         tf.layers.dense({ units: 1 })
//     ]
// });
// model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});

// const arrTests = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
// const arrLabels = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];

const arrTests = [[1, 1], [1, 2], [2, 3], [4, 4], [1, 5], [2, 6], [2, 7], [4, 8], [7, 9], [9, 10], [100, 20], [120, 80]];
const arrLabels = [[2], [3], [5], [8], [6], [8], [9], [12], [16], [19], [120], [200]];

// const arrTests = [[1, 1], [1, 2], [2, 3], [4, 4], [1, 5], [2, 6], [2, 7], [4, 8], [7, 9], [9, 10]];
// const arrLabels = [[2], [3], [5], [8], [6], [8], [9], [12], [16], [19]];

// const arrTests = [
//     { a: 1 },
//     { a: 2 },
//     { a: 3 },
//     { a: 4 },
//     { a: 5 },
//     { a: 6 },
//     { a: 7 },
//     { a: 8 },
//     { a: 9 },
//     { a: 10 },
// ];

// const arrLabels = [
//     { b: 1 },
//     { b: 3 },
//     { b: 5 },
//     { b: 7 },
//     { b: 9 },
//     { b: 11 },
//     { b: 13 },
//     { b: 15 },
//     { b: 17 },
//     { b: 19 },
// ]

// Generate some synthetic data for training.
// const xs = tf.tensor1d(arrTests);
// const ys = tf.tensor1d(arrLabels);

// const xs = tf.tensor2d(arrTests, [12, 2]);
// const ys = tf.tensor2d(arrLabels, [12, 1]);

xs = tf.tensor2d(arrTests);
ys = tf.tensor2d(arrLabels);
// xs = tf.tensor2d([[0,0],[0,1],[1,0],[1,1]])
// ys = tf.tensor2d([[0],[1],[1],[0]])

var model = tf.sequential()
model.add(tf.layers.dense({units:8, inputShape:2, activation: 'tanh'}))
model.add(tf.layers.dense({units:1, }))
model.compile({optimizer: tf.train.adam(), loss: tf.losses.meanSquaredError })
// model.compile({optimizer: 'sgd', loss: 'binaryCrossentropy', lr:0.1})

const fit = async () => {
  await model.fit(xs, ys, {
    batchSize: 2,
    epochs: 1000
  })
  model.predict(xs).print()

  await model.save('file://./saved-model');

  const loadedModel = await tf.loadLayersModel('file://./saved-model/model.json');
  console.log(`
  
  loaded model:
  `)
  loadedModel.predict(xs).print();
}

fit();

// const xs = tf.tensor1d([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
// const ys = tf.tensor1d([1, 3, 5, 7, 9, 11, 13, 15, 17, 19]);

// const xs = tf.tensor2d([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [10, 1]);
// const ys = tf.tensor2d([1, 3, 5, 7, 9, 11, 13, 15, 17, 19], [10, 1]);


// Train the model using the data.
// model.fit(xs, ys, {epochs: 10}).then(() => {
//   // Use the model to do inference on a data point the model hasn't seen before:
//   const prediction = model.predict(xs).print();
//   // Open the browser devtools to see the output
// });
