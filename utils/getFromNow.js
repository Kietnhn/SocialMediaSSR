const moment = require("moment");
module.exports = function (date) {
    const formattedDate = moment(date).fromNow();
    return formattedDate;
};
