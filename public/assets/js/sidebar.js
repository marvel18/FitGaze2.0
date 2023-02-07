//const shrink_btn = document.querySelector(".shrink-btn");
const sidebar_links = document.querySelectorAll(".sidebar-links a");
const active_tab = document.querySelector(".active-tab");
const shortcuts = document.querySelector(".sidebar-links h4");
const tooltip_elements = document.querySelectorAll(".tooltip-element");
const settings = document.getElementById('settings');
const modal_container = document.getElementById('modal_container');
const modal_container2 = document.getElementById('modal_container2');
// const open = document.getElementById('settings');
// const open2 = document.getElementById('tutorial')
// const close = document.getElementById('close');
// const closet = document.getElementById('closet')
let activeIndex;

// shrink_btn.addEventListener("click", () => {
//   document.body.classList.toggle("shrink");
//   setTimeout(moveActiveTab, 400);

//   shrink_btn.classList.add("hovered");

//   setTimeout(() => {
//     shrink_btn.classList.remove("hovered");
//   }, 500);
// });


function moveActiveTab() {
  let topPosition = activeIndex * 58 + 2.5;

  if (activeIndex > 3) {
    topPosition += shortcuts.clientHeight;
  }

  active_tab.style.top = `${topPosition}px`;
}

function changeLink() {
  sidebar_links.forEach((sideLink) => sideLink.classList.remove("active"));
  this.classList.add("active");

  activeIndex = this.dataset.active;

  moveActiveTab();
}

sidebar_links.forEach((link) => link.addEventListener("click", changeLink));
var coll = document.getElementsByClassName("collapse-btn");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");

    var content = this.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    } 
  });
}