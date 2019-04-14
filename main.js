const express = require('express');
const app = express();
const { db } = require('./db');

const path = require('path');
const volleyball = require('volleyball');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');

const redisCient = require('./server/redis');

app.use(favicon(path.join(__dirname, '/public/favicon.ico')));
app.use(volleyball);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '/public')))

app.use('/api', require('./server/api'));

app.get('*', function (req, res, next) {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.use(function (err, req, res, next) {
  console.error(err);
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || 'Internal server error.');
});

db.sync({})
.then(() => {
  app.listen(process.env.PORT || 5000);
  //pre-fetch db data and cache in redis
});
