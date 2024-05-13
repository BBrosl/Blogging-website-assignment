const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3010;
const sqlite3 = require('sqlite3').verbose();

//items in the global namespace are accessible throught out the node application
global.db = new sqlite3.Database('./database.db',function(err){
  if(err){
    console.error(err);
    process.exit(1); //Bail out we can't connect to the DB
  }else{
    console.log("Database connected");
    global.db.run("PRAGMA foreign_keys=ON"); //This tells SQLite to pay attention to foreign key constraints
  }
});

//set unique user for like management
global.userUniqueID = require('crypto').randomUUID();

//retrieving fields in settings
global.db.all('SELECT * FROM WebsiteSettings', function(err, rows){
  if (err){
    next(err);
  } else {
    const settings = rows.reduce((prev, curr) => ({ ...prev, [curr.id]: curr.value }), {});
    global.settings = settings;
  }
});

app.use(bodyParser.urlencoded({ extended: true }));

const authorRoutes = require('./routes/author');
const readerRoutes = require('./routes/reader');

//set the app to use ejs for rendering
app.set('view engine', 'ejs');
//bootstrapping
app.use('/assets', express.static('public'));


//this adds all the Routes to the app under the right /path
app.use('/', readerRoutes);
app.use('/author', authorRoutes);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

