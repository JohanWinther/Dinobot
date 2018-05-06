var path = require('path');
var express = require('express');

var app = express();


app.use(express.static('public'));

app.use('/assets', express.static(path.resolve(__dirname, 'public/assets')));


app.get("/",function (req, res) {
  res.sendFile(__dirname + "/public/index.html")
});

app.listen(3000);