const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const cors = require('cors');
const tf = require('@tensorflow/tfjs-node');

const PORT = process.env.PORT || 1003;

app.use(express.static(__dirname));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

/**
 * VARIABLES
 */
const saveModelOld = 'file://./csv-model-short';
const loadModelOld = 'file://./models/csv-model-short/model.json';

const saveKickstarterModelUrl2 = 'file://./models/kickstarter_model2';
const loadKickstarterModelUrl2 = 'file://./models/kickstarter_model2/model.json';
const saveKickstarterModelUrl3 = 'file://./models/kickstarter_model3';
const loadKickstarterModelUrl3 = 'file://./models/kickstarter_model3/model.json';

// const saveModel = saveKickstarterModelUrl2;
const loadModel = loadKickstarterModelUrl2;
// const saveModel = saveKickstarterModelUrl;
// const loadModel = loadKickstarterModelUrl;

const csvUrl = 'http://localhost:1002/data_sets/csv_parser_output.csv';
// const csvUrl = 'http://localhost:1001/data_sets/data.csv'

const csvFeatures = [ 
  'category',
  'country',
  'goal',
  'spotlight',
  'staff_pick'
];

const csvLabel = 'state';
let mapper = {
  category: {},
  country: {}
};


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
 * Load a saved model and predict with it
 */
const loadAndPredict = async (values) => {
  const loadedModel = await tf.loadLayersModel(loadModel);
  
  const success = [0, 0, 1000, 0, 0];
  const canceled = [7, 2, 5000, 1, 0];
  const failed = [1, 1, 5000, 1, 0];

  const random = [0, 7, 500, 1, 0]

  const tensor = tf.tensor2d(values || success, [1,5])
  
  let prediction = loadedModel.predict(tensor);
  const val = await prediction.data();
  console.log(`value: ${val}`)
  return val;
}


/**
 * Load map
 */
const loadMapper = () => {
  fs.readFile('./csv_value_mapper.json', 'utf8', (err, data) => {
    if (err) {
      return console.log(err);
    }
    mapper = JSON.parse(data);
    // console.log(mapper)
  })
}

/**
 * convert values to numbers
 */
const mapValuesToNumbers = values => {
  
}


app.get('/options', (req, res) => {
  res.json({
    features: csvFeatures,
    label: csvLabel,
    category: Object.entries(mapper.category),
    country: Object.entries(mapper.country),
    spotlight: Object.entries(mapper.spotlight),
    staff_pick: Object.entries(mapper.staff_pick),
  })
})
app.post('/predict', (req, res) => {
  const { values } = req.body
  loadAndPredict(values)
  .then(val => res.json({
    value: val[0],
    state: Math.round(val) === 0 ? 'success' : 'failed'
  }))
  .catch(err => res.send(err));
})

/**
 * Action to take on start
 */
app.listen(PORT, () => {
  console.log('running on ' + PORT)

  loadMapper();

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