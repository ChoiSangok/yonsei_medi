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

  const body = [];
  const indexList = util.indexList(hosSelect);
  indexList.map( index_se =>{
    let index = {index : index_se}
    let queryBody = {
      query:{
        bool:{
          must:[],
          filter:[]
        }
      },
      _source:[],
      size:pagingSize
    }
    let fields = util.searchFields(index_se);
    queryBody.query.bool.must.push(util.multi_match(keyword, fields));

    if(index_se === "pradiss-0003"){
      queryBody.query.bool.filter.push(util.filter("dept.m_site_cd", hosSelect))
      queryBody.highlight = {
        fields :{
          "contents.*": {},
          "recommend_keyword": {},
          "related_keyword": {}
        }
      }
    }
    else if(index_se === "pradept-0001") {
      queryBody.query.bool.filter.push(util.filter("m_site_cd",hosSelect))
    }
    queryBody._source = util.source(index_se);
    body.push(index);
    body.push(queryBody);

  })
  console.log(JSON.stringify(body));

  try{
    elastic
      .msearch({
        body:body
      })
      .then((resp) => {
        const result = {};
        const list = ["pradiss","pradoctor","pradept"];

        const listResponses = resp.body.responses;
        for ( let i =0;i<listResponses.length; i++) {
          if( list[i] === "pradiss") {
              result[list[i]]=listResponses[i].hits.hits.map((data) => {
                  if( data.highlight !== undefined){
                      if( data.highlight["contents.kobrick"] !==undefined || data.highlight["contents.standard"] !== undefined){
                          if(data.highlight["related_keyword"] !=="" || data.highlight["recommend_keyword"] !== ""){
                              if( data.highlight["contents.kobrick"] ===""){
                                  data._source.contents = data.highlight["contents.standard"]
                              } else {data._source.contents = data.highlight["contents.kobrick"]; }
                              data._source.recommend_keyword = data.highlight["recommend_keyword"];
                              data._source.related_keyword = data.highlight["related_keyword"];
                              return data._source;
                          }
                      }
                  }
                  return data._source;
              })
          }
          else {
              result[list[i]]=listResponses[i].hits.hits.map((data) => {
                  return data._source;
              })
          }
      }
      console.log("result : " + JSON.stringify(result));
      res.render('msearch',{data:result, keyword:keyword, hosSelect:hosSelect, pagingSize:pagingSize});
    })
  }
  catch( error ){
    console.log(error);
  }
});

router.post('/', function(req, res, next) {
  let keyword =req.body.keyword || "";
  let hosSelect = req.body.hosSelect || "sev";
  let pagingSize = req.body.pagingSize || 10;

  const body = [];
  const indexList = util.indexList(hosSelect);
  indexList.map( index_se =>{
    let index = {index : index_se}
    let queryBody = {
      query:{
        bool:{
          must:[],
          filter:[]
        }
      },
      _source:[],
      size:pagingSize
    }
    let fields = util.searchFields(index_se);
    queryBody.query.bool.must.push(util.multi_match(keyword, fields));

    if(index_se === "pradiss-0003"){
      queryBody.query.bool.filter.push(util.filter("dept.m_site_cd", hosSelect))
      queryBody.highlight = {
        fields :{
          "contents.*": {},
          "recommend_keyword": {},
          "related_keyword": {}
        }
      }
    }
    else if(index_se === "pradept-0001") {
      queryBody.query.bool.filter.push(util.filter("m_site_cd",hosSelect));
      queryBody.highlight = {
        fields :{
          "intrcn.*":{}
        }
      }
    }
    else if(index_se === "pradoctor-0001"){
      queryBody.highlight = {
        fields :{
          "clnic_realm.*": {}
        }
      }
    }
    queryBody._source = util.source(index_se);
    body.push(index);
    body.push(queryBody);

  })
  console.log(JSON.stringify(body));

  try{
    elastic
      .msearch({
        body:body
      })
      .then((resp) => {
        const result = {};
        const list = ["pradiss","pradoctor","pradept"];

        const listResponses = resp.body.responses;
        for ( let i =0;i<listResponses.length; i++) {
          if( list[i] === "pradiss") {
              result[list[i]]=listResponses[i].hits.hits.map((data) => {
                  if( data.highlight !== undefined){
                      if( data.highlight["contents.kobrick"] !==undefined || data.highlight["contents.standard"] !== undefined){
                          if(data.highlight["related_keyword"] !=="" || data.highlight["recommend_keyword"] !== ""){
                              if( data.highlight["contents.kobrick"] ===""){
                                  data._source.contents = data.highlight["contents.standard"]
                              } else {data._source.contents = data.highlight["contents.kobrick"]; }
                              data._source.recommend_keyword = data.highlight["recommend_keyword"];
                              data._source.related_keyword = data.highlight["related_keyword"];
                              return data._source;
                          }
                      }
                  }
                  return data._source;
              })
          }
          if( list[i] === "pradept"){
            result[list[i]]=listResponses[i].hits.hits.map((data) => {
              if(data.highlight !== undefined){
                if( data.highlight["intrcn.kobrick"] !== undefined || data.highlight["intrcn.standard"] !== undefined){
                  if(data.highlight["intrcn.kobrick"] === ""){
                    data._source.intrcn = data.highlight["intrcn.standard"]
                  } else{
                    data._source.intrcn = data.highlight["intrcn.kobrick"]
                  }
                  return data._source
                }
              }
              return data._source
            })
          }
          if( list[i] === "pradoctor"){
            result[list[i]] = listResponses[i].hits.hits.map((data) => {
              if(data.highlight !== undefined) {
                if(data.highlight["clnic_realm.kobrick"] !== undefined || data.highlight["clnic_realm.standard"] !== undefined){
                  if(data.highlight["clnic_realm.kobrick"] === "") {
                    data._source.clnic_realm = data.highlight["clnic_realm.standard"]
                  } else {
                    data._source.clnic_realm = data.highlight["clnic_realm.kobrick"]
                  }
                  return data._source
                }
              }
              return data._source
            })
          }
          else {
            result[list[i]]=listResponses[i].hits.hits.map((data) => {
                return data._source;
            })
        }
      }
      console.log("result : " + JSON.stringify(result));
      res.render('msearch',{data:result, keyword:keyword, hosSelect:hosSelect, pagingSize:pagingSize});
    })
  }
  catch( error ){
    console.log(error);
  }
});
module.exports = router;
