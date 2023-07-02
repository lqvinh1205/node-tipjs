const fs = require("fs").promises;
const path = require("path");
const { format } = require("date-fns");

const fileName = path.join(__dirname, "../Logs", "logs.log");
const logEvents = async (msg) => {
  try {
    const dateTime = `${format(new Date(), "dd-MM-yyyy\tss:mm:HH")}`;
    const contentLog = `${dateTime}------${msg}\n`;
    fs.appendFile(fileName, contentLog);
  } catch (error) {
    console.log(error);
  }
};

module.exports = logEvents;
