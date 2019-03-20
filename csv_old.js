const csvUrl =
'https://storage.googleapis.com/tfjs-examples/multivariate-linear-regression/data/boston-housing-train.csv';

async function run() {
   // We want to predict the column "medv", which represents a median value of
   // a home (in $1000s), so we mark it as a label.
   const csvDataset = tf.data.csv(
     csvUrl, {
       columnConfigs: {
         medv: {
           isLabel: true
         }
       }
     });

   // Number of features is the number of column names minus one for the label
   // column.
   const numOfFeatures = (await csvDataset.columnNames()).length - 1;

  //  let xsArray = [];
  //  let ysArray = [];
  //  let flattenedDataset = [];
   
  //  await csvDataset.forEachAsync((data) => {
  //    const nextSet = [[
  //     Object.values(data.xs),
  //     Object.values(data.ys)
  //    ]]
  //    flattenedDataset = flattenedDataset.concat(nextSet);
  //   //  xsArray = xsArray.concat([[...Object.values(data.xs)]]);
  //   //  ysArray = xsArray.concat([[...Object.values(data.ys)]]);
  //  })

  //  const flattenedDataset = [xsArray, ysArray];

  
  // flattenedDataset = csvDataset.map(data => {
  //   data.ys.medv = 0;
  //   return data;
  // });
  // flattenedDataset.forEachAsync(x => console.log(x))
  
   // Prepare the Dataset for training.
   const flattenedDataset = 
     csvDataset
     .map(([rawFeatures, rawLabel]) => {
        // return { xs: Object.values(data.xs), ys: Object.values(data.ys) };
    
       // Convert rows from object form (keyed by column name) to array form.
       return [Object.values(rawFeatures), Object.values(rawLabel)]
     })

    flattenedDataset.forEachAsync(x => console.log(x))
    //  .batch(10);



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
