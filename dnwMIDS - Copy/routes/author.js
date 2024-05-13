const express = require("express");
const router = express.Router();

//render author home page and published articles
router.get('/', (req, res, next) => {

  //retrieving article data as well as like count using join function
  const query = `
  SELECT BlogArticle.id, BlogArticle.title, BlogArticle.time_made, BlogArticle.time_edited, BlogArticle.published, 
  COUNT(ArticleReaction.userUniqueID) as likes
  FROM BlogArticle
  LEFT JOIN ArticleReaction ON ArticleReaction.IDarticle = BlogArticle.id
  GROUP BY BlogArticle.id;
  `;

  global.db.all(query, function(err, articles){
    if (err) {
      console.log(err.message);
    } else {
      res.render('home_author.ejs', {articles});
    }
  });
});


//display edit
router.get('/new', (req, res) => {
  res.render('edit_author.ejs');
});

//create article
router.post('/new', (req, res, next) => {
    const { title, subtitle, body } = req.body;

    //inserting new data for a new article into table
    const query = 'INSERT INTO BlogArticle (title, subtitle, body, time_made) VALUES (?, ?, ?, dateTime());';
    const fields = [title, subtitle, body];

    global.db.run(query, fields, function (err){
      if(err){
        console.log(err.message);
      } else {
        res.redirect('/author');
        next();
      }
    });
  });


  //display edit page for author
  router.get('/edit/:id', (req, res, next) => {
    const { id } = req.params;

    //getting articlw with the specified id
    const query = `
    SELECT
      BlogArticle.*,
      (SELECT COUNT(userUniqueID) FROM ArticleReaction WHERE IDarticle = BlogArticle.id) AS likes
    FROM
      BlogArticle
    WHERE
      id = ?;
    `;
    
    global.db.get(query, id, function (err, article) {
      if (err) {
        console.log(err.message); 
      } else {
        res.render('edit_author.ejs', article);
      }
    });
  });

//edit article that already exist
router.post('/edit/:id', (req, res, next) => {
  const { id } = req.params;
  const { title, subtitle, body } = req.body;

  //updating data in existing article with id
  const query = `
    UPDATE BlogArticle
    SET title = ?, subtitle = ?, body =?, time_edited = DATETIME()
    WHERE id = ?;
    `;
  
  const fields = [title, subtitle, body ,id];

  global.db.run(query, fields, function (err) {
    if (err) {
      console.log(err.message); 
    } else {
      res.redirect('/author');
      next();
    }
  });
});


//publish the current artivle
router.post('/publish/:IDarticle', (req, res, next) =>{
  const { IDarticle } = req.params;

  //sets published field of article from BlogArticle with date and time
  const query = `
    UPDATE BlogArticle
    SET published = DATETIME() 
    WHERE id = ?;`;

  global.db.run(query, IDarticle, function(err){
    if(err) {
      console.log(err.message);
    } else {
      
      next();
    }
  });
});

//delete article from Article table
router.delete('/delete/:IDarticle', (req, res, next) => {
  const {IDarticle} = req.params;
  //deleting article based on id from the table
  const query = `
  DELETE FROM BlogArticle WHERE id = ?;`;

  global.db.run(query, IDarticle, function(err){
    if(err){
      console.log(err.message);
    } else {
      
      next();
    }
  });

});

router.get('/settings', (req, res) =>{

  res.render('settings_author.ejs', global.settings);
});

router.post('/settings', (req, res, next) =>{

  const {title, subtitle, author} = req.body;
  const fields = [title, subtitle, author];
  //updating the settings value using associated fields
  const query = `
  UPDATE WebsiteSettings 
  SET value = CASE id 
    WHEN "title" THEN ? 
    WHEN "subtitle" THEN ? 
    WHEN "author" THEN ? 
    ELSE value 
  END 
  WHERE id IN ("title", "subtitle", "author");`;

  global.db.run(query, fields, function(err){
    if(err){
      console.log(err.message);
    } else {
      global.settings = {title, subtitle, author};
      res.redirect('/author');
      next();
    }
  });
});


module.exports = router;
