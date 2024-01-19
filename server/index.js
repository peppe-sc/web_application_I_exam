'use strict';

const express = require('express');
const dayjs = require('dayjs');
const morgan = require('morgan'); // logging middleware
const { check, validationResult } = require('express-validator'); // validation middleware

const cors = require('cors');
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session');
const userDao = require('./user-dao');
const dao = require('./dao');

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function (username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username and/or password.' });

      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});


// init express
const app = express();
const port = 3001;

//middleware initialization
app.use(morgan('dev'));
app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.static('img'));


const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated())
    return next();

  return res.status(401).json({ error: 'Not authenticated' });
}

const answerDelay = 200;

app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: 'suhdbvs',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

/*** APIs ***/

//Get site name
app.get('/name',(req, res) => {
  dao.getName()
    .then(name => setTimeout(() => res.json(name), answerDelay))
    .catch((err) => { res.status(500).end() });
});

//Set site name
app.put('/page',isLoggedIn,(req,res)=>{
  
  if(!req.user.admin || req.body.name==''){
    res.status(401).end();
    return;
  }

  dao.setName(req.body.name)
  .then((ok)=>res.status(200).json(ok))
  .catch((err)=>res.status(500).json({message:err}));
})

//Get all published pages
app.get('/pages/published', (req, res) => {
  dao.getAllPublishedPages()
    .then(pages => setTimeout(() => res.json(pages), answerDelay))
    .catch((err) => { console.log(err); res.status(500).end() });
});

//Get all pages
app.get('/pages/all', (req, res) => {
  dao.getAllPages()
    .then(pages => setTimeout(() => res.json(pages), answerDelay))
    .catch((err) => { console.log(err); res.status(500).end() });
});

//Get the block to compose a page
app.get('/pages/:id', (req, res) => {
  dao.getPageById(req.params.id)
    .then(blocks => setTimeout(() => res.json(blocks), answerDelay))
    .catch((err) => { console.log(err); res.status(500).end() });
});

//Get page title
app.get('/pages/:id/title', (req, res) => {
  dao.getPageTitle(req.params.id)
    .then(title => setTimeout(() => res.json(title), answerDelay))
    .catch((err) => { console.log(err); res.status(500).end() })
})

//Get all the available images
app.get('/images', (req, res) => {
  dao.getImageList().then(images => setTimeout(() => res.json(images), answerDelay)).catch((err) => { console.log(err); res.status(500).end() });
});

//Create a new page
app.post('/pages', isLoggedIn, [check('title').isLength({ min: 1 })], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: errors.array() });
  }

  let date = dayjs(req.body.date, 'YYYY-MM-DD').format('YYYY/MM/DD');
  let author = req.user.id;
  let status
  let creation = dayjs().format('YYYY/MM/DD');
  let title = req.body.title;
  
  if (req.body.draft) {
    status = 'draft';
    date = 'draft';
  } else {
    if (dayjs(date, 'YYYY/MM/DD').isBefore(dayjs().format('YYYY/MM/DD'), 'YYYY/MM/DD')) {
      return res.status(422).json({ message: "invalid date" });
    } else if (dayjs(date, 'YYYY/MM/DD').isAfter(dayjs().format('YYYY/MM/DD'), 'YYYY/MM/DD')) {
      status = 'programmata';
    } else {
      status = 'pubblicata';
    }
  }
  dao.createPage(title, author, status, creation, date)
    .then((id) => { res.status(200).json(id); })
    .catch((err) => res.status(400).json({ message: "Errore creazione" }));



});

//Get the authors name
app.get('/authors',(req,res)=>{
  dao.getAuthors()
  .then(authors=>res.status(200).json(authors))
  .catch(err=>res.status(400).json(err));
});

//Get block infos by id
app.get('/blocks/:blockid',(req,res)=>{
  dao.getBlock(req.params.blockid)
  .then(block=>res.status(200).json(block))
  .catch(err=>res.status(400).json(err));
});

