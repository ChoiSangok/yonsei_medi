const { resolveInclude } = require("ejs");
const express = require("express");
const client = require("../connection");
const router = express.Router();
var elastic = require("../connection");

/* GET home page. */
router.get("/", function (req, res, next) {

    let keyword = req.query.keyword || "";
    let hosSelect = req.query.hosSelect || "세브란스병원"; //병원선택, sev, gs, yuhs, dental
    let pagingSize = req.query.pagingSize || 10;
    
    let id = req.query.id;

    console.log("id 값" + id);

    try{
        elastic
            .get({
                index: "pradiss-0003",
                // id값
                id : id
            })
            .then((resp) => {

                list = resp.body._source
                
                console.log("id" + resp.body._source.title);
                res.render('pra_info',{ list:list, id : id })
                // res.render('pra_info', { data:result, keyword:keyword, hosSelect:hosSelect, pagingSize:pagingSize, es_key:es_key });
            })
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;
