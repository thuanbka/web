const express = require('express');
const  bodyParser = require('body-parser');
const  app = express();
var morgan = require('morgan');
var mongoose = require('mongoose');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var nodemailer=require('nodemailer');
var config = require('./config/database');

mongoose.connect(config.db,{
    useMongoClient : true
});



app.set('view engine','ejs');

require('./config/passport')(passport);
app.use(bodyParser.json({limit:'5mb'}));
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(session({
    secret:'secret123',
    saveUninitialized: true,
    resave:true
})); 
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
require('./routes/routes')(app, passport);

const product=require('./routes/product');
app.use('/product',product);





app.listen(process.env.PORT || 9000);



