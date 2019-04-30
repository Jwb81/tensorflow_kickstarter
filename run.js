const fs = require('fs');
const express = require('express');
const app = express();
const cors = require('cors');
const tf = require('@tensorflow/tfjs-node');

const PORT = process.env.PORT || 1000;

app.use(express.static(__dirname));
app.use(cors());


/**
 * VARIABLES
 */
const saveModelOld = 'file://./csv-model-short';
const loadModelOld = 'file://./csv-model-short/model.json';

const saveKickstarterModelUrl = 'file://./models/kickstarter_model';
const loadKickstarterModelUrl = 'file://./models/kickstarter_model/model.json';

const saveModel = saveModelOld;
const loadModel = loadModelOld;
// const saveModel = saveKickstarterModelUrl;
// const loadModel = loadKickstarterModelUrl;

const csvUrl = 'http://localhost:1000/data_sets/csv_parser_output.csv';
// const csvUrl = 'http://localhost:1001/data_sets/data.csv'


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

  switch(process.argv[2]) {
    case 'train':
      buildTrainAndSave();
      break;
    case 'predict':
      loadAndPredict();
      break;
    default:
      console.log('You must provide a valid command (train || predict)')
      break;
  }
  // readFile();
})