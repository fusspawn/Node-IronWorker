var IronWorker = require("./index.js");
IronWorker.init(null, null, 2, "QiVQ0a-e9qvhLLS5cpAr6j1Suvc", "http"); 

console.log("Code Section: Running.. ");
console.log("Code: List");
IronWorker.postCode("4f147067b21c5304f10002a1", "HelloWorker-python", "hello_worker.py", "./hello_worker.zip");
//IronWorker.postTask("4f147067b21c5304f10002a1", "HelloWorker-python");