const csvUrl =
'https://storage.googleapis.com/tfjs-examples/multivariate-linear-regression/data/boston-housing-train.csv';

async function run() {
   // We want to predict the column "medv", which represents a median value of
   // a home (in $1000s), so we mark it as a label.
   const includedfields = [ 'zn', 'tax', 'chas' ];
   const csvDataset = await tf.data.csv(
     csvUrl, {
       columnConfigs: {
         medv: {
           isLabel: true
         }
       }
     });

     console.log(csvDataset)
   // Number of features is the number of column names minus one for the label
   // column.
   const numOfFeatures = (await csvDataset.columnNames()).length - 1;

   let test = csvDataset.map(a => {
    // filter out only the field that we want to train on
    const xsFiltered = {};
     includedfields.map(f => {
       xsFiltered[f] = a.xs[f];
     })

     a.xs = xsFiltered;
     return a;
   })

   test.forEachAsync(x => console.log(x))
   
   // Prepare the Dataset for training.
   const flattenedDataset =
     csvDataset
     .map(({xs, ys}) =>
       {
         // Convert rows from object form (keyed by column name) to array
         // form.
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


  //  flattenedDataset.forEachAsync(a => console.log(a))
   // Fit the model using the prepared Dataset
   return model.fitDataset(flattenedDataset, {
     epochs: 10,
     callbacks: {
       onEpochEnd: async (epoch, logs) => {
         console.log(epoch + ':' + logs.loss);
       }
     }
   });
}

run();