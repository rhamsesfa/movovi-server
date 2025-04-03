const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = (req, res, next) => {
  try {
    console.log(req.headers.authorization)
    const token = req.headers.authorization.split(" ")[1];

    const decodedToken = jwt.verify(
      token,
      "JxqKuulLNPCNfytiyqtsygygfRJYTjgkbhilaebAqetflqRfhhouhpb"
    );

    const userId = decodedToken.userId;

    req.auth = {
      userId: userId,
    };

    User.findOne({
      _id: userId,
    }).then(
      (user) => {
        console.log("ici meme");

        if (user && !user.locked) {
          
          console.log("c'est ici");

          next();
        } else {
          res.status(201).json({ status: 5, message: "Déconnectez-le" });
        }
      },
      (err) => {
        res.status(402).json({ err });
      }
    );
  } catch (error) {
    console.log(error);
    res.status(401).json({ error });
  }
};