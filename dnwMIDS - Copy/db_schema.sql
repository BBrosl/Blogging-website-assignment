PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

--website settings are stored here--
CREATE TABLE IF NOT EXISTS WebsiteSettings (
    id VARCHAR(10) NOT NULL PRIMARY KEY,
    value VARCHAR(50) NOT NULL
);

--default webste settings to intialize values--
INSERT INTO WebsiteSettings VALUES
('title', 'Blogging tool'),
('subtitle', 'experimental bloggin test'),
('author', 'BBBR');

--each article details are stored here--
CREATE TABLE IF NOT EXISTS BlogArticle (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(50) NOT NULL,
    subtitle VARCHAR(50) NULL,
    body TEXT NOT NULL,
    time_made DATETIME NOT NULL,
    time_edited DATETIME NULL,
    published DATETIME NULL
);

--details and data for comments--
CREATE TABLE IF NOT EXISTS Comment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    IDarticle INT NOT NULL,
    body_comment TEXT NOT NULL,
    commentMadeTime DATETIME NOT NULL,
    FOREIGN KEY (IDarticle) REFERENCES BlogArticle(id) ON DELETE CASCADE
);

--likes managed here, GUID to prevent users from likeing more than once--
CREATE TABLE IF NOT EXISTS ArticleReaction (
    IDarticle INT NOT NULL,
    userUniqueID GUID NOT NULL,
    PRIMARY KEY (IDarticle, userUniqueID),
    FOREIGN KEY (IDarticle) REFERENCES BlogArticle(id) ON DELETE CASCADE
);



COMMIT;