const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    organisation: { type: String, default: "", trim: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

userSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    organisation: this.organisation,
    created_at: this.created_at,
  };
};

module.exports = mongoose.model("User", userSchema);
