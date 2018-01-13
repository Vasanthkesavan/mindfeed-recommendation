const mongoose = require('mongoose');
const dbUri = require('./dbInfo').dbUri;
const Schema = mongoose.Schema;
const VideoSubmissionSchema = require('./relational_schema/videoSubmission');
const VideoPreferenceSchema = require('./relational_schema/videoPreference');
const CategoryPreferenceSchema = require('./relational_schema/categoryPreference');
const BookmarkedVideoSchema = require('./relational_schema/bookmarkedVideoPreferences');

/* Connection to the database */

mongoose.connect('mongodb://' + dbUri, { useMongoClient: true });

mongoose.connection.once('open', function() {
    console.log('database is connected');
});

mongoose.connection.on('error', function(error) {
    console.log('database connection error: ' + error);
});


const UserSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: [true, 'email is required']
    },
    password: {
        type: String,
        validate: {
          validator: (password) => password.length > 6,
          message: 'Password must be longer than 6 charecters'
        },
        require: [true, 'Password is required']
    },
    bookmarks: {
        type: [String],
        required: false
    },
    videosSubmitted: [VideoSubmissionSchema],
    videoPreference: {
        liked: [String],
        disliked: [String]
    },
    categoryPreference: {
        preferences: [CategoryPreferenceSchema],
    },
    history: {
        type: [String],
        required: false
    },
    similarUsers: {
      type: [String]
    },
    token: {
        type: String
    }
});

/*
    1. Find bookmarks count on the fly
    2. Cannot use ES6 function for defining virtual types
       a. Using ES6 function doesn't allow 'this' keyword to access the document
*/



UserSchema.virtual('bookmarksCount').get(function () {
    return this.bookmarks.length;
});



const VideoSchema = new Schema({
   videoId: {
       type: String,
       required: true,
       unique: true
   },
   likedBy: {
     type: [String],
     required: false
   },
  dislikedBy: {
    type: [String]
  },
   url: {
       type: String,
       required: false
   },
   linkType: {
       type: String,
       required: true
   },
   title: {
       type: String,
       required: true
   },
   description: {
       type: String,
       required: true
   },
   likes: {
       type: Number,
       required: false
   },
   dislikes: {
       type: Number,
       required: false
   },
   viewCount: {
       type: Number,
       required: false
   },
   bookmarked: {
       type: Number,
       required: false
   },
   category: {
       type: String,
       required: true
   },
   subcategory: {
       type: String,
       required: true
   },
   thumbnail: {
       type: String,
       required: false
   },
   createdBy: {
       type: String,
       required: true
   },
   dateCreated: {
       type: String,
       required: false
   },
   submittedBy: {
       type: String,
       required: false
   },
   dateSubmitted: {
       type: String,
       required: false
   }
});

const QueueSchema = new Schema({
   videoId: {
       type: String,
       required: true,
       unique: true
   },
   userComment: {
       type: String,
       required: false
   },
   url: {
       type: String,
       required: false
   },
   linkType: {
       type: String,
       required: true
   },
   title: {
       type: String,
       required: true
   },
   description: {
       type: String,
       required: true
   },
   likes: {
       type: Number,
       required: false
   },
   dislikes: {
       type: Number,
       required: false
   },
   viewCount: {
       type: Number,
       required: false
   },
   bookmarked: {
       type: Number,
       required: false
   },
   category: {
       type: String,
       required: false
   },
   subcategory: {
       type: String,
       required: false
   },
   thumbnail: {
       type: String,
       required: false
   },
   createdBy: {
       type: String,
       required: true
   },
   dateCreated: {
       type: String,
       required: false
   },
   submittedBy: {
       type: String,
       required: false
   },
   dateSubmitted: {
       type: String,
       required: false
   },
   comment: {
       type: String,
       required: false
   }
});


/* Model for Schema */

const User = mongoose.model('User', UserSchema);
const Video = mongoose.model('Video', VideoSchema);
const Queue = mongoose.model('Queue', QueueSchema);


module.exports.User = User;
module.exports.Video = Video;
module.exports.Queue = Queue;
