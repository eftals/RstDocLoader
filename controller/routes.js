 

var mongoose = require('mongoose'),
	models = require('../models/doc.js'),	
    DOCS = mongoose.model('DOC'),
	crypto = require('crypto'),
	config = require('../config/config.js'),
	formidable = require('formidable'),
    fs = require('fs-extra'),
    util = require('util');

    
//create connection
mongoose.connect(config.db)
	.connection
	.on('error',	//bind to connection errors 
		function(err) {
			console.log('Connection error: ', err);
			});
			
  //privates
 function insertDoc(data, token)
 {
 	newDoc = new DOCS ({
 		name: data.name,
 		folder: data.folder,
 		guid: token
 		});	
 	newDoc.save(function (err) {
    	if (err) {
    		console.log("Insert error.", err);
    		return handleError(err);
    	}
    });  
 }

 //publics
module.exports =  {
 
 	 /*action 1 - register a file to copy over
 	   post expects login/pwd and folder/name of file to copy
 	   file meta data is persisted in MONGO
 	   it returns a configurable length random HEX
 	   TODO1: client should encipher the POST using AES256 KEY and IV
 	   and this program should decipher it before JSON.PARSE
 	   TODO2: encipher the returned GUID
 	 */
	 register : function register(req, res, next)
	 {
	 	 if (req.method == 'POST') {
	        var body = '';
	        req.on('data', function (data) {
	            body += data;
	            console.log(body);
	        });
	        req.on('end', function () {
	            var reqData = JSON.parse(body);
	            if (reqData.username == config.username &&
	            	reqData.password == config.password)
	            {
	 				var token = crypto.randomBytes(config.cryptolen).toString('hex');
	 				insertDoc(reqData, token);
	 				res.send(token);
	 			} else 
	 				res.send(404,"Not found.");	       
			});
		}	 		 
	 },
 
 	/*action 2 - upload file with GUID received from action 1
 	  GUID is used to find the persisted file meta data
 	  file is than copied to location / filename from step 1
 	  TODO1: encipher / decipher the GUID and return data 	
 	  TODO2: do not copy document if more than X seconds (add to config) has passed
 	  TODO3: add a timer tick that expires old docs 
 	*/
	upload_file:  function upload_file(req, res) { 
 		console.log('receiving');
  		var form = new formidable.IncomingForm();

		var GUID;
				
		//parse asynch
    	form.parse(req, function(err, fields, files) {
 			if (err) {
 				console.log("Error parsing form.");
 				res.send(404, "Problem parsing request.");
 			}
 			//keep guid	
 			GUID = fields.GUID;	
 		});
    	
    	//copy file on end of file read
    	form.on('end', function(err, fields, files) {
        	/* Temporary location of our uploaded file */
        	var temp_path = this.openedFiles[0].path;
        	/* The file name of the uploaded file */
        	var file_name = this.openedFiles[0].name;        	
        	       	
        	DOCS.findOne({"guid" : GUID},function(err, targetDoc) {
	 			if (err){
	 					console.log("Doc doesn't exist!");
	 					res.send(404, "Problem parsing request.");
	 				}
	 			console.log("found doc", targetDoc);
	 			var new_location = targetDoc.folder;
	        	fs.copy(temp_path, new_location + targetDoc.name, function(err) {  
	            	if (err) {
	                	console.error(err);
	                	res.send(404, "Problem copying.");
	            	} else {
	                	console.log("Success");
	                	res.send("Success");
	            	}
	        	});
 			}); 	      	        
    	});
 	}
};