exports.toDatetime = function (dateObj) {
    let date = dateObj.getFullYear() + "-" + dateObj.getMonth() + "-" + dateObj.getDate();

    let time = dateObj.toLocaleTimeString();
    time = time.slice(0, -3);

    console.log(date + " " + time);
    return date + " " + time;
}