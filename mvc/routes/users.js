const express = require('express');
const router = express.Router();
const middleware = require('./middleware/middleware');

const usersCtrl = require('../controllers/users');

router.post('/register', usersCtrl.registerUser );
router.post('/login', usersCtrl.loginUser );
router.get('/generate-feed',middleware.authorize , usersCtrl.generateFeed );
router.get('/get-search-results', middleware.authorize , usersCtrl.getSearchResults);
router.post('/make-friend-request/:from/:to', middleware.authorize, usersCtrl.makeFriendRequest );
router.get('/get-friend-requests', middleware.authorize , usersCtrl.getFriendRequests);
router.get('/get-user-data/:userid', middleware.authorize , usersCtrl.getUserData);
router.post('/resolve-friend-request/:from/:to', middleware.authorize , usersCtrl.resolveFriendRequest);
router.post('/create-post', middleware.authorize , usersCtrl.createPost);


//DOT NOT MOVE NOR USE
router.delete('/all', usersCtrl.deleteAllUsers);
router.get('/all', usersCtrl.getAllUsers);


module.exports = router;
