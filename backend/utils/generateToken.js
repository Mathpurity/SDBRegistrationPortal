import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.Vision_Africa, {
    expiresIn: "30d",
  });
};

export default generateToken;
