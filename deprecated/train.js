const express = require('express');
const app = express();
const cors = require('cors');
const tf = require('@tensorflow/tfjs-node');

const PORT = process.env.PORT || 1000;

app.use(express.static(__dirname));

app.use(cors());

csvLabel = 'state';
const columnConfigs = {};
columnConfigs[csvLabel] = { 
    isLabel: true,
    // hasHeader: true
 };

const csvUrl =
// 'http://localhost:1000/data_sets/boston-housing-train.csv';
// 'http://localhost:1000/data_sets/data.csv';
'http://localhost:1000/data_sets/csv_parser_output.csv';
  // 'https://tensorflow-kickstarter.herokuapp.com/data_sets/K001.csv'
//   'http://localhost:1000/data_sets/K001.csv';


async function run() {
    // We want to predict the column "medv", which represents a median value of
    // a home (in $1000s), so we mark it as a label.
    const csvDataset = await tf.data.csv(
      csvUrl, {
        columnConfigs
      });

    // csvDataset.forEachAsync(r => console.log(r));
 
    // Number of features is the number of column names minus one for the label column.
    const numOfFeatures = (await csvDataset.columnNames()).length - 1;
 
    // Prepare the Dataset for training.
    const flattenedDataset =
      csvDataset
      .map(({xs, ys}) =>
        {
          // Convert rows from object form (keyed by column name) to array form.
          // console.log(Object.values(ys))
          return {xs:Object.values(xs), ys:Object.values(ys)};
        })
      .batch(10);

    // Define the model.
    const model = tf.sequential();
    model.add(tf.layers.dense({
      inputShape: [numOfFeatures],
      units: 1
    }));
    model.compile({
      optimizer: tf.train.sgd(0.000001),
      loss: 'meanSquaredError'
    });
 
    // Fit the model using the prepared Dataset
    await model.fitDataset(flattenedDataset, {
      epochs: 10,
      callbacks: {
        onEpochEnd: async (epoch, logs) => {
          console.log(epoch + ':' + logs.loss);
        },
        onTrainEnd: async(logs) => {
  
        }
      }
    });

    try {
        // model.predict(tf.tensor([[30],[0],[0],[1000],[1570.753],[0],[0]])).print();
    } catch (error) {
        console.log(error)
    }
 }

 app.listen(PORT, () => {
    console.log('Kickstarter listening on port 1000');
    run();
})
 

