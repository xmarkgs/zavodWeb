import {
    openCanvas,
    blockCanvas,
    changeCanvasLanguage
} from './webCanvas.js';


let webSiteLanguage = "ru";


document.addEventListener("DOMContentLoaded", function () {
    let menuBtn = document.querySelectorAll('.menu-btn');
    let menuCloseBtn = document.querySelectorAll('.menu-close');
    let menuContainer = document.querySelector('.menu-container');
    let afterLoaderAnimationContainer = document.querySelector('.animation-container');
    let afterLoadedAnimation = document.querySelector('#animation-hint-2');
    let languageSwitcher = document.querySelectorAll('.language-switcher');
    let langSwitch = document.querySelectorAll('.lang-switch');
    let pagePreview = document.querySelectorAll('.page-preview');

    if (window.location.href.includes("lang=en")) {
        changeLanguage("en");
    } else {
        changeLanguage("ru");
    }

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
            for (let page of document.querySelectorAll(".page-container")) {
                page.scrollTop = 0;
            }
            let pageToClose = event.target.dataset.page;
            document.querySelector(`#${pageToClose}`).classList.toggle("activePage");
            openCanvas();
        });
    }

    // Open page action
    for (let openPageElement of document.querySelectorAll(".openPageElement")) {
        openPageElement.addEventListener("click", (event) => {
            for (let pageUnit of document.querySelectorAll(".page-unit")) {
                pageUnit.classList.remove('activePage');
            }
            for (let page of document.querySelectorAll(".page-container")) {
                page.scrollTop = 0;
            }
            let pageToOpen = event.currentTarget.dataset.page;
            blockCanvas();
            document.querySelector(`.menu-container.${webSiteLanguage}-container`).classList.remove('active');
            document.querySelector(`#${pageToOpen}`).classList.toggle("activePage");
        });
    }

    // Open submenu action
    for (let submenu of document.querySelectorAll('.openSubMenuElement')) {
        submenu.addEventListener('click', (event) => {
            let subMenuItem = event.currentTarget.dataset.submenu;

            event.currentTarget.classList.toggle('active');
            document.querySelector(`.${subMenuItem}`).classList.toggle('active');
        });
    }

    // Open main page link
    for (let openMainPageItem of document.querySelectorAll('.openPageMain')) {
        openMainPageItem.addEventListener('click', () => {
            openCanvas();
            document.querySelector(`.menu-container.${webSiteLanguage}-container`).classList.remove('active');
            for (let page of document.querySelectorAll(".page-unit")) {
                page.classList.remove("activePage");
            }
            for (let page of document.querySelectorAll(".page-container")) {
                page.scrollTop = 0;
            }
        });
    }

    // Scroll to page content after scroll on page preview
    let pageScroll = false;
    for (let page of document.querySelectorAll(".page-container")) {
        page.addEventListener('scroll', (event) => {
            if (event.target === page && event.target !== document.querySelector('#content-contactPage-ru') && event.target !== document.querySelector('#content-contactPage-en')) {
                if (page.scrollTop >= window.innerHeight || page.scrollTop === 0) {
                    pageScroll = false;
                    page.classList.remove('no-scroll');
                    for (let pageUnit of document.querySelectorAll(".page-unit")) {
                        pageUnit.classList.remove('scrolling');
                    }
                }
                if (pageScroll === false) {
                    if (page.scrollTop <= window.innerHeight) {
                        event.preventDefault();

                        if (pageScroll === false) {
                            if (page.scrollTop > 1 && page.scrollTop < window.innerHeight - 10) {
                                page.scrollTop = pagePreview[0].offsetHeight + 2;
                                page.classList.add('no-scroll');
                                for (let pageUnit of document.querySelectorAll(".page-unit")) {
                                    pageUnit.classList.add('scrolling');
                                }
                                pageScroll = true;

                            }

                            if (page.scrollTop > window.innerHeight - 10 && page.scrollTop < window.innerHeight) {
                                page.scrollTop = 0;
                                page.classList.add('no-scroll');
                                for (let pageUnit of document.querySelectorAll(".page-unit")) {
                                    pageUnit.classList.add('scrolling');
                                }
                                pageScroll = true;
                            }
                        }
                    }
                } else {
                    event.preventDefault();
                }



            }
        });
    }


    // Closing page when click on page preview empty area
    for (let preview of pagePreview) {
        preview.addEventListener('click', (event) => {
            if (event.target === event.currentTarget) {
                changeLanguage(webSiteLanguage);
            }
        });
    }

    // Stopping animation after preloader
    afterLoadedAnimation.addEventListener('animationend', () => {
        afterLoaderAnimationContainer.classList.add("transparent");
        setTimeout(() => {
            afterLoaderAnimationContainer.classList.add('animation-end');
            openCanvas();
        }, 1000);
    });

    // Open menu
    for (let btn of menuBtn) {
        btn.addEventListener('click', () => {
            blockCanvas();
            document.querySelector(`.menu-container.${webSiteLanguage}-container`).classList.add('active');
        });
    }

    for (let btn of menuCloseBtn) {
        btn.addEventListener('click', () => {
            openCanvas();
            document.querySelector(`.menu-container.${webSiteLanguage}-container`).classList.remove('active');
        });
    }

    // Open language switcher

    for (let switcher of languageSwitcher) {
        switcher.addEventListener('click', () => {
            switcher.classList.toggle('active');
            for (let switcher of langSwitch) {
                switcher.classList.toggle('active');
            }
        });
    }

    for (let switcher of langSwitch) {
        switcher.addEventListener('click', (event) => {
            let language = event.currentTarget.dataset.lang;

            changeLanguage(language);
        });
    }
});

function changeLanguage(lang) {
    blockCanvas();
    changeCanvasLanguage(lang);
    webSiteLanguage = lang;
    // Close everything
    for (let popup of document.querySelectorAll(".navigationPopup")) {
        popup.classList.remove("activePopup");
        popup.style.bottom = "-100px";
    }
    for (let page of document.querySelectorAll(".page-unit")) {
        page.classList.remove("activePage");
    }
    for (let menu of document.querySelectorAll(".menu-container")) {
        menu.classList.remove("active");
    }
    for (let container of document.querySelectorAll(".ru-container")) {
        container.classList.add("unactiveContainer");
    }
    for (let container of document.querySelectorAll(".en-container")) {
        container.classList.add("unactiveContainer");
    }
    // Show new language containers
    for (let container of document.querySelectorAll(`.${lang}-container`)) {
        container.classList.remove("unactiveContainer");
    }
    window.history.replaceState({}, "Zavod Web", `http://localhost:5500/main.html?lang=${lang}`);
    openCanvas();
};


const showNavigationPopup = (page, x, y) => {
    for (let popup of document.querySelectorAll(".navigationPopup")) {
        popup.classList.remove("activePopup");
        popup.style.left = `${window.innerWidth/2}px`;
        popup.style.bottom = `-100px`;
    }
    for (let popup of document.querySelectorAll(".navigationPopup")) {
        if (popup.dataset.page === page) {
            if (window.screen.width < 768) {
                popup.style.left = `5px`;
                popup.style.bottom = `72px`;
            } else {
                popup.style.left = `${x+popup.offsetWidth*0.2}px`;
                popup.style.bottom = `${y+62}px`;
            }

            popup.classList.toggle("activePopup");
        }
    }
};

export default showNavigationPopup;