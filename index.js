var IronWorker = module.exports = {};
var http = require("http");
var utils = require("util");
var fs = require("fs");
var _request = require("request");
var multi = require("multiparter");

IronWorker.DEFAULT_PORT = 80;
IronWorker.DEFAULT_HOST = "worker-aws-us-east-1.iron.io";
IronWorker.init = function(host, port, version, token, protocol) {
    if(protocol === undefined || protocol === null)
        protocol = "http";
    if(host === undefined || host === null)
        host = IronWorker.DEFAULT_HOST;
    if(port === undefined || port === null)
        port = IronWorker.DEFAULT_PORT;
    
    IronWorker.url = protocol + "://"+host+":"+port+"/"+version+"/";
    console.log("url = " + IronWorker.url);
    IronWorker.token = token;
    IronWorker.version = version;
    IronWorker.project_id = '';
    IronWorker.headers = {};
    IronWorker.headers['Accept'] = "application/json";
    IronWorker.headers['Accept-Encoding'] = "gzip, deflate";
    IronWorker.headers['User-Agent'] = "IronWorker: Node-Ironworker v0.1";
    IronWorker.web_client = http.createClient();   
};


IronWorker.__set_common_headers = function() {
    IronWorker.headers = {
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate",
        "User-Agent": "IronWorker Node-IronWorker v0.1",
    };    
}

IronWorker.__merge_headers = function(base, new_headers) {
    var cloned = {};
    for (var attrname in base) { cloned[attrname] = base[attrname]; }
    for (var attr_name in new_headers) { cloned[attr_name] = new_headers[attr_name]; }
    return cloned;
};

IronWorker.__get = function(url, headers, data, cb) {
    if(headers === undefined || headers === null)
        headers = {};
    IronWorker.__set_common_headers();
    var combined_headers = IronWorker.__merge_headers(IronWorker.headers, headers);
    console.log("_get headers: " + utils.inspect(combined_headers));
     _request.get({url: url, headers:combined_headers, json:data}, function(err, res, data) {
        console.log(data);
        cb(data);
     });
};


IronWorker.__post = function(url, headers, data, cb) {
    if(headers === undefined || headers === null)
        headers = {};
    IronWorker.__set_common_headers();
    var combined_headers = IronWorker.__merge_headers(IronWorker.headers, headers);
    console.log("_get headers: " + utils.inspect(combined_headers));
     _request.post({url: url, headers:combined_headers, json:data}, function(err, res, data) {
        cb(data);
     });
};

IronWorker.__del = function(url, headers, data, cb) {
    if(headers === undefined || headers === null)
        headers = {};
    
    var combined_headers = IronWorker.__merge_headers(IronWorker.headers, headers);
    console.log("_del url: " + url);
    console.log("_del headers: " + utils.inspect(combined_headers));
    _request.del({url: url, headers: combined_headers, json:data}, function(err, res, data) {
        console.log(data);
        cb(data);
     });
}

IronWorker.getTasks = function(project_id) {
    IronWorker.__set_common_headers();
    if(project_id === undefined || project_id === null)
        project_id = IronWorker.project_id;
        
    var url = IronWorker.url + 'projects/' +project_id+'/tasks?oauth=' + IronWorker.token;
    
    IronWorker.__get(url, {}, null, function(data) {
        return JSON.parse(data).tasks;
    });    
};

IronWorker.getProjects = function() {
    IronWorker.__set_common_headers();
    var url = IronWorker.url + 'projects?oauth=' + IronWorker.token;
    IronWorker.__get(url, {}, null, function(data) {
        return JSON.parse(data).projects;
    });
};

IronWorker.setProject = function(project_id) {
    IronWorker.project_id = project_id;    
};

IronWorker.getProjectDetails = function(project_id) {
    IronWorker.__set_common_headers();
    if(project_id === undefined || project_id === null)
        project_id = IronWorker.project_id;
        
    var url =  IronWorker.url + 'projects/'+project_id+'?oauth=' + IronWorker.token;
    IronWorker.__get(url, {}, null, function(data) {
        return JSON.parse(data);
    });
};

IronWorker.getCodes = function(project_id) {
    IronWorker.__set_common_headers();
    if(project_id === undefined || project_id === null)
        project_id = IronWorker.project_id;
    
    var url = IronWorker.url + 'projects/'+project_id+'/codes?oauth=' + IronWorker.token;
    IronWorker.__get(url, {}, null, function(data) {
        console.log("getCodes body: " + data);
        return JSON.parse(data).codes;
    });
};

IronWorker.getCodeDetails = function(code_id) {
      IronWorker.__set_common_headers();
      var project_id = IronWorker.project_id;
      var url = IronWorker.url + 'projects/' + project_id + '/codes/'+code_id+'?oauth=' + IronWorker.token;
      console.log("getCodeDetails, url = " + url);
      IronWorker.__get(url, {}, null, function(data) {
            return JSON.parse(data);
      });
};

