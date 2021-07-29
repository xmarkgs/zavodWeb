document.addEventListener("DOMContentLoaded", function () {


    for (let pageUnit of document.querySelectorAll(".page-unit")) {
        pageUnit.addEventListener("mousemove", function (event) {
            console.log("lol");
            event.stopPropagation();
        });
    }
    
    for (let navigationPopUp of document.querySelectorAll(".navigationPopup")) {
        navigationPopUp.addEventListener("mousemove", function (event) {
            event.stopPropagation(); 
        });
    }
    
    for (let closePageSpan of document.querySelectorAll(".closePageSpan")) {
        closePageSpan.addEventListener("click", function (event) {
            let pageToClose = event.target.dataset.page;
    
            document.querySelector(`#${pageToClose}`).classList.toggle("activePage");
        });
    }
    
    for (let openPageSpan of document.querySelectorAll(".openPageSpan")) {
        openPageSpan.addEventListener("click", function (event) {
            let pageToOpen = event.target.dataset.page;
    
            document.querySelector(`#${pageToOpen}`).classList.toggle("activePage");
        });
    }
});

const showNavigationPopup = (page) => {
    for (let popup of document.querySelectorAll(".navigationPopup")) {
        if (popup.dataset.page === page) {
            popup.classList.toggle("activePopup");
        }
    }
};

export default showNavigationPopup;
