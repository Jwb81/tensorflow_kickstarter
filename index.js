const fs = require('fs');
const tf = require('@tensorflow/tfjs-node');

const arrTests = [[1, 1], [1, 2], [2, 3], [4, 4], [1, 5], [2, 6], [2, 7], [4, 8], [7, 9], [9, 10], [100, 20], [120, 80]];
const arrLabels = [[2], [3], [5], [8], [6], [8], [9], [12], [16], [19], [120], [200]];


fs.readFile('./test.json', 'utf8', (err, data) => {
  if (err) {
    console.log(err);
  }
  data = JSON.parse(data)
  fit(data.features, data.labels);
  console.log(data.features.length)
  console.log(data.labels.length)
})

// xs = tf.tensor2d(arrTests);
// ys = tf.tensor2d(arrLabels);
// xs = tf.tensor2d([[0,0],[0,1],[1,0],[1,1]])
// ys = tf.tensor2d([[0],[1],[1],[0]])

var model = tf.sequential()
model.add(tf.layers.dense({units:8, inputShape:7, activation: 'tanh'}))
model.add(tf.layers.dense({units:1, }))
model.compile({optimizer: tf.train.adam(), loss: tf.losses.meanSquaredError })

const fit = async (features, labels) => {
  const xs = tf.tensor2d(features);
  const ys = tf.tensor2d(labels);

  await model.fit(xs, ys, {
    batchSize: 2,
    epochs: 10
  })
  model.predict(xs).print()

  await model.save('file://./saved-model');

  // const loadedModel = await tf.loadLayersModel('file://./saved-model/model.json');
  // console.log(`
  
  // loaded model:
  // `)
  // loadedModel.predict(xs).print();
}

// fit(xs, ys);
