import {
    openCanvas,
    blockCanvas
} from './webCanvas.js';

document.addEventListener("DOMContentLoaded", function () {

    // Prevent canvas from work when on page
    for (let pageUnit of document.querySelectorAll(".page-unit")) {
        pageUnit.addEventListener("mousemove", function (event) {
            event.stopPropagation();
            blockCanvas();
        });
    }

    for (let pageUnit of document.querySelectorAll(".page-unit")) {
        pageUnit.addEventListener("mouseout", function (event) {
            event.stopPropagation();
            openCanvas();
        });
    }

    // Prevent canvas from work when on popup
    for (let navigationPopUp of document.querySelectorAll(".navigationPopup")) {
        navigationPopUp.addEventListener("mousemove", function (event) {
            event.stopPropagation();
        });
    }

    // Prevent canvas from work when on header 
    for (let header of document.querySelectorAll(".header__navigation")) {
        header.addEventListener("mousemove", function (event) {
            blockCanvas();
        });
    }

    for (let header of document.querySelectorAll(".header__navigation")) {
        header.addEventListener("mouseout", function (event) {
            openCanvas();
        });
    }

    for (let header of document.querySelectorAll(".menu-container")) {
        header.addEventListener("mousemove", function (event) {
            blockCanvas();
        });
    }

    for (let header of document.querySelectorAll(".menu-container")) {
        header.addEventListener("mouseout", function (event) {
            openCanvas();
        });
    }

    // Prevent canvas from work when on contact 
    for (let btn of document.querySelectorAll(".contact-btn")) {
        btn.addEventListener("mousemove", function (event) {
            blockCanvas();
        });
    }

    for (let btn of document.querySelectorAll(".contact-btn")) {
        btn.addEventListener("mouseout", function (event) {
            openCanvas();
        });
    }

    // Close page action
    for (let closePageSpan of document.querySelectorAll(".closePageSpan")) {
        closePageSpan.addEventListener("click", (event) => {
            let pageToClose = event.target.dataset.page;
            document.querySelector(`#${pageToClose}`).classList.toggle("activePage");
            openCanvas();
        });
    }

    // Open page action
    for (let openPageElement of document.querySelectorAll(".openPageElement")) {
        openPageElement.addEventListener("click", (event) => {
            let pageToOpen = event.currentTarget.dataset.page;
            blockCanvas();
            menuContainer.classList.remove('active');
            document.querySelector(`#${pageToOpen}`).classList.toggle("activePage");
        });
    }

    // Open main page link
    for (let openMainPageItem of document.querySelectorAll('.openPageMain')) {
        openMainPageItem.addEventListener('click', () => {
            openCanvas();
            menuContainer.classList.remove('active');
            for (let page of document.querySelectorAll(".page-unit")) {
                page.classList.remove("activePage");
            }
        });
    }

    // Stopping animation after preloader
    let afterLoaderAnimationContainer = document.querySelector('.animation-container');
    let afterLoadedAnimation = document.querySelector('#animation-hint-2');
    afterLoadedAnimation.addEventListener('animationend', () => {
        afterLoaderAnimationContainer.classList.add("transparent");
        setTimeout(() => {
            afterLoaderAnimationContainer.classList.add('animation-end');
            openCanvas();
        }, 1000);
    });

    // Open menu
    let menuBtn = document.querySelector('.menu-btn');
    let menuCloseBtn = document.querySelector('.menu-close');
    let menuContainer = document.querySelector('.menu-container');
    menuBtn.addEventListener('click', () => {
        blockCanvas();
        menuContainer.classList.add('active');
    });
    menuCloseBtn.addEventListener('click', () => {
        openCanvas();
        menuContainer.classList.remove('active');
    });
});

const showNavigationPopup = (page, x, y) => {
    for (let popup of document.querySelectorAll(".navigationPopup")) {
        popup.classList.remove("activePopup");
        popup.style.left = `${window.innerWidth/2}px`;
        popup.style.bottom = `-100px`;
    }
    for (let popup of document.querySelectorAll(".navigationPopup")) {
        if (popup.dataset.page === page) {
            popup.style.left = `${x+popup.offsetWidth*0.2}px`;
            popup.style.bottom = `${y+62}px`;
            popup.classList.toggle("activePopup");
            console.log(x, y);
        }
    }
};

export default showNavigationPopup;