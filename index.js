const fs = require('fs');
const express = require('express');
const app = express();
const cors = require('cors');
const tf = require('@tensorflow/tfjs-node');

const PORT = process.env.PORT || 1001;

app.use(express.static(__dirname));
app.use(cors());


/**
 * VARIABLES
 */
const saveModel1 = 'file://./saved-model';
const loadModel1 = 'file://./saved-model/model.json';

const saveModel2 = 'file://./saved-model-test';
const loadModel2 = 'file://./saved-model-test/model.json';

const saveModel3 = 'file://./csv-model';
const loadModel3 = 'file://./csv-model/model.json';

const saveModel4 = 'file://./csv-model-short';
const loadModel4 = 'file://./csv-model-short/model.json';

const saveModel = saveModel4;
const loadModel = loadModel4;

const csvUrl = 'http://localhost:1001/data_sets/data.csv'


const buildTrainAndSave = async () => {
  const csvDataset = tf.data.csv(
    csvUrl, {
        columnConfigs: {
            state: {
                isLabel: true
            }
        }
    }
  );

  const numOfFeatures = (await csvDataset.columnNames()).length - 1;

  const flattenedDataset = csvDataset
    .map(({xs, ys}) =>
    {
      // Convert xs(features) and ys(labels) from object form (keyed by column name) to array form.
      return {xs:Object.values(xs), ys:Object.values(ys)};
    })
    .batch(10);

  // Define the model.
  const model = tf.sequential();
  model.add(tf.layers.dense({
    inputShape: [numOfFeatures],
    units: 1
  }));
  model.compile({optimizer: tf.train.adam(0.00001), loss: tf.losses.meanSquaredError })
  // model.compile({optimizer: tf.train.sgd(0.000000001), loss: tf.losses.meanSquaredError })

  // Fit the model using the prepared Dataset
  await model.fitDataset(flattenedDataset, {
    epochs: 10000,
    verbose: 0,
    callbacks: {
      onEpochEnd: async (epoch, logs) => {
        console.log(epoch + ':' + logs.loss);
      }
    }
  });

  await model.save(saveModel);
}

/**
 * Build a model
 */
// var model = tf.sequential()
// // model.add(tf.layers.dense({units:8, inputShape:7, activation: 'tanh'}))
// model.add(tf.layers.dense({units:8, inputShape:7, activation: 'sigmoid'}))
// model.compile({optimizer: tf.train.adam(), loss: tf.losses.meanSquaredError })
// model.add(tf.layers.dense({units:1, }))


/**
 * Read in the simplified data
 */
// const readFile = async () => {
//   fs.readFile('./test.json', 'utf8', (err, data) => {
//     if (err) {
//       console.log(err);
//     }
//     data = JSON.parse(data)
//     fit(data.features, data.labels);
//   })
// }

/**
 * Fit the model with the data
 */
// const fit = async (features, labels) => {
//   const xs = tf.tensor2d(features);
//   const ys = tf.tensor2d(labels);

//   await model.fit(xs, ys, {
//     batchSize: 4,
//     epochs: 50
//   })
//   model.predict(xs).print()

//   await model.save(saveModel);

// }

/**
 * Load a saved model and predict with it
 */
const loadAndPredict = async () => {
  const loadedModel = await tf.loadLayersModel(loadModel);
  
  const success = [0, 0, 1000, 0, 0];
  const canceled = [7, 2, 5000, 1, 0];
  const failed = [1, 1, 5000, 1, 0];

  const random = [0, 7, 500, 1, 0]

  const tensor = tf.tensor2d(success, [1,5])
  
  loadedModel.predict(tensor).print();
}

/**
 * Action to take on start
 */
app.listen(PORT, () => {
  console.log('running on ' + PORT)
  // buildTrainAndSave();
  loadAndPredict();
  // readFile();
})