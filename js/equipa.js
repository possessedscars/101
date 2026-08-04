const members = [

    {
        name: "DUARTE CRUZ",
        role: "CEO",
        photo: "assets/team/member1.jpg",
        description: "Descrição do Duarte."
    },

    {
        name: "ELEONOR THORNE",
        role: "CO-CEO",
        photo: "assets/team/member2.jpg",
        description: "Descrição do segundo membro."
    },

    {
        name: "NOME MEMBRO",
        role: "CREATIVE DIRECTOR",
        photo: "assets/team/member3.jpg",
        description: "Descrição do terceiro membro."
    },

    {
        name: "NOME MEMBRO",
        role: "HEAD OF EVENTS",
        photo: "assets/team/member4.jpg",
        description: "Descrição do quarto membro."
    },

    {
        name: "NOME MEMBRO",
        role: "MARKETING",
        photo: "assets/team/member5.jpg",
        description: "Descrição do quinto membro."
    }

];

let currentMember = 0;

const body = document.body;

const hero = document.getElementById("team-hero");
const gallery = document.getElementById("team-members");

const openBtn = document.getElementById("openGallery");
const closeBtn = document.getElementById("closeGallery");

const prevBtn = document.getElementById("prevMember");
const nextBtn = document.getElementById("nextMember");

const image = document.getElementById("memberImage");
const role = document.getElementById("memberRole");
const name = document.getElementById("memberName");
const description = document.getElementById("memberDescription");

function renderMember(){

    const member = members[currentMember];

    image.src = member.image;
    image.alt = member.name;

    role.textContent = member.role;
    name.textContent = member.name;
    description.textContent = member.description;

}

openBtn.addEventListener("click", e=>{

    e.preventDefault();

    body.classList.add("gallery-open");

});

closeBtn.addEventListener("click", ()=>{

    body.classList.remove("gallery-open");

});

nextBtn.addEventListener("click", ()=>{

    currentMember++;

    if(currentMember >= members.length){

        currentMember = 0;

    }

    renderMember();

});

prevBtn.addEventListener("click", ()=>{

    currentMember--;

    if(currentMember < 0){

        currentMember = members.length - 1;

    }

    renderMember();

});

renderMember();