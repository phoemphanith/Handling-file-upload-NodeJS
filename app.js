const express = require("express");
const multer = require("multer");
const path = require("path");
const app = express();

const helpers = require("./helper.js");

app.use(express.static(__dirname + "/public"));

// **define the storage location for our images:
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  //**By default, multer removes file extensions so let's add them back
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// **File Validation and Upload
app.post("/upload-profile-pic", (req, res) => {
  // **'profile_pic' is the name of our file input field in the HTML form
  let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).single("profile_pic");

  upload(req, res, function (err) {
    // **req.file contains information of uploaded file
    // **req.body contains information of text fields, if there were any
    if (req.fileValidationError) {
      return res.send(req.fileValidationError);
    } else if (!req.file) {
      return res.send("Please select an image to upload");
    } else if (err instanceof multer.MulterError) {
      return res.send(err);
    } else if (err) {
      return res.send(err);
    }
    console.log(req.file.path);
    // **Display uploaded image for user validation
    res.send(
      `You have uploaded this image: <hr/><img src="/${req.file.path.slice(7)}" width="500">
        <hr />
        <a href="./">Upload another image</a>
      `
    );
  });
});
app.post("/upload-multiple-images", (req, res) => {
  // **10 is the limit I've defined for number of uploaded files at once
  // **'multiple_images' is the name of our file input field
  let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).array("multiple_images", 10);

  upload(req, res, function (err) {
    if (req.fileValidationError) {
      return res.send(req.fileValidationError);
    } else if (err instanceof multer.MulterError) {
      return res.send(err);
    } else if (err) {
      return res.send(err);
    } // **The same as when uploading single images

    let result = "You have uploaded these images: <hr />";
    const files = req.files;
    let index, len;
    console.log(files);

    // **Loop through all the uploaded images and display them on frontend
    for (index = 0, len = files.length; index < len; ++index) {
      result += `<img src="/${files[index].path.slice(7)}" width="300" style="margin-right: 20px;">`;
    }
    result += '<hr/><a href="./">Upload more images</a>';
    res.send(result);
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
