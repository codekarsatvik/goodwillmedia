const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const discussionSchema = new Schema({
    content: { type: String, trim: true },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    pinned: Boolean,
    upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    replies : []
   

}, { timestamps: true });

var Post = mongoose.model('Discussion', discussionSchema);
module.exports = Post;