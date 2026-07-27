window.addEventListener("scroll",()=>{

    const header=document.querySelector("header");

    if(window.scrollY>50){

        header.style.background="rgba(5,5,5,.55)";
        header.style.borderBottom="1px solid rgba(255,255,255,.05)";

    }

    else{

        header.style.background="transparent";
        header.style.borderBottom="none";

    }

});