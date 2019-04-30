
const ids = [
    'select-category',
    'select-country',
    'goal',
    'select-spotlight',
    'select-staff-pick',
];

/**
 * @func setText
 * @param elementId
 * @param text
 */
const setText = (elementId, text) => {
    document.getElementById(elementId).innerText = text;
}

/**
 * @func setSelectOptions
 * @param elementId
 * @param values
 */
const setSelectOptions = (elementId, values) => {
    values = values.sort((a, b) => a[0] < b[0] ? false : true);
    console.log(values)

    values.forEach((v,idx)=> {
        const op = document.createElement('option');
        op.value = v[1];
        op.text = v[0];
        document.getElementById(elementId).append(op);
    })
}

/**
 * @func getOptions
 */
const getOptions = async () => {
    const { data } = await axios.get('/options')
    // .then(res => console.log(res))
    // .catch(err => console.log(err))
    console.log(data)
    setSelectOptions('select-category', data.category);
    setSelectOptions('select-country', data.country);
    setSelectOptions('select-spotlight', data.spotlight);
    setSelectOptions('select-staff-pick', data.staff_pick);
    document.getElementById('csv-features').innerText = data.features.join( ', ');
    document.getElementById('csv-label').innerText = data.label;
}

/**
 * @func makePrediction
 */
const makePrediction = async () => {
    const values = ids.map(id => parseInt(document.getElementById(id).value));
    console.log(values)
    document.getElementById('status').innerText = 'Calculating....';
    const { data } = await axios.post('/predict', {
        values
    })
    console.log(data)
    document.getElementById('prediction').innerText = `${data.state} (${data.value})`
    document.getElementById('status').innerText = 'Done';
}


/**
 * @func validateInputs
 */
const validateInputs = () => {
    let valid = true;
    for (let i = 0; i < ids.length; i++) {
        const val = document.getElementById(ids[i]).value;
        if (val === '' || (ids[i] === 'goal' && !parseInt(val))) {
            valid = false;
            break;
        }
    }
    return valid;
}

/**
 * @func submitForm
 */
const submitForm = () => {
    const formValid = validateInputs();
    if (!formValid) {
        console.log('form is not valid');
        return;
    }
    makePrediction();
}



/**
 * FUNCTIONS TO RUN ON LOAD
 */
window.addEventListener('load', () => {
    getOptions();
})