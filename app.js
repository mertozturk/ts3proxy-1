const path = require('path');
const morgan = require('morgan');
const express = require('express');

const app = express();

app.disable('x-powered-by');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');
app.set('json spaces', 4);

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'static')));

app.use('/', require('./routes/index.js'));

app.use((req, res, next) => {
	res.status(404).render("404");
});

app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).render("500");
});

module.exports = app;