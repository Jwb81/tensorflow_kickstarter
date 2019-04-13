const parser = require('csv-parser');
const converter = require('json-2-csv');
const fs = require('fs');

let results = [];

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
const allowedLabelValues = [
    'successful',
    'failed',
    'canceled'
]

const modFns = {
    category: (data, idx) => {
        return JSON.parse(data).name;
    }
}

const filterLabelField = (dataset) => {
    // let labelIdx = null;
    return dataset.filter((row) => {
        // // ignore header row
        // if (!idx) {
        //     labelIdx = row.findIndex(f => f === csvLabel);
        //     return true;
        // }

        return allowedLabelValues.includes(row[csvLabel]);
    })
}

const getCategorySummary = dataset => {
    let summary = dataset.reduce((acc, cur) => {
        const catName = cur.category;
        
        if (!acc[catName]) {
            acc[catName] = 1
        } else {
            acc[catName] = acc[catName] + 1;
        }
        return acc;
    }, {})

    /**
     * trying to sort the category names... Not working so far
     */
    // summary = Object.entries(summary)
    //     .sort((a, b) => b[0][0] < a[0][0])
    //     .reduce((acc, cur) => {
    //         const catName = cur[0];

    //         if (!acc[catName]) {
    //             acc[catName] = 1
    //         } else {
    //             acc[catName] = acc[catName] + 1;
    //         }
    //         return acc;
    //     }, {})
}

const cleanData = dataset => {
    // const fields = dataset[0];
    const fieldsToKeep = csvFeatures.concat(csvLabel);
    // const fieldsToKeepIndexes = fieldsToKeep.reduce((acc, cur) => {
    //     const idx = fields.findIndex(f => f === cur);
    //     if (idx !== -1) {
    //         acc[cur] = idx;
    //         acc[idx] = cur;
    //     }
    //     return acc;
    // }, {});

    // console.log(fieldsToKeepIndexes)
    // filter the dataset
    // dataset = dataset.map((row, rowIdx) => {
    //     // map the row and modify any needed fields
    //     let newRow = row.map((fieldContent, idx) => {
    //         // skip any mutation for header row
    //         if (!rowIdx) {
    //             return fieldContent;
    //         }

    //         // map over each field and see if it needs modified
    //         const field = fieldsToKeepIndexes[idx]
    //         if (modFns[field]) {
    //             return modFns[field](fieldContent, rowIdx);
    //         }
    //         return fieldContent;
    //     })

    //     // filter out only the columns that are wanted
    //     newRow = newRow.filter((fieldContent, idx) => {
    //         const field  = fieldsToKeepIndexes[idx];
    //         if ( field ) {
    //             return true;
    //         }
    //         return false;
    //     })

    //     return newRow;
    // })

    dataset = dataset.map(row => {
        const filteredRow = {};

        fieldsToKeep.forEach(feat => {
            if (modFns[feat]) {
                filteredRow[feat] = modFns[feat](row[feat]);
            } else {
                filteredRow[feat] = row[feat];
            }
        })

        return filteredRow;
    })
    
    // console.log(fieldsToKeepIndexes);
    dataset = filterLabelField(dataset)
    
    converter.json2csv(dataset, (err, data) => {
        if (err) {
            return console.log(err);
        }
        fs.writeFile('./data_sets/csv_parser_output.csv', data, 'utf8', err => {
            if (err) {
                console.log(err);
            }
        })
    })
    
}























fs.createReadStream('./data_sets/K001.csv')
    .pipe(parser())
    .on('data', data => results.push(data))
    .on('end', () => {
        cleanData(results)
    })