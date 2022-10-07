const express = require('express');
const sequelize = require("sequelize");
const { User, Photo } = require("./models");
const app = express();
const port = 3000;

app.use(express.json());

app.get('/',someMiddleware, (req, res) => {
  res.send('Hello World!')
});

app.get('/users', async (req,res) => {
  const users = await User.findAll();
  res.json(users);
});

app.get("/users/photos", async (req,res,next) => {
  const users = await User.findAll({
    include: [{
      model: Photo
    }]
  });

  res.json(users);
});

app.get('/users/:id',someMiddleware, async (req,res,next) => {
  try{
    const oneUser = await User.findByPk(req.params.id);
    res.send(`<h1>${oneUser.firstName} ${oneUser.lastName}</h1>`);
  }catch (error){
    console.log(error);
    res.status(404).json({
      message: "User not found"
    });
  }
  //find user by id
  //if there is not a user, show an error
});
app.post('/users/photos', async (req,res,next) => {
  const { title, url, userId } = req.body;
  const newPhoto = await Photo.create({
    title,
    url,
    userId
  });
  res.json({
    id: newPhoto.id
  })
})

app.post("/users", async (req, res, next) => {
  //req.body contains an object with firstName, lastName, email
  console.log(req.body);
  const { firstName, lastName, email }= req.body;
  const newUser = await User.create({
    firstName,
    lastName,
    email
  })
  res.json({
    id: newUser.id
  });
});

  app.get('/users/by-last-name', async (req,res,next) => {
    const users = await User.findAll({
      attributes: ['lastName']
    });
    res.json(users)
});
// search route
// app.post('/users/search', async (req, res, next) => {
//   console.log(req.body.term)
//   const users = await User.findAll({
//     where : {
//       firstName : req.body.term,
//     }
//   });
//   console.log("the user is ...");
//   console.log(users);
//   res.json(users)
// });

app.post("/users/search", async (req, res, next) => {
  const users = await User.findAll({
    where : {
      [sequelize.Op.or]: [
        {
          firstName: req.body.term,
          lastName: req.body.term2

        }
      ]
    }
  });
  res.json(users);
});

app.patch('/users/:id', async (req, res, next) => {
  console.log(req.params);
  console.log(req.body);

  const updateUser = await User.update(req.body, {
    where : {
      id: req.params.id
    }
  })
  res.json(updateUser)
});

app.delete("/users/:id", async (req,res,next) => {
  const { id } = req.params;
  console.log(id);

  const deletedUser = await User.destroy({
    where: {
      id,
    },
  });
  if(deletedUser === 1) {

    res.send("Delete a user")
  }else {
    res.send("user not found")
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

function someMiddleware(req, res, next) {
  console.log("the middleware function has fired");

  const isValidUser = true;

  if(isValidUser){

    next();
  }else{
    res.send("the username is not valid")
  }
}