const express = require('express');
const app = express();
const path = require('path');
const port = 8000;
const mongoose=require('mongoose');
const router=require('./controller/router')
var bodyparser=require("body-parser");
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const session = require('express-session')

app.use(methodOverride('_method'));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

app.use(cookieParser());
app.use(session({
  secret: 'lva',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } 
}))
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB', err));

app.use('/', router);
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'view','ejs'))

app.use('/controller', express.static(path.join(__dirname, 'controller')));
app.use(express.static(path.join(__dirname, 'view')));
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
