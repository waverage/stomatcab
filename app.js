var express = require('express'),
  http = require('http'),
  path = require('path'),
  config = require('./config')(),
  app = express(),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  session = require('express-session'),
  MongoStore = require('connect-mongo')(session),
  crypto = require('crypto');

var last_data = {};
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(require('morgan')('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('method-override')());
app.use(require('cookie-parser')('diplomna'));
app.use(session({
  secret: 'foo',
  cookie: {
    maxAge: 360000
  },
  //store: new MongoStore({ url: 'mongodb://' + config.mongo.host + ':' + config.mongo.port + '/diplomna-session'})
  store: new MongoStore({ url: 'mongodb://buorn:wowa_word2011@ds023902.mlab.com:23902/stomatcab'})
}));

//app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


if (app.get('env') === 'development') {
  app.use(require('errorHandler')());
}

var db = mongoose.connection;

db.on('error', console.error);
db.once('open', function(){

});

var enrollSchema = new mongoose.Schema({
  name: String,
  surname: String,
  email: String,
  phone: Number,
  comment: String,
  year: Number,
  month: Number,
  day: Number,
  hour: String,
  price: Number,
  object_type: String
});

var daycloseSchema = new mongoose.Schema({
  year: Number,
  month: Number,
  day: Number
});

var hourcloseSchema = new mongoose.Schema({
  comment: String,
  year: Number,
  month: Number,
  day: Number,
  hour: Number
});

var bd_serviceSchema = new mongoose.Schema({
  name: String,
  price: Number,
  list: Array
});

var userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

var hours_workSchema = new mongoose.Schema({
  start: {
    type: Number,
    required: true
  },
  end: {
    type: Number,
    required: true
  }
});

var weekendDaySchema = new mongoose.Schema({
  day0: {
    type: Boolean,
    required: true
  },
  day1: {
    type: Boolean,
    required: true
  },
  day2: {
    type: Boolean,
    required: true
  },
  day3: {
    type: Boolean,
    required: true
  },
  day4: {
    type: Boolean,
    required: true
  },
  day5: {
    type: Boolean,
    required: true
  },
  day6: {
    type: Boolean,
    required: true
  }
});

userSchema.methods.encryptPassword = function( password ) {
  return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

userSchema.methods.checkPassword = function( password ) {
  return this.encryptPassword(password) === this.hashedPassword;
};


var User = mongoose.model('User', userSchema);

var Enroll = mongoose.model('Enroll', enrollSchema);

var Hours_work = mongoose.model('Hours_work', hours_workSchema);

var WeekEndDays = mongoose.model('WeekEndDays', weekendDaySchema);

var Dayclose = mongoose.model('Dayclose', daycloseSchema);

var Hourclose = mongoose.model('Hourclose', hourcloseSchema);

var Service_price = mongoose.model('Service_price', bd_serviceSchema);

var price_list = [
  {
    name: "Консультація",
    price: 0
  },
  {
    name: 'Лікування карієсу',
    list: [
      {
        name: 'Хімічний композит',
        price: 75
      },
      {
        name: 'Світлотвердіючий матеріал(Німеччина)',
        price: 120
      },
      {
        name: 'Світлотвердіючий матеріал(Україна)',
        price: 90
      }
    ]
  },
  {
    name: 'Пломбування карієсу молочного зуба',
    list: [
      {
        name: "Белацин",
        price: 50
      },
      {
        name: "Цеміон",
        price: 60
      },
      {
        name: "Лателюкс",
        price: 75
      }
    ]
  },
  {
    name: "Лікувальна прокладка з кальцієм при глибокому карієсі",
    price: 20
  },
  {
    name: "Ізолююча прокладка",
    price: 25
  },
  {
    name: "Анестезія(артефрин, септонест): Інфільтраційна",
    price: 30
  },
  {
    name: "Анестезія(артефрин, септонест): Провідникова",
    price: 40
  },
  {
    name: "Зняття коронки",
    price: 20
  },
  {
    name: 'Цементування коронки',
    list: [
      {
        name: 'Уніцем',
        price: 15
      },
      {
        name: 'Цеміон-Ф',
        price: 20
      },
      {
        name: '"Кетак-цем", "Мерон"',
        price: 25
      }
    ]
  },
  {
    name: "Зняття зубного камення, полірування(за 1 зуб)",
    price: 10
  },
  {
    name: "Девіталізуюча паста",
    price: 20
  },
  {
    name: 'Лікування ускладненого карієсу(при Р та Рt)',
    list: [
      {
        name: 'Пломбування кореневого каналу однокореневого зуба: "Форедент", "Крезодент"',
        price: 50
      },
      {
        name: 'Пломбування кореневого каналу однокореневого зуба: "Канасон"',
        price: 60
      },
      {
        name: 'Пломбування одного кореневого каналу в двокореневому зубі: "Форедент", "Крезодент"',
        price: 40
      },
      {
        name: 'Пломбування одного кореневого каналу в двокореневому зубі: "Канасон"',
        price: 50
      },
      {
        name: 'Пломбування одного кореневого каналу в багатокореневому зубі: "Форедент", "Крезодент"',
        price: 40
      },
      {
        name: 'Пломбування одного кореневого каналу в багатокореневому зубі: "Канасон"',
        price: 50
      }
    ]
  },
  {
    name: 'Тимчасове пломбування одного кореневого каналу(при P та Pt)',
    list: [
      {
        name: 'Пломбування кореневого каналу однокореневого зуба',
        price: 20
      },
      {
        name: 'Пломбування одного кореневого каналу в двокореневому зубі',
        price: 15
      },
      {
        name: 'Пломбування одного кореневого каналу в багатокореневому зубі',
        price: 15
      }
    ]
  },
  {
    name: 'Армування зуба',
    list: [
      {
        name: 'Анкерним штифтом',
        price: 40
      },
      {
        name: 'Скловолоконним штифтом',
        price: 60
      }
    ]
  },
  {
    name: 'Створення відтоку при періодонтиті, промивання каналів',
    price: 40
  },
  {
    name: 'Тимчасова пломба',
    price: 20
  },
  {
    name: 'Зняття відбитка',
    price: 20
  }
];

//mongoose.connect('mongodb://' + config.mongo.host + ':' + config.mongo.port + '/diplomna');
mongoose.connect('mongodb://buorn:wowa_word2011@ds023902.mlab.com:23902/stomatcab');
/*
 var data = {
     name: "Ігор",
     surname: "Купро",
     email: "kupro@mail.ru",
     phone: "380937436227",
     comment: "Потрібна вставка зуба",
     year: "2016",
     month: "5",
     day: "3",
     hour: "14:00",
     price: "0",
     object_type: "enroll"
   };

   var enr = new Enroll(data);

   enr.save(function(err, enr){
     if(err) throw new Error(err);
   });*/
/*
Enroll.remove({
    month: "5",
    day: "7"
  }, function( err ) {    
    if( err ) throw new Error( err );
  });*/

  var enr = new Hours_work({
    start: 8,
    end: 18
  });

enr.save(function(err, res){});

var datt = new WeekEndDays({
  day0: true,
  day1: false,
  day2: false,
  day3: false,
  day4: false,
  day5: false,
  day6: true
});
datt.save(function(err, res){});

var us = new User({
  username: "admin",
  password: "admin"
});
us.save(function(err, res){});

Service_price.remove({}, function(err){});
for( var i = 0; i < price_list.length; i++ ) {
  var pp = new Service_price({
    name: price_list[i].name,
    price: price_list[i].price,
    list: price_list[i].list
  });
  pp.save(function(err, res){});
}

app.post('/update-price-list', function(req, res, next) {
  Service_price.remove({}, function(err){});
  var list = JSON.parse(req.body.list);
  for(var i=0; i<list.length; i++) {
    var pp = new Service_price({
      name: list[i].name,
      price: list[i].price,
      list: list[i].list
    });
    pp.save(function(err, res){
      if(err) throw new Error(err);
    });
  }
  res.end();
});

app.all('/admin', function(req, res, next){
  if( req.session.authorized === true ) {
    Enroll.find(
    { 
      object_type: "enroll"
    }).exec(
    function( err, data ) {
      if( err ) {
        throw new Error( err );
        console.log("erorr");
      } else {
        Service_price.find({}).exec(function(err, serData){
          res.render('admin', { 
            "price_list" : serData, 
            "enroll_list" : data
          });
        }); 
      }
    });
    
  } else {
    res.redirect('/admin-login')
  }
});

app.post('/admin-valide', function(req, res, next) {
  User.where({username: req.body.username}).findOne(function(err, user) {
    if(err) {
      console.log("Erron in admin-valide: " + err);
      throw err;
    } else {
      if( user.username === req.body.username &&
          user.password === req.body.password ) {
        req.session.authorized = true;
        req.session.username = req.body.username;
        res.redirect('/admin');
      } else {
        res.redirect('/admin-login');
      }
    }
  });
});

app.get('/admin-logout', function(req, res, next) {
  req.session.authorized = false;
  req.session.username = null;
  res.send("OK");
});

app.all('/admin-login', function(req, res, next){
  res.render('admin-login');
});

app.get('/hours-work', function(req, res, next) {
  Hours_work.findOne({}, function(err, hrs) {
    res.send({
      start: hrs.start,
      end: hrs.end
    });
  });
});

app.post('/hours-work', function(req, res, next) {
  var data = req.body;
  Hours_work.update({}, {start: data.start, end: data.end}, {}, function(err, num) {
    if( err ) throw err;
  });

  res.end();
});

app.get('/weekendday', function(req, res, next) {
  WeekEndDays.findOne({}, function(err, data) {
    if( err ) throw err;

    res.send(data);
  });
});

app.post('/weekendday', function(req, res, next) {
  var data = req.body;
  WeekEndDays.update({}, data, {}, function(err, num) {
    if( err ) throw err;
  });
  res.end();
});


app.all('/', function(req, res, next) {
  res.render('index');
});

app.all('/about-us', function(req, res, next) {
    res.render('about-us');
});

app.all('/prices', function(req, res, next) {
  Service_price.find({}).exec(function(err, serData){
    res.render('prices', { 
      "price_list" : serData
    });
  });
});

app.get('/client-list', function(req, res, next) {
  Enroll.find(
    { 
      object_type: "enroll" 
    }).exec(
    function( err, data ) {
      if( err ) {
        throw new Error( err );
      } else {
        var out = [];
        out.push(data[0]);
        var isEq = true;
        for( var i = 0; i < data.length; i++ ) {
          isEq = true;
          for( var j = 0; j < out.length; j++ ) {
            if( data[i].name == out[j].name &&
                data[i].surname == out[j].surname ) {
              isEq = false;
            }
          }
          if( isEq ) {
            out.push( data[i] );
          }
        }
        res.send(out);
      }
    });
});

app.post('/enroll-list', function(req, res, next) {
  var d = new Date();
  Enroll.find(
    { 
      object_type: "enroll", 
      month: req.body.month,
      year: req.body.year 
    }).exec(
    function( err, data ) {
      if( err ) {
        throw new Error( err );
        res.send(null);
      } else {
        res.send(data);
      }
    });
});

app.post('/add-close-hour', function(req, res, next) {
  var data = req.body;
  for( var prop in data ) {
    if( data[prop] === '' ) {
      res.send("err");
      return;
    }
  }
  var ch = new Hourclose({
    comment: data.comment,
    year: data.year,
    month: data.month,
    day: data.day,
    hour: data.hour
  });

  ch.save(function( err, res ) {
    if( err ) throw new Error( err );
  });
  res.send("OK");
});

app.post('/remove-close-hour', function(req, res, next) {
  var data = req.body;
  Hourclose.remove(data, function( err ) {
    if( err ) throw new Error( err );
  });
  res.end();
});

app.post('/get-close-hours-of-day', function(req, res, next) {
  Hourclose.find(req.body).exec(
    function( err, data ) {
      if( err ) {
        throw new Error( err );
        res.send(null);
      } else {
        res.send(data);
      }
    });
});

app.post('/get-close-hours-of-month', function(req, res, next) {
  Hourclose.find({
    month: req.body.month
  }).exec(
    function( err, data ) {
      if( err ) {
        throw new Error( err );
      } else {
        res.send( data );
      }
    });
});

app.post('/add-close-day', function(req, res, next) {
  var cd = new Dayclose({
    year: req.body.year,
    month: req.body.month,
    day: req.body.day
  });
  cd.save(function( err, res ) {
    if( err ) throw new Error( err );
  });
  res.end();
});

app.post('/remove-close-day', function(req, res, next) {
  Dayclose.remove({
    year: req.body.year,
    month: req.body.month,
    day: req.body.day
  }, function(err) {
    if( err ) throw new Error( err );
  });
  res.end();
});

app.get('/get-close-days', function(req, res, next) {
  Dayclose.find(
  {}).exec(
  function( err, data ) {
    if( err ) {
      throw new Error( err );
      res.send(null);
    } else {
      res.send(data);
    }
  });
});

app.post('/remove-enroll', function(req, res, next) {
  var data = req.body;
  Enroll.remove({
    month: data.month,
    day: data.day,
    hour: data.hour
  }, function( err ) {    
    if( err ) throw new Error( err );
  });
  res.end();
});

app.post('/get-enroll', function(req, res, next) {
  Enroll.find(
  {
    object_type: "enroll",
    month: req.body.month,
    day: req.body.day,
    hour: req.body.hour,
  }).exec(
  function( err, data ) {
    if( err ) {
      throw new Error( err );
      res.send(null);
    } else {
      res.send(data);
    }
  });
});

app.get('/enroll', function(req, res, next) {
  res.render('enroll');
});

app.get('/enroll-success', function(req, res, next){
  res.render('enroll-success', last_data);
  last_data = {};
});

app.post('/update-enroll', function(req, res, next) {
  Enroll.update( {
    year: req.body.year,
    month: req.body.month,
    day: req.body.day,
    hour: req.body.hour
  }, {
    price: req.body.price
  }, { upsert: true}, function(err, doc) {
    if( err ) throw new Error( err );
    console.log( doc );
    res.end();
  });
});

app.post('/enrolled', function(req, res, next) {

  var data = {
    name: req.body.name,
    surname: req.body.surname,
    email: req.body.email,
    phone: req.body.phone,
    comment: req.body.comment,
    year: req.body.year,
    month: req.body.month,
    day: req.body.day,
    hour: req.body.hour,
    price: req.body.price,
    object_type: "enroll"
  };
  console.log(data);

  var enr = new Enroll(data);

  enr.save(function(err, enr){
    if(err) throw new Error(err);
  });

  last_data = data;
  res.send(data);
});

var port = process.env.PORT || 3000;
http.createServer(app).listen(port, function(){
  console.log(
    'Successfully connected to mongodb://' + config.mongo.host + ':' + config.mongo.port,
    '\nExpress server listening on http://localhost:' + port
  );
});

function createHash(password) {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}