const express = require('express');
const router = express.Router();
const middleware = require('./middleware/middleware');

const usersCtrl = require('../controllers/users');
const fakeUsersCtrl = require('../controllers/fake-users');

//Login & Register
router.post('/register', usersCtrl.registerUser );
router.post('/login', usersCtrl.loginUser );

//Get Request
router.get('/generate-feed',middleware.authorize , usersCtrl.generateFeed );
router.get('/get-search-results', middleware.authorize , usersCtrl.getSearchResults);
router.get('/get-user-data/:userid', middleware.authorize , usersCtrl.getUserData);

// Routes Handling Friend Requests
router.get('/get-friend-requests', middleware.authorize , usersCtrl.getFriendRequests);
router.post('/make-friend-request/:from/:to', middleware.authorize, usersCtrl.makeFriendRequest );
router.post('/resolve-friend-request/:from/:to', middleware.authorize , usersCtrl.resolveFriendRequest);

// Routes Handling Posts
router.post('/create-post', middleware.authorize , usersCtrl.createPost);
router.post('/like-unlike/:ownerid/:postid', middleware.authorize , usersCtrl.likeUnlike);
router.post('/post-comment/:ownerid/:postid', middleware.authorize , usersCtrl.postCommentOnPost);

//Routes handling Messages
router.post('/send-message/:to', middleware.authorize , usersCtrl.sendMessage);
router.post('/reset-message-notification', middleware.authorize , usersCtrl.resetMessageNotifications);
router.post('/delete-message/:messageid', middleware.authorize , usersCtrl.deleteMessage);

//Misc Routes
router.post('/bestie-enemy-toggler/:userid', middleware.authorize , usersCtrl.bestiesEnemyToggle);



//=======================================
//DOT NOT MOVE NOR USE // Development Only
router.delete('/all', usersCtrl.deleteAllUsers);
router.get('/all', usersCtrl.getAllUsers);
router.post("/create-fake-users", fakeUsersCtrl.createFakeUsers)


module.exports = router;
