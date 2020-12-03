const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Post = mongoose.model('Post');
const Comment = mongoose.model('Comment');
const Message = mongoose.model('Message');
const timeAgo = require("time-ago");
const { NotFound } = require('http-errors');


const containsDuplicate = function(array){
  array.sort();
  for(let i = 0; i < array.length; i++){
    if(array[i] == array[i + 1]){
      return true;
    }
  }
}

const addCommentDetails = function(posts){
  return new Promise(function(resolve, reject){
    let promises = [];

    for(let post of posts){
      for (let comment of post.comments){
        let promise = new Promise(function(resolve, reject){
          User.findById(comment.commenter_id, "name profile_image", (err, user)=> {
            comment.commenter_name = user.name;
            comment.commenter_profile_image = user.profile_image;
            resolve(comment);
          });
        });
        promises.push(promise)
      }
    }
    Promise.all(promises).then((val) => {
      resolve(posts);
    });
  });
}

const getRandom = function(min, max) {
  return Math.floor(Math.random()*(max-min))+min;
}

const addToPosts = function(array, user) {
  for( item of array) {
    item.name = user.name;
    item.ago = timeAgo.ago(item.date);
    item.ownerid = user._id;
    item.ownerProfileImage = user.profile_image;
  }
}

const registerUser = function({body}, res) {

  if(
    !body.first_name ||
    !body.last_name ||
    !body.email ||
    !body.password ||
    !body.password_confirm
  ){
    return res.send({ message: "All fields are required." })
  }

  if(body.password !== body.password_confirm) {
    return res.send({ message: "Password don't match." })
  }

  const user = new User();

  user.name = body.first_name.trim() + ' ' + body.last_name.trim();

  user.email = body.email;
  user.setPassword(body.password);

  user.save((err, newUser)=> {
    if(err){
      if(err.errmsg && err.errmsg.includes('duplicate key error')
        && err.errmsg.includes('email') ) {
        return res.json( {message: 'The email is already in use.'} )
      }
      return res.json( {message: 'Something went wrong.'} )
    }else {
      const token = newUser.getJwt();
      res.status(201).json({token});
    }
  })
}

const loginUser = function(req, res){
  if(!req.body.email || !req.body.password) {
    return res.status(400).json({ message: 'All fields are required.'});
  }
  passport.authenticate('local', (err, user, info) => {
    if (err) { return res.status(404).json(err) }
    if(user) {
      const token = user.getJwt();
      res.status(201).json({ token });
    } else {
      res.json(info);
    }
  })(req, res);
}

const generateFeed = function({payload}, res) {

const posts = [];
const maxAmountOfPosts = 30;

  let myPosts = new Promise(function(resolve, reject){
    User.findById(payload._id, 'name posts profile_image friends', {lean: true}  , (err, user)=> {
      if(err) { return res.json({ err: err }); }
      addToPosts(user.posts, user);
      posts.push(...user.posts);
      resolve(user.friends)
    });
  });

  let myFriendsPosts = myPosts.then((friendsArray)=> {
    return new Promise(function(resolve, reject) {
      User.find({'_id': { $in: friendsArray }}, 'name profile_image posts', { lean: true }, (err, users)=> {
        if(err) { return res.json({ err: err }); }
        for(user of users) {
          addToPosts(user.posts, user);
          posts.push(...user.posts);
        }
        resolve();
      });
    });
  });

  myFriendsPosts.then(() => {
    posts.sort((a, b) => (a.date > b.date) ? -1 : 1);
    let slicePosts = posts.slice(0, maxAmountOfPosts);
    addCommentDetails(slicePosts).then((slicePosts)=>{
      res.statusJson(201, { posts: slicePosts })
    })
  });
}

const getSearchResults = function ({query, payload}, res) {
  if(!query.query) { return res.json( {err: "Missing Query"} ); }
  User.find({ name: { $regex: query.query, $options: 'i' } }, 'name profile_image friends friend_requests', (err, results) => {
    if (err) { return res.json({ err: err }); }
    results = results.slice(0, 20);

    for (let i = 0; i < results.length; i++) {
      if(results[i]._id == payload._id ){
        results.splice(i, 1);
        break;
      }
    }
    return res.status(200).json({ message: 'Getting search results', results: results })
  });
}

