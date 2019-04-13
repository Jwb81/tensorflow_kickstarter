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
const fieldsToKeep = csvFeatures.concat(csvLabel);

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

const fieldsToConvertToNumbers = [
    'category',
    'country',
    'spotlight',
    'staff_pick',
    'state'
]
const fieldNumToValMap = {};

const mapFieldValues = dataset => {
    const mapper = dataset.reduce((acc, cur) => {
        fieldsToConvertToNumbers.forEach(field => {
            if (!acc[field]) {
                acc[field] = {};
            }

            // console.log(acc); 
            
            if (acc[field][cur[field]] === undefined) {
                const newId = Object.keys(acc[field]).length
                acc[field][cur[field]] = newId;
            }
            // console.log(acc); 
        })
        return acc;
    }, {});
    fs.writeFile('./csv_value_mapper.json', JSON.stringify(mapper, null, 4), 'utf8', err => {
        if (err) {
            console.log(err);
        }
    })
    return mapper;
}

const translateFieldValues = dataset => {
    const mapper = mapFieldValues(dataset);

    dataset = dataset.map(row => {
        fieldsToConvertToNumbers.forEach(field => {
            row[field] = mapper[field][row[field]];
        })

        Object.keys(row).forEach(f => {
            row[f] = Number(row[f]);
        })
        
        return row;
    })

    // send to CSV file
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

    // send to JSON file
    const features = dataset.map(row => {
        let rowArr = [];
        csvFeatures.forEach(field => {
            rowArr = rowArr.concat(row[field])
        })
        return rowArr;
    })
    const labels = dataset.map(row => {
        let rowArr = [];
        rowArr = rowArr.concat(row[csvLabel]);
        return rowArr;
    })
    const allData = {
        features,
        labels
    }
    fs.writeFile('./test.json', JSON.stringify(allData, null, 4), 'utf8', err => {
        if (err) {
            console.log(err)
        }
    })
}

const filterLabelField = (dataset) => {
    return dataset.filter((row) => allowedLabelValues.includes(row[csvLabel]));
}

// const getCategorySummary = dataset => {
//     let summary = dataset.reduce((acc, cur) => {
//         const catName = cur.category;
        
//         if (!acc[catName]) {
//             acc[catName] = 1
//         } else {
//             acc[catName] = acc[catName] + 1;
//         }
//         return acc;
//     }, {})
// }

const cleanData = dataset => {
    // const fields = dataset[0];
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
    
    translateFieldValues(dataset);
}




fs.createReadStream('./data_sets/K001.csv')
    .pipe(parser())
    .on('data', data => results.push(data))
    .on('end', () => {
        cleanData(results)
    })