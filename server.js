var express = require('express')
var app = express();
var cors = require('cors');
var GetDataMasterRound = require('./index.js');
var {atkMiddlewareVerifyJWT} =require('atk-verify-jwt');

app.use(cors());
app.use(require('body-parser').urlencoded({extended: true}));
app.use(require('body-parser').json());
app.use(require('express-session')({secret: 'keyboard dog', resave: true, saveUninitialized: true}));

var BASE_URL = '/round';

app.post(BASE_URL + '/get-round-master', atkMiddlewareVerifyJWT ,function(req,res) {

    GetDataMasterRound.handler(req, function( err,response ) {

    if(err) {
        res.set(response.headers)
        .status(response.statusCode)
        .json(response.body);       
    }
        res.set(response.headers)
        .status(response.statusCode)
        .json(response.body); 

    });
    
});

app.listen('8090');