const makeFriendRequest = function({params}, res) {
  User.findById(params.to, (err, user) => {

    if( err ){ return res.json({ err: err }); }

    if(containsDuplicate([params.from, ...user.friend_requests])){
      return res.json({ message: 'Friend request is already sent.' });
    }

    user.friend_requests.push(params.from);
    user.save((err, user)=>{
      if( err ){ return res.json({ err: err }); }
      return res.statusJson(201, { message: 'Successfully sent a friend request. ' });
    });
  });
}

const getUserData = function({params}, res){
  User.findById(params.userid, '-salt -password', {lean: true}, (err, user) => {
    if( err ){ return res.json({ err: err }); }

    function getRandomFriends(friendList){
      let copyOfFriendsList = Array.from(friendList);
      let randomIds = [];

      for(let i = 0; i < 6; i++){
        if(friendList <= 6) { randomIds = copyOfFriendsList; break; }

        let randomId = getRandom(0, copyOfFriendsList.length);
        randomIds.push(copyOfFriendsList[randomId]);
        copyOfFriendsList.splice(randomId, 1)
      }
      return new Promise(function(resolve, reject) {
        User.find({ '_id': {$in: randomIds}}, 'name profile_image', (err, friends) => {
          if( err ){ return res.json({ err: err }); }
          resolve(friends)
        })
      });
    }

    user.posts.sort((a, b) => (a.date > b.date) ? -1 : 1);

    addToPosts(user.posts, user);

    let randomFriends = getRandomFriends(user.friends);
    let commentDetails = addCommentDetails(user.posts);

    Promise.all([randomFriends, commentDetails]).then((val) => {
      user.random_friends = val[0]
      res.statusJson(200, {user: user})
    });

  })
}

const getFriendRequests = function({query}, res){
  let friendRequests = JSON.parse(query.friend_requests)
  User.find({'_id': {$in: friendRequests}}, 'name profile_image', ( err, users ) => {
    if( err ){ return res.json({ err: err }); }
    return res.statusJson(200, {message: 'Getting Friend Request', users: users})
  });
}

const resolveFriendRequest = function({query, params}, res){

  User.findById(params.to, (err, user)=> {
    if (err) { return res.send({ error: err }); }

    for(let i = 0; i < user.friend_requests.length; i++){
      if ( user.friend_requests[i] == params.from ) {
        user.friend_requests.splice(i, 1);
        break;
      }
    }

    let promise = new Promise(function(resolve, reject) {
      if(query.resolution == 'accept'){

        if(containsDuplicate([params.from, ...user.friends])){
          return res.json({ message: 'Duplicate error.' })
        }

        user.friends.push(params.from);

        User.findById(params.from, (err, user)=> {
          if (err) { return res.send({ error: err }); }
          if(containsDuplicate([params.to, ...user.friends])){
            return res.json({ message: 'Duplicate error.' })
          }
          user.friends.push(params.to);
          user.save((err, user) => {
            if (err) { return res.send({ error: err }); }
            resolve();
          });
        })
      } else {
        resolve();
      }
    });
    promise.then(()=> {
      user.save((err, user)=> {
        if (err) { return res.send({ error: err }); }
        res.statusJson(201, { message:'Resolve friend request.'});
      })
    });
  });
}

const createPost = function({body, payload}, res){
  if(!body.content || !body.theme){
    return res.statusJson(400, {message: 'Arguments missing (Theme or content).'})
  }

  let userId = payload._id;

  const post = new Post();

  post.theme = body.theme;
  post.content = body.content;

  User.findById(userId, (err, user)=> {
    if (err) { return res.send({ error: err }); }

    let newPost = post.toObject();
    newPost.name = payload.name;
    newPost.ownerid = payload._id;
    newPost.ownerProfileImage = user.profile_image;
    user.posts.push(post);
    user.save((err) => {
      if (err) { return res.send({ error: err }); }
      return res.statusJson(201, { message: 'Create post', newPost: newPost})
    })
  })


}

