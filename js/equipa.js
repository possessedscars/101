const openGallery = document.getElementById("openGallery");
const closeGallery = document.getElementById("closeGallery");

openGallery.addEventListener("click", function (e) {
    e.preventDefault();
    document.body.classList.add("gallery-open");
});

closeGallery.addEventListener("click", function () {
    document.body.classList.remove("gallery-open");
});