IronWorker.postCode = function(project_id, name, runFilename, zipFilename) {
     if(project_id === undefined || project_id === null)
        project_id = IronWorker.project_id;
     var url = '/2/projects/'+ project_id + '/codes?oauth=' + IronWorker.token;
     var raw_data = {
            'name': name,
            'runtime': "python",
            'file_name': runFilename,
            'oauth': IronWorker.token,
     };
     
     var data = JSON.stringify(raw_data); 
    
     var headers = {
        'Accept':'application/json',
        'Accept-Encoding':'gzip,deflate',
        'User-Agent': 'NodeClient'
     };
     
     var request = new multi.request(http, {
        host: IronWorker.DEFAULT_HOST,
        port: 80,
        path: url,
        method: "POST"
     });
     
     request.setParam("name", name);
     request.setParam("runtime", "python");
     request.setParam("file_name", runFilename);
     request.setParam("oauth", IronWorker.token);
     
     var stream = fs.createReadStream(zipFilename);
     
     fs.stat(zipFilename , function(err,stat) {
         request.addStream("file", zipFilename, "application/zip", stat.size, stream);
         request.send(function(err, response) {
                    var data = "";
                    response.setEncoding("utf8");
                    response.on("data", function(chunk) {
                        data += chunk;
                    });
                    response.on("end", function() {
                        console.log("Data: " + data);
                    });
                    response.on("error", function(error) {
                        console.log(error);
                    });    
         });
     });
};

IronWorker.postProject = function(name) {
    IronWorker.__set_common_headers();
    var url = IronWorker.url + 'projects?oauth=' + IronWorker.token;
    var payload = [{name: name, class_name: name, access_key: name}];
    var timestamp = new Date();
    var data = {name: name};
        data = JSON.stringify(data);
    var data_len = data.length;
    var headers = IronWorker.headers;
        headers['Content-Type'] = "application/json";
        headers['Content-Length'] = data_len;
        
        IronWorker.__post(url, headers, data, function(response) {
            return JSON.parse(response).id;
        });
};

IronWorker.deleteProject = function(project_id) {
    IronWorker.__set_common_headers();
    if(project_id === undefined || project_id === null)
        project_id = IronWorker.project_id;
    var url = IronWorker.url + 'projects/' + project_id + '?oauth=' + IronWorker.token;
    console.log("deleteProject url = " + url);
    
    IronWorker.__del(url, {}, function(data) {
        console.log('OnDelete: ' + data);
    });
};

IronWorker.deleteCode = function(project_id, code_id) {
    IronWorker.__set_common_headers();
    if(project_id === undefined || project_id === null)
        project_id = IronWorker.project_id;
    var url = IronWorker.url + 'projects/' + project_id + '/codes/'+code_id+'?oauth=' + IronWorker.token;
    console.log("deleteCode url = " + url);
    
    IronWorker.__del(url, {}, function(data) {
        console.log('OnDelete: ' + data);
    });
};

IronWorker.deleteTask = function(project_id, task_id) {
    IronWorker.__set_common_headers();
    if(project_id === undefined || project_id === null)
        project_id = IronWorker.project_id;
    var url = IronWorker.url + 'projects/' + project_id + '/tasks/'+task_id+'?oauth=' + IronWorker.token;
    console.log("deleteTask url = " + url);
    
    IronWorker.__del(url, {}, function(data) {
        console.log('OnDelete: ' + data);
    });
};

IronWorker.deleteSchedule = function(project_id, schedule_id) {
    IronWorker.__set_common_headers();
    if(project_id === undefined || project_id === null)
        project_id = IronWorker.project_id;
    var url = IronWorker.url + 'projects/' + project_id + '/schedules/'+schedule_id+'?oauth=' + IronWorker.token;
    console.log("deleteTask url = " + url);
    
    IronWorker.__del(url, {}, function(data) {
        console.log('OnDelete: ' + data);
    });
};

IronWorker.postSchedule = function(project_id, name, delay) {
    IronWorker.__set_common_headers();
    if(project_id === undefined || project_id === null)
        project_id = IronWorker.project_id;
    var url = IronWorker.url + 'projects/'+project_id+'/schedules?oauth='+ IronWorker.token;
    var timestamp = new Date();
    var schedules = [{delay: delay, code_name: name}];
    var payload = {schedule: schedules[0], project_id: project_id, class_name: name,
                    options: {}, token: IronWorker.token, api_version: IronWorker.version,
                    version: IronWorker.version, timestamp: timestamp, oauth: IronWorker.token, access_key: name, delay: delay};
    var options = {project_id: project_id, class_name: name,
                    options: {}, token: IronWorker.token, api_version: IronWorker.version,
                    version: IronWorker.version, timestamp: timestamp, oauth: IronWorker.token, access_key: name, delay: delay};
    var data = {schedules: schedules};
    data = JSON.stringify(data);
    console.log("data: " + data);
    var data_length = data.length;
    var headers = IronWorker.headers;
    headers['Content-Type'] = "application/json";
    headers['Content-Length'] = data_length;
    headers['Accept'] = "application/json";
    
    IronWorker.__post(url, headers, data, function(data) {
         return JSON.parse(data).schedules[0].id;
    });    
};

IronWorker.postTask = function (project_id, name, payload) {
    if(project_id === undefined || project_id === null)
        project_id = IronWorker.project_id;
    
    var url = IronWorker.url + 'projects/'+project_id+'/tasks?oauth='+ IronWorker.token;
    var data = {
        tasks: [{
            code_name: name,
            payload: payload,
        }]
    };
    
    IronWorker.__post(url, {}, data, function(_data) {
            console.log(_data);
            return JSON.parse(_data);
    });
};


IronWorker.getLog = function(project_id, task_id) {
    IronWorker.__set_common_headers();
    var url = IronWorker.url + 'projects/' + project_id + '/tasks/' + task_id + '/log/?oauth=' + IronWorker.token;
    var headers = {Accept: "text/plain"};
    delete IronWorker.headers['Content-Type'];
    delete IronWorker.headers['Content-Length'];
    IronWorker.__get(url, headers, null, function(data) {
        return data;
    });
};
