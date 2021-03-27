const express = require("express");
const router = express.Router();
var elastic = require("../connection");

/* GET home page. */
router.get("/", function (req, res, next) {

    let keyword = req.query.keyword || "";
    let hosSelect = req.query.hosSelect || "세브란스병원"; //병원선택, sev, gs, yuhs, dental
    let pagingSize = req.query.pagingSize || 10;

    const body ={
        query: {
            bool: {
                must: [ { multi_match: { query: keyword, fields: ["contents.kobrick","contents.standard","related_keyword","recommend_keyword","es_key"]}} ],
                filter: []
            }
        },
        highlight: {
            fields: { "contents.*":{}, "recommend_keyword": {}, "related_keyword": {} }
        }, 
        _source: ["contents","writer_nm","title","es_key"],
        size : pagingSize,
        from :0
        ,aggs: {
            dept_aggs: {
                terms: {
                    field: "dept.m_site_cd"
                }
            }
        }
    }
    if(hosSelect !== "sev"){
        body.query.bool.filter.push({
            term:{ "dept.m_site_cd":hosSelect} //m_site_code에 따라
        })
    } else{
        body.query.bool.filter.push({
            term:{ "dept.m_site_cd" : hosSelect}
        })
    }
    console.log(JSON.stringify(body));
    try{
        elastic
            .search({
                index: "pradiss-0003",
                body:body
            })
            .then((resp) => {
                const result = {
                    list:resp.body.hits.hits.map((data) => { 
                        //highlight
                        let high =data.highlight;
                        let es_key = data._source.es_key;

                        let select=[high["contents.kobrick"], high["contents.standard"]];

                        for( let i =0;i< select.length; i++){
                            if( high["contents.kobrick"] !== "" || high["contents.standard"] !== "") {
                                if(high["related_keyword.my_analyzer"] !== "" || high["recommend_keyword.my_analyzer"] !== ""){
                                    data._source.contents = select[i];
                                    data._source.recommend_keyword = high["recommend_keyword"];
                                    data._source.related_keyword = high["related_keyword"];
                                    return data._source;
                                }
                            } else {
                                return data._source;
                            }
                        }
                    }),
                    aggs: resp.body.aggregations.dept_aggs.buckets.map((data) => {
                        return data.doc_count;
                    }),
                    


                };
                console.log("resp : " + JSON.stringify(result));
                res.render('pra_diss', { data:result, keyword:keyword, hosSelect:hosSelect, pagingSize:pagingSize });
            })
    } catch (error) {
        console.log(error);
    }
});

/* POST render */
router.post("/",function ( req, res, next){

    let keyword = req.body.keyword || "";
    let hosSelect = req.body.hosSelect || "sev"; //병원선택, sev, gs, yuhs, dental
    let pagingSize = req.body.pagingSize || 10;

    const body ={
        query: {
            bool: {
                must: [ { multi_match: { query: keyword, fields: ["contents.kobrick","contents.standard","related_keyword","recommend_keyword","es_key"]}} ],
                filter: []
            }
        },
        highlight: {
            fields: { "contents.*":{}, "recommend_keyword": {}, "related_keyword": {} }
        }, 
        _source: ["contents","writer_nm","title","es_key"],
        size : pagingSize,
        from :0
        ,aggs: {
            dept_aggs: {
                terms: {
                    field: "dept.m_site_cd"
                }
            }
        }
    }
    if(hosSelect !== "sev"){
        body.query.bool.filter.push({
            term:{ "dept.m_site_cd":hosSelect} //m_site_code에 따라
        })
    } else{
        body.query.bool.filter.push({
            term:{ "dept.m_site_cd" : hosSelect}
        })
    }
    console.log(JSON.stringify(body));
    try{
        elastic
            .search({
                index: "pradiss-0003",
                body:body
            })
            .then((resp) => {
                const result = {
                    list:resp.body.hits.hits.map((data) => { 
                        //highlight
                        let high =data.highlight;
                        let select=[high["contents.kobrick"], high["contents.standard"]];

                        for( let i =0;i< select.length; i++){
                            if( high["contents.kobrick"] !== "" || high["contents.standard"] !== "") {
                                if(high["related_keyword.my_analyzer"] !== "" || high["recommend_keyword.my_analyzer"] !== ""){
                                    data._source.contents = select[i];
                                    data._source.recommend_keyword = high["recommend_keyword"];
                                    data._source.related_keyword = high["related_keyword"];
                                    return data._source;
                                }
                            } else {
                                return data._source;
                            }
                        }
                    }),
                    aggs: resp.body.aggregations.dept_aggs.buckets.map((data) => {
                        return data.doc_count;
                    }),
                };
                console.log("resp : " + JSON.stringify(result));
                res.render('pra_diss', { data:result, keyword:keyword, hosSelect:hosSelect, pagingSize:pagingSize });
            })
    } catch (error) {
        console.log(error);
    }
});
module.exports = router;
