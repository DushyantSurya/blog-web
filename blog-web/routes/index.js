var express = require('express');
var router = express.Router();

var crypto = require('crypto'),
        User = require('../models/user.js');
        Post = require('../models/post.js');
/* GET home page. */
router.get('/', function(req, res, next) {
  Post.getByName(null, function (err, posts) {
        if (err) {
          posts = [];
        }

        res.render('index', {
          title: 'home',
          user: req.session.user,
          posts: posts,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });
});

function checkLogin(req, res, next) {
    if (!req.session.user) {
      req.flash('error', 'Unhandled');
      res.redirect('/login');
    }
    next();
}

router.get('/mypages',function(req,res,next){
   Post.getByName(req.session.user.name, function (err, posts) {
        if (err) {
          posts = [];
        }

        res.render('mypages', {
          title: 'Blogs',
          user: req.session.user,
          posts: posts,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });
});

router.get('/reg', function(req, res, next) {
   res.render('reg', {
        title: 'Registration',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
});

router.post('/reg', function (req, res) {
      var name = req.body.name,
          password = req.body.password,
          password_re = req.body['password-repeat'],
          email = req.body.email;
      if (password_re != password) {
        req.flash('error', 'reg error');
        console.log('hjjhjkh');
        return res.redirect('/reg');
      }
      var md5 = crypto.createHash('md5'),
          password = md5.update(req.body.password).digest('hex');
      var newUser = new User({
          name: name,
          password: password,
          email: req.body.email
      });
      User.get(newUser.name, function (err, user) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/');
        }
        if (user) {
          req.flash('error', 'error');
          return res.redirect('/reg');
        }
        newUser.save(function (err, user) {
          if (err) {
            req.flash('error', err);
            return res.redirect('/reg');
          }
          req.session.user = user;

          // res.redirect('/');
          res.render('reglogin', {
            title: 'reglogin',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
          });
        });
      });
    });

router.get('/login', function(req, res) {
  res.render('login', {
            title: 'login',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
});

router.post('/login', function(req, res, next) {
	  var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
      User.get(req.body.name, function (err, user) {
        if (!user) {
          req.flash('error', 'error 400');
          return res.redirect('/login');
        }
        if (user.password != password) {
          req.flash('error', 'pass err');
          return res.redirect('/login');
        }

        req.session.user = user;
        console.log(req.session.user);
        req.flash('success', 'welcome');
        res.redirect('/');
      });
});

router.get('/post', function(req, res, next) {
  console.log(req.params.title);
      res.render('post', {
            title: 'post。。',
            user: req.session.user,
            posts:null,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
});

router.get('/post/:title', function(req, res, next) {
   Post.getByTitle(req.params.title,function (err, posts) {
        if (err) {
          posts = [];
        }
       // console.log(posts);
        res.render('post', {
          title: 'single',
          user: req.session.user,
          posts: posts,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });

      });
});

router.post('/post', checkLogin);

router.post('/post', function(req, res, next) {
	var currentUser = req.session.user,
          post = new Post(currentUser.name, req.body.title, req.body.post.replace(/\r\n/g,'<br/>'));
      post.save(function (err) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/');
        }

        // res.redirect('/');
        res.render('postsuccess', {
            title: 'after',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
      });
});

router.post('/post/:title', checkLogin);

router.post('/post/:title', function(req, res, next) {
  var currentUser = req.session.user,
          post = new Post(currentUser.name, req.body.title, req.body.post.replace(/\r\n/g,'<br/>'));
      post.updatepost(function (err) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/');
        }

        // res.redirect('/');
        res.render('postsuccess', {
            title: 'after',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
      });
});

router.get('/checkname/:name',function(req,res,next){
  User.get(req.params.name, function (err, user) {
    if (!user) {
      res.send('yes');
    }else{
      res.send('no');
    }
  });
});

router.get('/single/:title',function(req,res,next){

  Post.getByTitle(req.params.title,function (err, posts) {
        if (err) {
          posts = [];
        }
       // console.log(posts);
        res.render('singlepassage', {
          title: 'single',
          user: req.session.user,
          posts: posts,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });

      });
});

router.get('/logout', function(req, res, next) {
	 req.session.user = null;
      req.flash('success', 'logout');
      res.redirect('/');
});

module.exports = router;
