const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

const inventoryRouter = require('./inventory/inventoryRouter');

app.use(cors());

app.use('/group/item', inventoryRouter);


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});