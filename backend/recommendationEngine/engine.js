const _ = require('underscore');
const User = require('../db').User;
const Video = require('../db').Video;



//track likes/dislikes of user voteVideo

//find everyone who has rated the items user rated
module.exports = recommendationEngine = (req, res) => {

  // let email = req.body.params.email;
  let email = 'bella@bella.com';
  //get users similar users
  User.findOne({email:email}, 'email similarUsers history categoryPreference videoPreference', function(err,user){
    if(err){
      console.log("user does not exist");
      res.status(204).send("User does not exist");
    }
    console.log(user);
    if(user.similarUsers.length === 0){
      getSimilarUsers(user, res, getRecommendedVideos)

    } else {
      getRecommendedVideos(user, res);

    }
  });


}



    //fn requires user object to be passed with .email and .videoPreference
function getSimilarUsers(user, res, callback){
    //get the users who liked/disliked the videos User already has liked/disliked
  console.log("User", user);
  console.log("videoId:",_.flatten([user.videoPreference.liked, user.videoPreference.disliked]));
  Video.find({videoId: (_.flatten([user.videoPreference.liked, user.videoPreference.disliked]))}, 'likedBy dislikedBy', function(err, video) {
    console.log("users who liked videos",video);

    let uniqueSet = []; //create a unique set of users to check against our User remove User email from set
    for(var i = 0; i < video.length; i++) {
      uniqueSet.push(video[i].dislikedBy);
      uniqueSet.push(video[i].likedBy);

    }
    console.log("UniqueSet pre flatten:", uniqueSet);
    uniqueSet =_.uniq(_.flatten(uniqueSet));
    console.log("UniqueSet post flatten:", uniqueSet);

    if(uniqueSet.indexOf(user.email) > -1){
      console.log(user.email);
      uniqueSet.splice(uniqueSet.indexOf(user.email), 1); // remove user from unique set, we dont need to check against themself
    }
    // console.log(uniqueSet);
    let userLikes = user.videoPreference.liked;
    let userDislikes = user.videoPreference.disliked;
    let topMatches = [];
    //get videos
    console.log("uniqueSet:", uniqueSet)
    User.find({"email":uniqueSet}, "email videoPreference.liked videoPreference.disliked", function(err,others){
      console.log("Others",others);

      let similarityArr = [];

      let searchSimilarity = others.length;

      // Limit check against users just in case
      // if(searchSimilarity > 10 ){
      //   searchSimilarity = 10;
      // }

      for (var i = 0; i < searchSimilarity; i++){
        otherLikes = others[i].videoPreference.liked;
        otherDislikes = others[i].videoPreference.disliked;
        // if(others[i].email == 'bella1@bell.com'){
        //   console.log(others[i].videoPreference);
        // }
        var step1 = (_.intersection(userLikes, otherLikes).length);
        var step2 = (_.intersection(userDislikes, otherDislikes).length);
        var step3 = (_.intersection(userLikes, otherDislikes).length);
        var step4 = (_.intersection(userDislikes, otherLikes).length);
        var step5 = (step1 + step2 + step3 + step4);
        var step6 = (_.union(userLikes, userDislikes, otherLikes, otherDislikes).length);
        console.log("SimilarityScore:",step5, step6);
        let similarityScore = (step5 / step6);

        console.log(others[i].email, similarityScore);

        similarityArr.push([others[i].email, similarityScore]);
        if(i == searchSimilarity - 1 ){
          similarityArr.sort(function(a,b){
            return b[1] - a[1];
          });
          let topMatches = [];

          for(var j = 0; j < similarityArr.length; j++) {
            topMatches.push(similarityArr[j][0]);
          }
          //verify here
          user.similarUsers = topMatches;

          user.save(function(err,data){
            if(err){
              console.log("Cannot save");
            }
            callback(user, res);
          });

          //saved topMatches to user object
        }
      }
    })
  });
};

//need to check before calling this fn that user.similarUser.length > 0
function getRecommendedVideos(user, response){
  //user expected to be full user object from db
  console.log([user.similarUsers], user.videoPreference.liked);
  User.find({email:_.flatten([user.similarUsers])}, 'videoPreference.liked', function(err, data) {
    //data is an array of objects containing array of liked videos
    console.log("similar users",data[0].videoPreference.liked, data[1].videoPreference.liked);
    let likedVideos = [];
    for(var i = 0; i < data.length; i++){
      likedVideos.push(data[i].videoPreference.liked)
    }
    console.log("liked Video pre flatt", likedVideos);
    likedVideos = _.flatten(likedVideos);
    console.log("liked Video post flatt", likedVideos);

    let recommendedVideos = _.filter(_.uniq(likedVideos), function(video){
      return (user.videoPreference.liked.indexOf(video) == -1 && user.videoPreference.disliked.indexOf(video) == -1)
    });
    console.log("Recommended", recommendedVideos, "Userd liked", user.videoPreference.liked,"User lisked", user.videoPreference.disliked);
    Video.find({videoId:recommendedVideos}, "videoId url linkType title description likes dislikes viewCount bookmarked category subcategory thumnail createdBy dateSubmitted", function(err,data){
      response.status(200).send({videos:data});
    })
  })

}
