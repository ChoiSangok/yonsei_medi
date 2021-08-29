var express = require('express');
const query = require('../../msearch/util/util');
var router = express.Router();
const elastic = require("../connection");
const util = require("../util/util");


/* GET home page. */
router.get('/', function(req, res, next) {
  let keyword =req.query.keyword || "";
  let hosSelect = req.query.hosSelect || "sev";
  let pagingSize = req.query.pagingSize || 10;

  //지윰
});
module.exports = router;
