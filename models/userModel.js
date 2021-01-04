const crypto = require('crypto');
const moongose = require('mongoose');
const validatator = require('validator');

const bcrypt = require('bcryptjs');

const userSchema = new moongose.Schema({
  name: {
    type: String,
    required: [true, 'Name can not be left blank'],
  },
  email: {
    type: String,
    required: [true, 'email is must !!'],
    unique: true,
    lowercase: true,
    validate: [validatator.isEmail, 'Enter valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Provide password'],
    minlength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password'],
    //this only works on CREATE AND SAVE
    validate: {
      validator: function (ele) {
        return ele === this.password;
      },
      message: 'Password are not the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: String,
    default: true,
    select: false,
  },
});

//this is moongose middleware which will run just before data storage in database
userSchema.pre('save', async function (next) {
  //only run this function if password was modified
  if (!this.isModified('password')) return next();

  //hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //delete confirmpassword field
  this.confirmPassword = undefined;
  next();
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});
// these are instance method available with every document
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minnutes from now

  return resetToken;
};
const User = moongose.model('User', userSchema);

module.exports = User;
