gsap.registerPlugin(ScrollTrigger);

/* --------------------------
   LENIS
--------------------------- */

const lenis = new Lenis({
    duration: 1.15,
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.3
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

/* --------------------------
   HERO
--------------------------- */

const tl = gsap.timeline();

tl.from(".hero span", {
    y: 50,
    opacity: 0,
    duration: 0.8
})

.from(".hero h1", {
    y: 90,
    opacity: 0,
    duration: 1
}, "-=.4")

.from(".hero h2", {
    y: 70,
    opacity: 0,
    duration: .8
}, "-=.7")

.from(".hero p", {
    y: 40,
    opacity: 0,
    duration: .8
}, "-=.6")

.from(".buttons a", {
    y: 40,
    opacity: 0,
    stagger: .15,
    duration: .7
}, "-=.4");

/* --------------------------
   SCROLL ANIMATIONS
--------------------------- */

gsap.utils.toArray("section").forEach(section => {

    gsap.from(section, {

        opacity:0,

        y:100,

        duration:1,

        ease:"power3.out",

        scrollTrigger:{
            trigger:section,
            start:"top 82%"
        }

    });

});

/* --------------------------
   PARALLAX
--------------------------- */

gsap.to("video",{

    scale:1.25,

    ease:"none",

    scrollTrigger:{

        trigger:".hero",

        scrub:true,

        start:"top top",

        end:"bottom top"

    }

});

/* --------------------------
   FLOAT EFFECT
--------------------------- */

gsap.to(".hero-content",{

    y:20,

    repeat:-1,

    yoyo:true,

    ease:"sine.inOut",

    duration:4

});
/* --------------------------
   MOUSE GLOW
--------------------------- */

const glow = document.querySelector(".mouse-glow");

let glowX = window.innerWidth / 2;
let glowY = window.innerHeight / 2;

window.addEventListener("mousemove",(e)=>{

    glowX = e.clientX;
    glowY = e.clientY;

});

gsap.ticker.add(()=>{

    gsap.set(glow,{
        x:glowX,
        y:glowY
    });

});
/* --------------------------
   MAGNET BUTTONS
--------------------------- */

document.querySelectorAll(".btn-primary,.btn-secondary").forEach(button=>{

    button.addEventListener("mousemove",(e)=>{

        const rect = button.getBoundingClientRect();

        const x = e.clientX - rect.left - rect.width/2;
        const y = e.clientY - rect.top - rect.height/2;

        gsap.to(button,{
            x:x*.18,
            y:y*.18,
            duration:.35,
            ease:"power2.out"
        });

    });

    button.addEventListener("mouseleave",()=>{

        gsap.to(button,{
            x:0,
            y:0,
            duration:.4
        });

    });

});
gsap.utils.toArray(".event-card").forEach((card,i)=>{

    gsap.from(card,{
        opacity:0,
        y:80,
        duration:1,
        delay:i*0.15,
        ease:"power3.out",
        scrollTrigger:{
            trigger:card,
            start:"top 85%"
        }
    });

});

gsap.from(".featured-event",{

    opacity:0,

    scale:.92,

    duration:1.2,

    ease:"power3.out",

    scrollTrigger:{
        trigger:".featured-event",
        start:"top 75%"
    }

});
gsap.utils.toArray(".gallery-item").forEach((item,i)=>{

    gsap.from(item,{
        opacity:0,
        y:100,
        duration:1,
        delay:i*0.08,
        ease:"power3.out",
        scrollTrigger:{
            trigger:item,
            start:"top 85%"
        }
    });

});