const express = require("express");
const router = express.Router();
var elastic = require("../connection");

/* GET home page. */
router.get("/", function (req, res, next) {

  let keyword = req.query.keyword ||"";
  let radioVal = req.query.radioVal ||"전체";  //전체 , 제목, 본문
  let hosSelect = req.query.hosSelect || "all";  //병원종류에 따라
  let sortSelect = req.query.sortSelect || "asc"; //날짜 오름차순 내림차순 sort
  let pagingSize = req.query.pagingSize || 10 ; // 10, 20 30 개씩  // 페이징 -> size , from
  const pagingFrom = req.query.pagingFrom || 0;     // 누르는 숫자
  //multi Fields
  let multiFields = [];
  let from;

  if( pagingFrom > 0){
    from = (pagingFrom -1 ) * pagingSize;
  }
  // radioval title, contents, 전체 비교할때
  if (radioVal === "title") {
      multiFields = ["title.kobrick"];
  } else if (radioVal === "contents") {
      multiFields = ["contents.kobrick"];
  } else { multiFields = ["title.kobrick","contents.kobrick"]; }
  
  //전체 검색 다시다시~~~~
  const body = {
    query: {
      bool: {
        must: [],
        filter: []
      }
    },
    sort: [],
    highlight : { fields : { "title.*" : {}}},
    _source : [ "article_no" , "title" , ",riter_nm", "last_updt_dt" ], //
    size: pagingSize,
    from: from,
    aggs: {
      m_site_cod: {
        terms: {
          field: "m_site_cd"
        }
      }
    }
  }
  // hosSelect 가 전체 일때 아닐때
  if( hosSelect !== "all"){
    body.query.bool.filter.push({
      term: { m_site_cd: hosSelect }
    }),
    body.query.bool.must.push({
      multi_match: { query : keyword, fields : multiFields }
    }),
    body.sort.push({
      last_updt_dt :{ order : sortSelect}
    })
  } else {
    body.query.bool.must.push({
      multi_match: { query : keyword, fields : multiFields }
    })
  }
  console.log(JSON.stringify(body));
  try {
      elastic
          .search({
              index: "praboard-0002",
              body: body,
          })
          .then((resp) => {
              const result = {
              list: resp.body.hits.hits.map((data) => {
                  let high = data.highlight;

                  if(data.highlight !== undefined) {
                    if( data.highlight["title.kobrick"] !== undefined || data.highlight["title.standard"] !== undefined){
                      if( data.highlight["title.kobrick"] === ""){
                        data._source.title = data.highlight["title.standard"]
                      } else { data._source.title = data.highlight["title.kobrick"]}
                      
                      return data._source;
                    }
                  }
                  return data._source;
              }),
              aggs: resp.body.aggregations.m_site_cod.buckets.map((data) => {
                  return data;
              }),
              sort: resp.body.hits.hits.map((data) => {
                  return data;
              }),
              totalSize: resp.body.hits.total.value,
          };
          console.log("resp : " + JSON.stringify(result));
          res.render('pra_board',{ keyword: keyword, data: result, hosSelect :hosSelect,sortSelect:sortSelect, pagingSize:pagingSize, pagingFrom:pagingFrom, radioVal:radioVal
            });
          })
          .catch((err) => {
              console.log(err);
          });
      } catch (error) {
          console.log(error);
      }
  });
/* POST render */
router.post("/",function ( req, res, next){

    let keyword = req.body.keyword ||"";
    let radioVal = req.body.radioVal ||"전체";  //전체 , 제목, 본문
    let hosSelect = req.body.hosSelect || "all";  //병원종류에 따라
    let sortSelect = req.body.sortSelect || "asc"; //날짜 오름차순 내림차순 sort
    let pagingSize = req.body.pagingSize || 10 ; // 10, 20 30 개씩  // 페이징 -> size , from
    const pagingFrom = req.body.pagingFrom || 0;     // 누르는 숫자
    //multi Fields
    let multiFields = [];
    let from;

    if( pagingFrom > 0){
      from = (pagingFrom -1 ) * pagingSize;
    }
    // radioval title, contents, 전체 비교할때
    if (radioVal === "title") {
        multiFields = ["title.kobrick"];
    } else if (radioVal === "contents") {
        multiFields = ["contents.kobrick"];
    } else { multiFields = ["title.kobrick","contents.kobrick"]; }
    
    //전체 검색 다시다시~~~~
    const body = {
      query: {
        bool: {
          must: [],
          filter: []
        }
      },
      sort: [],
      highlight : { fields : { "title.*" : {}}},
      _source : [ "article_no" , "title" , ",riter_nm", "last_updt_dt" ], //
      size: pagingSize,
      from: from,
      aggs: {
        m_site_cod: {
          terms: {
            field: "m_site_cd"
          }
        }
      }
    }
    // hosSelect 가 전체 일때 아닐때
    if( hosSelect !== "all"){
      body.query.bool.filter.push({
        term: { m_site_cd: hosSelect }
      }),
      body.query.bool.must.push({
        multi_match: { query : keyword, fields : multiFields }
      }),
      body.sort.push({
        last_updt_dt :{ order : sortSelect}
      })
    } else {
      body.query.bool.must.push({
        multi_match: { query : keyword, fields : multiFields }
      })
    }
    console.log(JSON.stringify(body));
    try {
        elastic
            .search({
                index: "praboard-0002",
                body: body,
            })
            .then((resp) => {
                const result = {
                list: resp.body.hits.hits.map((data) => {
                    let high = data.highlight;

                    if(data.highlight !== undefined) {
                      if( data.highlight["title.kobrick"] !== undefined || data.highlight["title.standard"] !== undefined){
                        if( data.highlight["title.kobrick"] === ""){
                          data._source.title = data.highlight["title.standard"]
                        } else { data._source.title = data.highlight["title.kobrick"]}
                        
                        return data._source;
                      }
                    }
                    return data._source;
                }),
                aggs: resp.body.aggregations.m_site_cod.buckets.map((data) => {
                    return data;
                }),
                sort: resp.body.hits.hits.map((data) => {
                    return data;
                }),
                totalSize: resp.body.hits.total.value,
            };
            console.log("resp : " + JSON.stringify(result));
            res.render('pra_board',{ keyword: keyword, data: result, hosSelect :hosSelect,sortSelect:sortSelect, pagingSize:pagingSize, pagingFrom:pagingFrom, radioVal:radioVal
              });
            })
            .catch((err) => {
                console.log(err);
            });
        } catch (error) {
            console.log(error);
        }
    });
    module.exports = router;
