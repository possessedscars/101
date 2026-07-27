const cursor = document.querySelector(".cursor");
const dot = document.querySelector(".cursor-dot");

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

let cursorX = mouseX;
let cursorY = mouseY;

window.addEventListener("mousemove",(e)=>{

    mouseX=e.clientX;
    mouseY=e.clientY;

    dot.style.left=mouseX+"px";
    dot.style.top=mouseY+"px";

});

function animate(){

    cursorX += (mouseX-cursorX)*0.16;
    cursorY += (mouseY-cursorY)*0.16;

    cursor.style.left=cursorX+"px";
    cursor.style.top=cursorY+"px";

    requestAnimationFrame(animate);

}

animate();

document.querySelectorAll("a,button,.btn-primary,.btn-secondary").forEach(el=>{

    el.addEventListener("mouseenter",()=>{

        cursor.classList.add("hover");

    });

    el.addEventListener("mouseleave",()=>{

        cursor.classList.remove("hover");

    });

});