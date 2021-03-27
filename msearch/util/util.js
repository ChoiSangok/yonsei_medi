const query = {
    //index
    indexList : (hosSelect) => {
        switch(hosSelect){
            case "sev":
            case "gs":
            case "yi":
            case "dental":
            return ["pradiss-0003", "pradoctor-0001", "pradept-0001"]
        }
    },
    multi_match:(keyword, fields) =>{
        return {
            multi_match:{
                query:keyword,
                fields: fields
            }
        }
    },
    searchFields: (index_se) => {
        switch(index_se) {
            case "pradiss-0003" :
                return ["title^500", "title.kobrick^100", "related_keyword^100", "recommend_keyword^50", "es_key", "dept.dept_nm", "contents.kobrick", "contents.standard"];
            case "pradept-0001":
                return ["dept_nm^500", "dept_nm.*", "diss.ko_dgnss_nm.kobrick", "diss.recommend_keyword.*", "diss.related_keyword.*", "intrcn.*"];
            case "pradoctor-0001" :
                return ["nm.*^100", "clnic_realm.*", "intrst_realm"];
        }
    },
    filter:(field, value) => {
        let query = { term : {}};
        query.term[field] = value;
        return query;
    },
    source:(index_se) => {
        switch(index_se) {
            case "pradiss-0003" :
                return ["writer_nm", "title","es_key", "dept.dept_nm","contents"];
            case "pradept-0001":
                return ["dept_nm", "diss.ko_dgnss_nm", "dept_id"];
            case "pradoctor-0001" :
                return ["nm","nm_en", "clnic_realm", "intrst_realm"];
        }
    }
}

module.exports = query