document.addEventListener("DOMContentLoaded", function () {
    let languageSwitcher = document.querySelectorAll('.language-switcher');
    let langSwitch = document.querySelectorAll('.lang-switch');
    let menuBtn = document.querySelectorAll('.menu-btn');
    let menuCloseBtn = document.querySelectorAll('.menu-close');

    // Add animation loader
    if (document.querySelector('.animation-container')) {
        let afterLoaderAnimationContainer = document.querySelector('.animation-container');
        let afterLoadedAnimation = document.querySelector('#animation-hint-1');

        afterLoadedAnimation.addEventListener('animationend', () => {
            afterLoaderAnimationContainer.classList.add("transparent");
            setTimeout(() => {
                afterLoaderAnimationContainer.classList.add('animation-end');
            }, 1000);
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

    // Open menu
    for (let btn of menuBtn) {
        btn.addEventListener('click', () => {
            document.querySelector(`.menu-container`).classList.add('active');
        });
    }

    for (let btn of menuCloseBtn) {
        btn.addEventListener('click', () => {
            document.querySelector(`.menu-container`).classList.remove('active');
        });
    }

    // Open submenu
    for (let submenu of document.querySelectorAll('.openSubMenuElement')) {
        submenu.addEventListener('click', (event) => {
            let subMenuItem = event.currentTarget.dataset.submenu;

            event.currentTarget.classList.toggle('active');
            document.querySelector(`.${subMenuItem}`).classList.toggle('active');
        });
    }

    // Track active section
    if (document.querySelector('#fullpage')) {
        let fullPageSection = document.querySelectorAll('.section');
        let pageInfos = document.querySelectorAll('.page-info');
        const observerConfig = {
            attributes: true
        };
        const trackClassChange = function (mutationsList, observer) {
            for (let mutation of mutationsList) {
                if (mutation.type === 'attributes') {
                    console.log('The ' + mutation.attributeName + ' attribute was modified.');
                    showPageInfo();
                }
            }
        };
        const observer1 = new MutationObserver(trackClassChange);
        const observer2 = new MutationObserver(trackClassChange);
        const observer3 = new MutationObserver(trackClassChange);
        const observer4 = new MutationObserver(trackClassChange);
        observer1.observe(fullPageSection[0], observerConfig);
        observer2.observe(fullPageSection[1], observerConfig);

        function showPageInfo() {
            if (!document.querySelector('#fullpage').classList.contains("disabled")) {
                for (let pageInfo of pageInfos) {
                    pageInfo.classList.remove('active');
                }
    
                for (let section of fullPageSection) {
                    if (section.classList.contains("active")) {
                        let pageInfoToShow = section.dataset.page;
                        document.querySelector(`.page-info_${pageInfoToShow}`).classList.add('active');
                    }
                }
            }
        }
    }
});