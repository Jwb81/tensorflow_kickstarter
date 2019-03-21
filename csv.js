const csvUrl =
  'https://tensorflow-kickstarter.herokuapp.com/data_sets/K001.csv';
// 'https://storage.googleapis.com/tfjs-examples/multivariate-linear-regression/data/boston-housing-train.csv';

const setText = (id, text) => {
  const el = document.getElementById(id);
  if (!el) {
    return console.log('element does not exist');
  }

  el.innerText = text;
}

async function run() {
  //  const includedfields = [ 'zn', 'tax', 'chas' ];

  setText('script-status', 'Loading CSV...');

  const includedfields = [
    'backers_count',
    'category',
    'country',
    'goal',
    'usd_pledged',
    'spotlight',
    'staff_pick',
    'state'
  ];

  const filterFns = {
    category: data => {
      return data.name;
    },
  }

  const labelField = 'state';
  const columnConfigs = {};
  columnConfigs[labelField] = { isLabel: true };
  
  let csvDataset = await tf.data.csv(
    csvUrl, {
      columnConfigs
    });

  setText('script-status', 'CSV loaded - now filtering columns out...');

  let rowCount = 0;
  csvDataset = await csvDataset.mapAsync(row => {
    const filteredRow = {
      xs: {},
      ys: {}
    };
    includedfields.forEach(col => {
      filteredRow.xs[col] = row[col];
    })
    filteredRow.ys = row.ys;

    rowCount += 1;
    return filteredRow;
  })

  setText('csv-row-length', rowCount);
  setText('csv-features', includedfields.join(',\n'));
  setText('csv-label', labelField);
  setText('script-status', 'CSV filtered...');

  csvDataset.forEachAsync(z => console.log(z))

  console.log(csvDataset)
  console.log(`rows: ${rowCount}`)
  
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

run();