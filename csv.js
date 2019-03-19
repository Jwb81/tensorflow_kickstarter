const csvUrl =
'https://storage.googleapis.com/tfjs-examples/multivariate-linear-regression/data/boston-housing-train.csv';

async function run() {
   // We want to predict the column "medv", which represents a median value of
   // a home (in $1000s), so we mark it as a label.
   const csvDataset = await tf.data.csv(
     csvUrl, {
       columnConfigs: {
         medv: {
           isLabel: true
         }
       }
     });

     console.log(csvDataset)
     console.log(await csvDataset.columnNames())

   // Number of features is the number of column names minus one for the label
   // column.
   const numOfFeatures = (await csvDataset.columnNames()).length - 1;

   // Prepare the Dataset for training.
   const flattenedDataset =
     csvDataset
     .map(([rawFeatures, rawLabel]) =>
       // Convert rows from object form (keyed by column name) to array form.
       [Object.values(rawFeatures), Object.values(rawLabel)])
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