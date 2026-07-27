const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

let w,h;

function resize(){

    w=canvas.width=window.innerWidth;
    h=canvas.height=window.innerHeight;

}

window.addEventListener("resize",resize);

resize();

const particles=[];

for(let i=0;i<90;i++){

    particles.push({

        x:Math.random()*w,
        y:Math.random()*h,
        r:Math.random()*2+1,
        vx:(Math.random()-.5)*.2,
        vy:(Math.random()-.5)*.2

    });

}

function draw(){

    ctx.clearRect(0,0,w,h);

    particles.forEach(p=>{

        p.x+=p.vx;
        p.y+=p.vy;

        if(p.x<0||p.x>w)p.vx*=-1;
        if(p.y<0||p.y>h)p.vy*=-1;

        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle="rgba(139,92,246,.55)";
        ctx.fill();

    });

    for(let i=0;i<particles.length;i++){

        for(let j=i+1;j<particles.length;j++){

            const dx=particles[i].x-particles[j].x;
            const dy=particles[i].y-particles[j].y;

            const dist=Math.sqrt(dx*dx+dy*dy);

            if(dist<140){

                ctx.beginPath();
                ctx.moveTo(particles[i].x,particles[i].y);
                ctx.lineTo(particles[j].x,particles[j].y);
                ctx.strokeStyle=`rgba(139,92,246,${0.12-(dist/1400)})`;
                ctx.stroke();

            }

        }

    }

    requestAnimationFrame(draw);

}

draw();