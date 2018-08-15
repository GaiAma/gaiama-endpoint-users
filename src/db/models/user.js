import mongoose from 'mongoose'
import bcrypt from 'mongoose-bcrypt'

const Schema = mongoose.Schema
mongoose.set(`bufferCommands`, false)

const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    name: String,
    last_name: String,
    password: {
      type: String,
      bcrypt: true,
    },
    currency: String,
    lang: String,
    newsletter: Boolean,
    timezone_offset: Number,
    // store image @ https://stackoverflow.com/a/29780816/3484824
    // var user = new User;
    // user.avatar.data = fs.readFileSync(imgPath);
    // user.avatar.contentType = 'image/jpeg';
    // user.save(cb)
    avatar: { data: Buffer, contentType: String },
  },
  {
    timestamps: true,
    // collection: `users`,
  }
)

UserSchema.index({ email: 1 })
UserSchema.plugin(bcrypt)

// pre hook to send welcome & newsletter confirmation email :D
// @https://getstream.io/blog/building-a-node-js-powered-api-with-express-mongoose-mongodb/
// UserSchema.pre(`save`, function(next) {
//   if (!this.isNew) {
//     next()
//   }

//   email({
//     type: `welcome`,
//     email: this.email,
//   })
//     .then(() => {
//       next()
//     })
//     .catch(err => {
//       logger.error(err)
//       next()
//     })
// })

export const User = mongoose.model(`User`, UserSchema)
