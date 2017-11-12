var mongodb = require('mongodb'),
    mongoClient = mongodb.MongoClient,
    express = require('express'),
    app = express(),
    bodyparser = require('body-parser');
var session = require('express-session'),
 MongoDBStore = require('connect-mongodb-session')(session);
var nodemailer = require("nodemailer");

var conn = "mongodb://localhost:27017/mean";
var store = new MongoDBStore({
    uri:"mongodb://localhost:27017/mean",
    collection:'login_session'
});

var new_db = new mongodb.Db('mean', new mongodb.Server('localhost', 27017));
new_db.open(function (err, db) {
    if(!err){
        console.log("Create Database!");
    }
    db.close();
});


app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static('assets'));
app.use(
    session({
        secret:'test_sess_secret_key',
        resave:true,
        saveUninitialized:true,
        store:store
    })
);

store.on('error', function (req, res) {
    console.log("error");
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.post("/register",function(req,res) {
	mongoClient.connect(conn, function(err, db){
        if(err){
            console.log(err);
            res.send("Error happened while connecting to the database");
        }
        else {
		console.log(req.body.username);
        if((req.body.username || req.body.email) != null)  {
            db.collection("register").findOne({ $or: [{ 'username': req.body.username}, {'email': req.body.email}]}, function(err,records) {
                if(records) {
                    console.log(records);
                    res.send("taken");
                } else {
                    db.collection("register").insert(req.body, function(err,records) {
                        res.send("success");
                })
            }
        })	
	} else {
        res.send("error");
    }
}
})
});

app.post("/login", function(req,res) {
	mongoClient.connect(conn, function(err, db){
        if(err){
            console.log(err);
            res.send("Error happened while connecting to the database");
        }
        else {
		console.log(req.body.username);
		db.collection("register").findOne(req.body, function(err,records) {
			if(records){
			req.session.loguser = records;
			res.send("success");
		}else{
			res.send("error");
		}
		db.close();
		})
	}
})
})

app.get("/profile", function(req,res) {
	mongoClient.connect(conn, function(err,db) {
		if(err){
            console.log(err);
            res.send("Error happened while connecting to the database");
        }
        else {

        	db.collection("register").find({}).toArray(function(err,records) {
        	if(records){
        		console.log(req.session.loguser.location);
        		console.log(records);
        		for(var i in records){
        		if(records[i].username == req.session.loguser.username)
        		res.send(JSON.stringify(records[i]));
        	}
				//res.send("success");
			}else{
				res.send("error");
			}
			db.close();
	        	});
        }	
	})
})


app.put("/update/:id", function(req,res) {
	mongoClient.connect(conn, function(err,db) {
		if(err){
            console.log(err);
            res.send("Error happened while connecting to the database");
        }
        else {

        	var id = req.params.id;
        	console.log("Id is "+id);
        	console.log("User is "+req.body.username);
        	var o_id =new mongodb.ObjectID(id);
        	db.collection("register").update({"_id":o_id},
        		{$set: {name: req.body.name, contact: req.body.contact,username: req.body.username,
        		password:req.body.password, location: req.body.location, contact: req.body.contact}},
    	 function (err, records) {
    	 	if(records){
    	 		req.session.loguser = records;
      	res.send('successful');
      	}
    })

        	}
        })
})


var smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: '',
        pass: ''
    },
    tls: {rejectUnauthorized: false},
    debug:true
});


/*------------------SMTP Over-----------------------------*/

/*------------------Routing Started ------------------------*/


app.get('/send',function(req,res){
	var mailOptions={
		from:'"Nisarg Shah" <nisargshah5408@gmail.com>',
		to : req.query.to,
		subject : req.query.subject,
		text : req.query.content
	}
	console.log(mailOptions);
	smtpTransport.sendMail(mailOptions, function(error, response){
   	 if(error){
        	console.log(error);
		res.end("error");
	 }else{
        	console.log("Message sent: " + response.message);
		res.end("sent");
    	 }
});
});

app.listen(3000);
console.log("Server listening on port 3000");
