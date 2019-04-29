const express = require('express');
const app = express();
const cors = require('cors');
const tf = require('@tensorflow/tfjs-node');

const PORT = process.env.PORT || 1000;

app.use(express.static(__dirname));
app.use(cors());


const csvUrl =
// 'http://localhost:1000/data_sets/boston-housing-train.csv'
// 'http://localhost:1000/data_sets/data.csv'
'http://localhost:1000/data_sets/csv_parser_output.csv'
// 'https://storage.googleapis.com/tfjs-examples/multivariate-linear-regression/data/boston-housing-train.csv';

async function run() {
// We want to predict the column "medv", which represents a median value of
// a home (in $1000s), so we mark it as a label.
const csvDataset = tf.data.csv(
    csvUrl, {
        columnConfigs: {
            // medv: {
            state: {
                isLabel: true
            }
        }
    }
);

// Number of features is the number of column names minus one for the label
// column.
const numOfFeatures = (await csvDataset.columnNames()).length - 1;

// Prepare the Dataset for training.
const flattenedDataset =
csvDataset
.map(({xs, ys}) =>
{
// Convert xs(features) and ys(labels) from object form (keyed by
// column name) to array form.
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
// {
//     optimizer: tf.train.sgd(0.000001),
//     loss: 'meanSquaredError'
// });

// Fit the model using the prepared Dataset
return model.fitDataset(flattenedDataset, {
    epochs: 10000,
    verbose: 0,
    callbacks: {
        onEpochEnd: async (epoch, logs) => {
            console.log(epoch + ':' + logs.loss);
        }
    }
});
}

app.listen(PORT, () => {
    console.log('running on ' + PORT)
    run();
})