require('dotenv').config();

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth'); 
const profileRouter = require('./routes/profile');

var app = express();

// Configuración de CORS
app.use(cors({
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL,
    credentials: true, // Importante para que las cookies se envíen
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter); 
app.use('/api', profileRouter);

module.exports = app;
