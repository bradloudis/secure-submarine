const express = require('express');
const pool = require('../modules/pool');
const {
  rejectUnauthenticated,
} = require('../modules/authentication-middleware');
const router = express.Router();

router.get('/', rejectUnauthenticated, (req, res) => {
  console.log('req.user:', req.user);
  // selecting row of user table that matches id of the user that is logged in using req.user.id in the query below
  const queryUserRole = `SELECT * FROM "user" WHERE id=$1`;
  // GET route code here

  pool
    .query(queryUserRole, [req.user.id])
    .then((response) => {
      console.log('response', response);
      // extracting the clearance level from the dbResponse to be used in next query
      const clearanceLevel = response.rows[0].clearance_level;

      const queryText = `SELECT *
      FROM "secret"
      WHERE "secret".secrecy_level < $1
      ORDER BY id ASC;`;

      pool
        .query(queryText, [clearanceLevel])
        .then((responseSecret) => {
          console.log('responseSecret', responseSecret);
          res.send(responseSecret.rows);
        })
        .catch((err) => {
          console.log(err);
          res.sendStatus(500);
        });
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

module.exports = router;
