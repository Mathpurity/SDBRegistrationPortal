import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
  schoolName: { type: String, required: true },
  coachName: { type: String },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String },
  state: { type: String },
  reason: { type: String },
  logo: { type: String },
  receipt: { type: String },
  status: { type: String, default: "Pending" },
  dateRegistered: { type: Date, default: Date.now },
  regNumber: { type: String, unique: true }, // ✅ fixed — removed required:true
});

registrationSchema.pre("save", async function (next) {
  if (this.regNumber) return next();

  try {
    const lastRecord = await mongoose
      .model("Registration")
      .findOne()
      .sort({ dateRegistered: -1 });

    let nextNumber = 1111;
    if (lastRecord && lastRecord.regNumber) {
      const lastNum = parseInt(lastRecord.regNumber.split("/")[1]);
      if (!isNaN(lastNum)) nextNumber = lastNum + 121;
    }

    this.regNumber = `VARSDB26/${nextNumber}`;
    next();
  } catch (err) {
    console.error("Error generating regNumber:", err);
    next(err);
  }
});

const Registration =
  mongoose.models.Registration ||
  mongoose.model("Registration", registrationSchema);

export default Registration;
