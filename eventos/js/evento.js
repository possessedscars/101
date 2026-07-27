const targetDate = new Date("2026-07-29T22:00:00").getTime();

function updateCountdown(){

    const now = new Date().getTime();

    const distance = targetDate - now;

    if(distance <= 0){

        return;

    }

    document.getElementById("days").textContent =
        Math.floor(distance / (1000 * 60 * 60 * 24));

    document.getElementById("hours").textContent =
        Math.floor((distance % (1000*60*60*24)) / (1000*60*60));

    document.getElementById("minutes").textContent =
        Math.floor((distance % (1000*60*60)) / (1000*60));

    document.getElementById("seconds").textContent =
        Math.floor((distance % (1000*60)) / 1000);

}

updateCountdown();

setInterval(updateCountdown,1000);