//Add a block in a page
app.post('/pages/:id', isLoggedIn, async (req, res) => {

  //const page=await dao.getPageInfoByID(req.params.id);
  //dao.getPageInfoByID(req.params.id).then((page)=>console.log(page));
  dao.getPageInfoByID(req.params.id).then((page) => {
    
    if (page.error) {
      res.status(404).json(page);
      return;
    }
    //console.log(req.user.id);
    if (req.user.id != page.autor && !req.user.admin) {
     
      res.status(401).json();
      return;
    }

    let block = req.body;

    if (block.content == '') {
      res.status(400).end();
      return;
    }

    
    if (block.type != 'header' && block.type != 'paragraph' && block.type != 'image') {
      if (block.type == 'title') {
        console.log("qui faccio una update table per il titolo: " + req.params.id + " " + block.content);
        dao.updateTitle(req.params.id, block.content)
          .then(changes => { res.status(200).json(); })
          .catch((err) => { console.log(err); res.status(400).end(); });
      } else if (block.type == 'date') {
        let date = dayjs(block.content);
        let status;
        if (block.draft) {
          status = 'draft';
          date = 'draft';
        } else if (date.isBefore(dayjs(dayjs().format('YYYY-MM-DD')))) {
          return res.status(400).json({ message: "errore data" });
        } else if (date.isAfter(dayjs(dayjs().format('YYYY-MM-DD')))) {
          
          status = 'programmata';
        } else if (date.isSame(dayjs(dayjs().format('YYYY-MM-DD')))) {
          status = 'pubblicata';
        }
        if(!block.draft){
          date=date.format('YYYY/MM/DD');
        }
        dao.setDate(date,status,req.params.id).then(changes=>res.status(200).json(changes))
        .catch(err=>res.status(400).json({message: "Errore data"}));

      }else if(block.type=='author' && req.user.admin){
        dao.getAuthors().then(authors=>{
          let found=false;
          let aut;
          
          authors.forEach((x)=>{
            if(x.name==block.content){
              found=true;
              aut=x.id;
            }
          });
          if(!found){
            
            return res.status(400).json({ message: "errore authors not found" });
          }
          
          dao.setAuthor(req.params.id,aut).then((changes)=>res.status(200).json(changes)).catch(err=>res.status(400).json({ message: "errore authors not found" }));

        }).catch(err=> res.status(400).json({ message: "errore authors not found" }))
      } else {
        res.status(400).json({ message: "errore block type" });
      }

    } else {
      
      dao.addBlock(block, req.params.id).then((b_id) => { res.status(200).json(b_id); }).catch((err) => { console.log(err); res.status(400).json({ message: err }); });
      //res.status(200).json();
    }
  });


});

//Update block
app.put('/pages/:pageid/:blockid', isLoggedIn, async (req, res) => {
  
  const page = await dao.getPageInfoByID(req.params.pageid);
  if (page.error) {
    res.status(404).json(page);
    return;
  }
  if (req.user.id != page.autor && !req.user.admin) {
    
    res.status(401).json({ message: "Non sei autorizzato" });
    return;
  }
  
  dao.updateBlock(req.body.id,req.body.type,req.body.content,req.params.pageid)
  .then((r)=>setTimeout(() => res.status(200).json(true), answerDelay))
  .catch((e)=>setTimeout(() => res.status(400).json(e), answerDelay));



});

//Update title
/*app.put('/backoffice/edit/:pageid', isLoggedIn, async (req, res) => {

  dao.getPageInfoByID(req.params.pageid).then((page) => {
    console.log(page);
    if (page.error) {
      res.status(404).json(page);
      return;
    }
    //console.log(req.user.id);
    if (req.user.id != page.autor && !req.user.admin) {
      console.log("Utente non uguale");
      res.status(401).json();
      return;
    }
    let title = req.body.title;
    dao.updateTitle(req.params.pageid, title)
    .then(changes => res.status(200).json())
    .catch((err) => res.status(400).end());
  });

});*/

//Save order change
app.put('/backoffice/edit/:pageid', isLoggedIn, async (req, res) => {
  const page = await dao.getPageInfoByID(req.params.pageid);
  if (page.error) {
    res.status(404).json(page);
    return;
  }
  if (req.user.id != page.autor && !req.user.admin) {
    
    res.status(401).json({ message: "Non sei autorizzato" });
    return;
  } 
  
  let i = 0;
  req.body.forEach(element => {
    dao.updateOrder(req.params.pageid, element.block_id, element.index).then((changes) => i += changes).catch((err) => res.status(400).end());
  });

  setTimeout(() => res.status(200).json(true), answerDelay);


});


//Delete a page
app.delete('/pages/:id', isLoggedIn, (req, res) => {
  
  dao.getPageInfoByID(req.params.id)
    .then((page) => {
      if (req.user.id != page.autor && !req.user.admin) {
        
        res.status(401).json({ message: "Non sei autorizzato" });
        return;
      }
      
      dao.deletePage(req.params.id)
        .then((changes) => setTimeout(() => res.status(200).json(changes), answerDelay))
        .catch((err) => res.status(400).json({ message: "impossibile eliminare " + err }));
    })
    .catch((err) => {
      res.status(404).json(err);
    });


});

//Delete a block from a page
app.delete('/pages/:pageid/:blockid', isLoggedIn, async (req, res) => {
  //console.log(req);
  //console.log(req.params.pageid);
  const page = await dao.getPageInfoByID(req.params.pageid);


  if (page.error) {
    res.status(404).json(page);
    return;
  }

  if (req.user.id != page.autor && !req.user.admin) {
    
    res.status(401).json({ message: "Non sei autorizzato" });
    return;
  }

  dao.deleteBlock(req.params.blockid, req.params.pageid).then((changes) => setTimeout(() => res.json(changes), answerDelay))
    .catch((err) => res.status(503).json({ message: `Database error during the deletion of answer` }));


});


/*** Users APIs ***/

// POST /sessions 
// login
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err)
        return next(err);

      // req.user contains the authenticated user, we send all the user info back
      
      return res.json(req.user);
    });
  })(req, res, next);
});




// DELETE /sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => { res.end(); });
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    //console.log(req.user);
    res.status(200).json(req.user);
  }
  else

    res.status(401).json({ error: 'Unauthenticated user!' });;
});



// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

