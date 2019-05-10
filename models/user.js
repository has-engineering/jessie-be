const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  identificationNumber: {
    type: String,
    required: true
  },
  nationality: {
    type: String,
    required: true
  },
  contactNo: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  maritalStatus: {
    type: String,
    required: true
  },
  profileImage: {
    type: String
  }
});

UserSchema.pre("save", function(next) {
  const user = this,
    SALT_FACTOR = 7;

  if (!user.isModified("password")) return next();

  bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, null, (err1, hash) => {
      if (err1) return next(err1);
      user.password = hash;
      next();
    });
  });
});

// Method to compare password for login
UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

module.exports = mongoose.model("User", UserSchema);

// bankAccount
// EpfAccount
// SocsoAccount

// department
// designation
// supervisor
// employmentStatus
// startWorkingDay
// lastWorkingDay

// leave: type, number