const likeUnlike = function({ payload, params }, res){

  User.findById(params.ownerid, (err, user) => {
    if(err) { return res.json({ err: err }); }

    const post = user.posts.id(params.postid);

    if(post.likes.includes(payload._id)){
      post.likes.splice(post.likes.indexOf(payload._id), 1);
    } else {
      post.likes.push(payload._id)
    }

    user.save((err, user)=>{
      if(err) { return res.json({ err: err }); }
      res.statusJson(201, { message: 'Like Or Unlike a post...' })
    })
  })
}

const postCommentOnPost = function({body, payload, params}, res){
  User.findById(params.ownerid, (err, user) => {
    if(err) { return res.json({ err: err }); }
    const post = user.posts.id(params.postid);

    let comment = new Comment();

    comment.commenter_id = payload._id;
    comment.comment_content = body.content;
    post.comments.push(comment);

    user.save((err, user)=> {

      if(err) { return res.json({ err: err }); }

      User.findById(payload._id, "name profile_image" , (err, user)=> {
        if(err) { return res.json({ err: err }); }

        return res.statusJson(201, {
          message: "Posted Comment",
          comment: comment,
          commenter: user
        });
      });
    });
  });
}

const sendMessage = function({body, payload, params}, res){
  let from = payload._id;
  let to = params.to;

  let fromPromise = new Promise(function(resolve, reject){
    User.findById(from, 'messages', (err, user) => {
      if(err) { return res.json({ err: err }); }
      from = user;
      resolve(user);
    })
  })

  let toPromise = new Promise(function(resolve, reject){
    User.findById(to, 'messages new_message_notifications', (err, user) => {
      if(err) { return res.json({ err: err }); }
      to = user;
      resolve(user);
    })
  })

  let sendMessagePromise = Promise.all([fromPromise, toPromise]).then(()=>{

    function hasMessageFrom(messages, id){
      for(let message of messages){
        if(message.from_id == id){
          return message;
        }
      }
    }

    function sendMessageTo(to, from, notify = false){
      return new Promise(function(resolve, reject){

        if(notify && !to.new_message_notifications.includes(from._id)){
          to.new_message_notifications.push(from._id)
        }

        if(foundMessage = hasMessageFrom(to.messages, from._id)){
          foundMessage.content.push(message);
          to.save((err, user)=> {
            if(err) { return res.json({ err: err }); }
            resolve(user);
          });
        } else {
          let newMessage = new Message();
          newMessage.from_id = from._id;
          newMessage.content = [message];

          to.messages.push(newMessage);
          to.save((err, user) => {
            if(err) { return res.json({ err: err }); }
            resolve(user);
          })
        }
      })
    }

    let message = {
      messenger: from._id,
      message: body.content
    }

    let sendMessageToRecipient = sendMessageTo(to, from, true);
    let sendMessageToAuthor = sendMessageTo(from, to)

    return new Promise(function(resolve, reject){
      Promise.all([sendMessageToRecipient, sendMessageToAuthor]).then(()=> {
        resolve()
      });
    });
  });
  sendMessagePromise.then(() => {
    return res.statusJson(201, { message: 'Sending message' })
  })
}

const resetMessageNotifications = function({payload}, res){
  User.findById(payload._id, (err, user) => {
    if (err) { return res.send({ error: err }); }

    user.new_message_notifications = [];
    user.save((err) => {
      if (err) { return res.send({ error: err }); }
      return res.statusJson(201, { message: 'Reset Message Notifications' })
    })
  })
}




//DO NOT MOVE; NOT TOUCH

const deleteAllUsers = function (req, res) {
  User.deleteMany({}, (err, info)=> {
    if (err) { return res.send({ error: err }); }
    return res.json({ message: 'Deleted All Users', info: info })
  });
}

const getAllUsers = function (req, res) {
  User.find({}, (err, info)=> {
    if (err) { return res.send({ error: err }); }
    return res.json({ message: 'get All Users', info: info })
  });
}

module.exports = {
  getAllUsers,
  deleteAllUsers,
  registerUser,
  loginUser,
  generateFeed,
  getSearchResults,
  deleteAllUsers,
  makeFriendRequest,
  getUserData,
  getFriendRequests,
  resolveFriendRequest,
  createPost,
  likeUnlike,
  postCommentOnPost,
  sendMessage,
  resetMessageNotifications
}
