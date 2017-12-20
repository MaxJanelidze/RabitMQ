module.exports = function work(msg, cb) {
  console.log(msg)
  console.log("Got msg", msg.content.toString());
  cb(true);
};
