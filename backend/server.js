const express = require("express");
const router = express.Router();
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "pass888",
    database: "signup",
})

db.connect(function(err) {
    if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return;
    }
    console.log('Connected to the database as id ' + db.threadId);
});

app.post('/signup', (req, res) => {
    console.log(req.body);
    const checkSql = "SELECT * FROM users WHERE email = ?";
    db.query(checkSql, [req.body.email], (err, data) => {
        if (err) {
            console.error('Error executing query: ' + err.stack);
            return res.json("Error");
        }
        if (data.length > 0) {
            return res.json("You already have an account");
        } else {
            const sql = "INSERT INTO users (`id`, `name`, `email`, `password`, `role`) VALUES (?,?,?,?, 'visitor')";
            const values = [
                req.body.id,
                req.body.name,
                req.body.email,
                req.body.password
            ]
            db.query(sql, values, (err, data) => {
                if (err) {
                    console.error('Error executing query: ' + err.stack);
                    return res.json("Error");
                }
                console.log('Query executed successfully, data: ', data); 
                return res.json("Signup Success");
            });
        }
    });
});

app.post('/login', (req, res) => {
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    db.query(sql, [req.body.email, req.body.password], (err, data) => {
        if (err) {
            console.error('Error executing query: ' + err.stack);
            return res.json("Error");
        }
        if (data.length > 0) {
            const loginSql = "INSERT INTO login (`email`, `password`) VALUES (?, ?)";
            db.query(loginSql, [req.body.email, req.body.password], (loginErr, loginData) => {
                if (loginErr) {
                    console.error('Error executing query: ' + loginErr.stack);
                    return res.json("Error");
                }
                return res.json({ message: "Login Success", role: data[0].role });
            });
        } else {
            return res.json("Login Failed");
        }
    })
})


// server side get reviews
router.get("/reviews", (req, res) => {
    let sql = `SELECT * FROM reviews WHERE toiletName = ${req.params.toiletName}`;
    db.query(sql, (err, data) => {
        if (err) {
            console.error('Error executing query: ' + err.stack);
            return res.json("Error");
        } else {
            res.send(data);
        }
    })

})  

// server side add review
app.post("/reviews", (req, res) => {
    const sql = "INSERT INTO reviews (`toiletName`, `rating`, `comments`, `useremail`, `created_at`) VALUES (?, ?, ?, ?, DEFAULT)";
    db.query(sql, [req.body.toiletName, req.body.rating, req.body.comments, req.body.email], (err, data) => {
        if (err) {
            console.error('Error executing query: ' + err.stack);
            return res.json("Error");
        }

        const insertCommentsSql = "INSERT INTO comments (`id`, `toiletName`, `comments`) VALUES (?, ?, ?)";
        db.query(insertCommentsSql, [data.insertId, req.body.toiletName, req.body.comments], (insertErr, insertData) => {
            if (insertErr) {
                console.error('Error executing query: ' + insertErr.stack);
                return res.json("Error");
            }

            const updateQuery = `
                UPDATE toiletdata
                SET rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE toiletName = ?)
                WHERE toiletname = ?
            `;
            db.query(updateQuery, [req.body.toiletName, req.body.toiletName], (updateErr, updateData) => {
                if (updateErr) {
                    console.error('Error executing query: ' + updateErr.stack);
                    return res.json("Error");
                }

                const updateCommentsSql = `
                    UPDATE toiletdata
                    SET comment = COALESCE(
                        (
                            SELECT comments
                            FROM reviews
                            WHERE id = (
                                SELECT MAX(id)
                                FROM reviews
                                WHERE toiletName = toiletdata.toiletname
                            )
                        ), 'No reviews yet'
                    )
                    WHERE toiletname = ?
                `;
                db.query(updateCommentsSql, [req.body.toiletName], (err, data) => {
                    if (err) {
                        console.error('Error executing query: ' + err.stack);
                        return res.json("Error");
                    }
                    return res.json("Review Submitted, Average Rating and Comment Updated");
                });
            });
        });
    });
});

// server side delete review
router.delete("/reviews/:id", (req, res) => {
    let sql = "DELETE FROM reviews WHERE id = ?";
    db.query(sql, [req.params.id], (err, data) => {
        if (err) {
            console.error('Error executing query: ' + err.stack);
            return res.json("Error");
        }
        console.log('Query executed successfully, data: ', data); 
        return res.json("Review Deleted");
    });
})

app.get('/toiletdata', (req, res) => {
    const query = `SELECT toiletname, popUp, rating, latitude, longitude, comment FROM toiletdata`;;
    db.query(query, (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send('Server error');
      } else {
        console.log(results);
        res.json(results);
      }
    });
  });

  app.get('/updateRatings', (req, res) => {
    const query = `
        SELECT toiletName, ROUND(COALESCE(AVG(rating), 0), 1) as average_rating
        FROM reviews
        GROUP BY toiletName
    `;
    db.query(query, (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send('Server error');
      } else {
        // Update average_rating in toiletdata table
        results.forEach(result => {
          const updateQuery = `
            UPDATE toiletdata
            SET rating = ?
            WHERE toiletname = ?
          `;
          db.query(updateQuery, [result.average_rating, result.toiletName], (err, updateResult) => {
            if (err) {
              console.error(err);
            }
          });
        });
  
        res.json('Ratings updated');
      }
    });
  });

  // Get comments for a specific toilet
  app.get("/comments/:toiletName", (req, res) => {
    const { toiletName } = req.params;
    const sql = "SELECT comments, created_at FROM comments WHERE toiletName = ? ORDER BY id DESC";
    db.query(sql, [toiletName], (err, data) => {
      if (err) {
        console.error('Error executing query: ' + err.stack);
        return res.json("Error");
      }
      console.log('Query executed successfully, data: ', data); 
  
      // Process the data to return an array of comments
      const comments = data
        .filter(comment => comment.comments && comment.comments.trim() !== '') // filter out blank comments
        .map(comment => comment);
      return res.json(comments);
    });
});

  app.post('/reports', (req, res) => {
    const { toiletName, comments } = req.body;
  
    const query = 'INSERT INTO reports (toiletname, details, useremail, status) VALUES (?, ?, ?, ?)';
    const values = [toiletName, comments, req.user?.email, 'unsolved']; // Use req.user?.email directly
  
    db.query(query, values, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while inserting the report' });
      } else {
        res.status(200).json({ message: 'Report inserted successfully' });
      }
    });
  });

  app.get('/reports', (req, res) => {
    const sql = 'SELECT idcolumn, toiletname, details, status FROM reports';
    db.query(sql, (err, data) => {
      console.log('Data: ', data);
      if (err) {
        console.error('Error executing query: ' + err.stack);
        return res.status(500).json({ error: 'An error occurred while fetching the reports' });
      }
      return res.json(data);
    });
  });

  app.put('/reports/:id', (req, res) => {
    const { newStatus } = req.body;
    const { id } = req.params;
  
    const query = 'UPDATE reports SET status = ? WHERE idcolumn = ?';
    const values = [newStatus, id];
  
    db.query(query, values, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while updating the status' });
      } else if (result.affectedRows === 0) {
        res.status(404).json({ error: 'No report found with the given id' });
      } else {
        res.status(200).json({ message: 'Status updated successfully' });
      }
    });
  });
  
app.listen(8081, () => {
    console.log("listening");
})