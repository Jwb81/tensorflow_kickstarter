const express = require('express');
const app = express();
const cors = require('cors');

const PORT = 1000;

app.use(express.static(__dirname));

app.use(cors());


app.listen(PORT, () => {
    console.log('Kickstarter listening on port 1000');
})