var exec = require("child_process").exec;
var pg = require("pg");  // PostgreSQL client library

// this should be used anytime we need to connect to the DB
var CONNSTRING = "postgres://postgres:wearetapvote@localhost/tapvotetest";

function index(response, postData) {
    console.log("[INFO] Request handler 'index' was called.");
    exec("ls -lah", function (error, stdout, stderr) {
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write(stdout);
        response.end();
    });
}

function vote(response, postData) {
    //Test this endpoint with curl -d '{"vote": "a"}' -H "Content-Type: application/json" http://localhost:8000/vote
    console.log("[INFO] Request handler 'vote' was called.");

    try {
        data = JSON.parse(postData);
    } catch (err) {
        response.writeHead(400, {"Content-Type": "text/plain"});
        response.write("400 Bad Request");
        response.end();
    }
    response.writeHead(200, {"Content-Type": "text/plain"});

    //Echo back the postData for now
    response.write(postData);

    console.log("[INFO] Incoming vote: " + data['vote']);

    // pg.connect uses the pg library's built-in connection pool (client refers to the current connection)
    pg.connect(CONNSTRING, function(err, client, done) {
        if(err) {
            return console.log("[ERROR] Couldn't fetch a client from the Postgres connection pool.", err);
        };

        client.query("INSERT INTO test(vote) VALUES($1)", [data['vote']], function(err, results) {
            done(); // called to release the client back into the connection pool
            
            if(err) {
                return console.log("[ERROR] Error running query.", err);
            }

            console.log("[INFO] Logged vote " + data['vote'] + " to database.");
        });
    });
    
    response.end();
}

exports.index = index;
exports.vote = vote;
