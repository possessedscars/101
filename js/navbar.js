let lastScroll = 0;

const header = document.querySelector("header");

window.addEventListener("scroll",()=>{

    const current = window.pageYOffset;

    if(current > lastScroll && current > 120){

        header.style.transform = "translateY(-120%)";

    }else{

        header.style.transform = "translateY(0)";

    }

    if(current > 50){

        header.style.background = "rgba(10,10,10,.75)";
        header.style.backdropFilter = "blur(24px)";
        header.style.borderBottom = "1px solid rgba(255,255,255,.08)";

    }else{

        header.style.background = "rgba(10,10,10,.25)";
        header.style.borderBottom = "1px solid rgba(255,255,255,.03)";

    }

    lastScroll = current;

});