const timeElement = document.querySelector(".time");
const dateElement = document.querySelector(".date");

/**
 * 
 * @param {Date} date 
 */
function formatTime(date) {

    const hours = date.getHours();
    const minutes = date.getMinutes();

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * 
 * @param {Date} date 
 */

function formatDate(date) {

    const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function updateDateTime(){

    const now = new Date();

    timeElement.textContent = formatTime(now);
    dateElement.textContent = formatDate(now);

}

updateDateTime();
setInterval(updateDateTime, 1000);
