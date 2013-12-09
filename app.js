//ES: Restful File Upload Server App


var restify = require('restify'),
	config = require('./config/config.js'),
    routes = require('./controller/routes.js');
    


var server = restify.createServer({
name: 'BWDocUpload',
//TODO: uncomment below lines and specify certificate/key locations for https
//certificate: ...,
//key: ...,
}
);

console.log(routes);
server.post('/register', routes.register);
server.post('/upload', routes.upload_file);

console.log(config)
server.listen(config.port, function() {
  console.log('%s listening at %s', server.name, server.url);
});