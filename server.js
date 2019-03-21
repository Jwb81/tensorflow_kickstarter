const express = require('express');
const app = express();
const cors = require('cors');
const tf = require('@tensorflow/tfjs-node');

const PORT = process.env.PORT || 1000;

app.use(express.static(__dirname));

app.use(cors());



const csvUrl =
  // 'https://tensorflow-kickstarter.herokuapp.com/data_sets/K001.csv'
  'http://localhost:1000/data_sets/K001.csv';

const setText = (id, text) => {
    console.log(id, text);
}

const filterData = async (dataset, features) => {
  const modFns = {
    category: data => {
      if (!data) { return }
      console.log(typeof data)
    //   data = data.replace(/\"\"/g, '"');
    //     return JSON.parse(data).name;
    },
  }

  let rowCount = 0;
  const filtered = dataset.map((row, idx) => {
    // create a blank row object to add to (eliminating unwanted columns)
    const filteredRow = {
      xs: {},
      ys: row.ys
    };

    // add each watned column to the filtered row
    features.forEach(col => {
      let data = row.xs[col];

      // modify the data if needed
      if (modFns[col]) {
        data = modFns[col](data);
      }
      filteredRow.xs[col] = data;
    })

    rowCount += 1;
    return filteredRow;
  })

//   filtered.forEachAsync(x => console.log(x))


  return {
    filtered,
    rowCount
  }
}

async function run() {
  //  const includedfields = [ 'zn', 'tax', 'chas' ];

  setText('script-status', 'Loading CSV...');

  const csvFeatures = [
    'backers_count',
    'category',
    'country',
    'goal',
    'usd_pledged',
    'spotlight',
    'staff_pick'
  ];

  const csvLabel = 'state';
  const columnConfigs = {};
  columnConfigs[csvLabel] = { isLabel: true };
  
  let csvDataset = await tf.data.csv(
    csvUrl, {
      columnConfigs
    });

  setText('script-status', 'CSV loaded - now filtering columns out...');

  const { filtered, rowCount } = await filterData(csvDataset, csvFeatures);
  csvDataset = filtered;

//   setText('csv-row-length', rowCount);
//   setText('csv-features', csvFeatures.join(',\n'));
//   setText('csv-label', csvLabel);
//   setText('script-status', 'CSV filtered...');

//   csvDataset.forEach(z => console.log(z))

  // console.log(csvDataset)
  // console.log(`rows: ${rowCount}`)
  
  // Number of features is the number of column names minus one for the label column.
//   const numOfFeatures = (await csvDataset.columnNames()).length - 1;

//   // Prepare the Dataset for training.
//   const flattenedDataset =
//     csvDataset
//     .map(({xs, ys}) =>
//       {
//         // Convert rows from object form (keyed by column name) to array
//         // form.
//         return {xs:Object.values(xs), ys:Object.values(ys)};
//       })
//     .batch(10);

//   // Define the model.
//   const model = tf.sequential();
//   model.add(tf.layers.dense({
//     inputShape: [numOfFeatures],
//     units: 1
//   }));
//   model.compile({
//     optimizer: tf.train.sgd(0.000001),
//     loss: 'meanSquaredError'
//   });


// //  flattenedDataset.forEachAsync(a => console.log(a))
//   // Fit the model using the prepared Dataset
//   return model.fitDataset(flattenedDataset, {
//     epochs: 10,
//     callbacks: {
//       onEpochEnd: async (epoch, logs) => {
//         console.log(epoch + ':' + logs.loss);
//       }
//     }
//   });
}



app.listen(PORT, () => {
    console.log('Kickstarter listening on port 1000');
})


run();
