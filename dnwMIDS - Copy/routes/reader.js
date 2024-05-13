const express = require("express");
const router = express.Router();

router.get('/', function (req, res) {
  res.redirect('/reader');
});

//show list of article ordered 
router.get('/reader', (req, res, next) => {

  //show list of published article in descending order
  const query = `
  SELECT id, title, subtitle, published,
  (SELECT COUNT(*) FROM ArticleReaction WHERE IDarticle = BlogArticle.id) AS likes 
  FROM BlogArticle 
  WHERE 
  Published NOT NULL ORDER BY published DESC;
  `;

  global.db.all(query, function(err, articles){
    if (err){
      console.log(err.message);
    } else {
      res.render('home_reader.ejs', {articles});
    }
  });
});

//read article + comments
router.get('/reader/:id', (req, res, next) => {
  const {id} = req.params;

  //retrieve article details and like count with join
  const query = `
  SELECT BlogArticle.id, BlogArticle.title, BlogArticle.subtitle, BlogArticle.body, BlogArticle.published, 
  COUNT(ArticleReaction.userUniqueID) AS likes 
  FROM BlogArticle 
  LEFT JOIN ArticleReaction 
  ON ArticleReaction.IDarticle = BlogArticle.id 
  WHERE BlogArticle.id = ?;
  `;
  //getting comments for the article and sort it by descending order
  const queryOrder = `
  SELECT body_comment, commentMadeTime 
  FROM Comment 
  WHERE IDarticle = ? 
  ORDER BY commentMadeTime DESC;
  `;

  global.db.get(query, id, function (err, article){
    if (err) {
      console.log(err.message);
    } else {
      global.db.all(queryOrder, id, function (err, comments){
        if (err) {
          console.log(err.message);
        } else {
          res.render('article_reader.ejs', {article, comments});
        }
      });
    }
  });
});

//update like counter
router.post('/like/:IDarticle', (req, res, next) =>{
  const {IDarticle} = req.params;
  //inserting like entry to table to record user like for that article
  const query = `
  INSERT INTO ArticleReaction (IDarticle, userUniqueID) VALUES (?, ?);
  `
  //checking if a user has already liked an article
  const likeCheckQuery = `
  SELECT 1 FROM ArticleReaction WHERE IDarticle = ? and userUniqueID =?;
  `
  const data = [IDarticle, global.userUniqueID];

  global.db.get(likeCheckQuery, data, function(err, row){
    if(err){
      console.log(err.message);
      next();
    } else if (row) {
      console.log("You have already liked the article!");
      next();
    } else {
      //insert like if user has not yet liked
      global.db.run(query, data, function(err){
        if(err){
          console.log(err.message);
        } else {
          next();
        }
      });
    }
  });
});


//comment function
router.post('/comment/:IDarticle', (req, res, next) =>{
  const {IDarticle} = req.params;
  //insert a new comment into table for article based on id
  const query = `
  INSERT INTO 
  Comment (IDarticle, body_comment, commentMadeTime) 
  VALUES (?, ?, DATETIME());
  `
  const commentField = [IDarticle, req.body.comment];
  global.db.run(query, commentField, function(err){
    if (err){
      console.log(err.message);
    } else {
      res.redirect('/reader/' + IDarticle);
      next();
    }
  });
})

module.exports = router;
