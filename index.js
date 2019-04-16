const fs = require('fs');
const tf = require('@tensorflow/tfjs-node');

const arrTests = [[1, 1], [1, 2], [2, 3], [4, 4], [1, 5], [2, 6], [2, 7], [4, 8], [7, 9], [9, 10], [100, 20], [120, 80]];
const arrLabels = [[2], [3], [5], [8], [6], [8], [9], [12], [16], [19], [120], [200]];

const readFile = async () => {
  fs.readFile('./test.json', 'utf8', (err, data) => {
    if (err) {
      console.log(err);
    }
    data = JSON.parse(data)
    fit(data
      .features, data.labels);
  })
}

// xs = tf.tensor2d(arrTests);
// ys = tf.tensor2d(arrLabels);
// xs = tf.tensor2d([[0,0],[0,1],[1,0],[1,1]])
// ys = tf.tensor2d([[0],[1],[1],[0]])

var model = tf.sequential()
// model.add(tf.layers.dense({units:8, inputShape:7, activation: 'tanh'}))
model.add(tf.layers.dense({units:8, inputShape:7, activation: 'sigmoid'}))
model.add(tf.layers.dense({units:1, }))
model.compile({optimizer: tf.train.adam(), loss: tf.losses.meanSquaredError })

const fit = async (features, labels) => {
  const xs = tf.tensor2d(features);
  const ys = tf.tensor2d(labels);

  await model.fit(xs, ys, {
    batchSize: 4,
    epochs: 50
  })
  model.predict(xs).print()

  // await model.save('file://./saved-model-test');
  await model.save('file://./saved-model');

}

const load = async () => {
  // const loadedModel = await tf.loadLayersModel('file://./saved-model-test/model.json');
  const loadedModel = await tf.loadLayersModel('file://./saved-model/model.json');
  
  const success = [ 30, 0, 0, 1000, 1570.75316453, 0, 0]
  const canceled = [ 43, 7, 2, 5000, 1526.69880231, 1, 0]
  const failed = [ 0, 1, 1, 5000, 0, 1, 0]

  // const random = [40, 20, 1, 10000, 9500, 0, 0]
  const random = [40, 0, 7, 500, 375, 1, 0]

  const tensor = tf.tensor2d(random, [1,7])
  
  loadedModel.predict(tensor).print();
}
// readFile();
load();
// fit(xs, ys);
