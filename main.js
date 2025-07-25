myFunction();
function myFunction() {
    let icon = document.getElementById("icon1");
    let body_section = document.getElementById("body-section*");
    icon.onclick = function () {
        document.body.classList.toggle("dark-mode");
        if (document.body.classList.contains("dark-mode")) {
            icon.className= "fas fa-sun";
        }
        else {
            icon.className = "fas fa-moon";
        }
    };
}

var typed = new Typed(".span7",{
    strings:["","Web Designer","Web Developer","Graphic Designer"],
    typeSpeed:100,
    BackSpeed:60,
    loop:true
})

