const express = require('express');
const reviewRouter = require('./reviewRouter.js');
const path = require('path');
const app = express();
const port = 3001;

app.use(express.json());

app.use('/reviews', reviewRouter);

app.listen(port);
console.log(`Server listening at http://localhost:${port}`);