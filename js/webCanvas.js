"use strict";

// Imports
import * as THREE from 'https://cdn.skypack.dev/three@0.129.0';
import {
    OrbitControls
} from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';
import {
    GLTFLoader
} from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import {
    RGBELoader
} from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/RGBELoader.js';
import {
    GUI
} from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/libs/dat.gui.module';
import showNavigationPopup from './infoPages.js';


let canvasLanguage = "ru";

// GUI
// const gui = new GUI();

// Loading manager
const manager = new THREE.LoadingManager();
manager.onStart = function (url, itemsLoaded, itemsTotal) {
    console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    document.getElementsByClassName('preloader')[0].classList.toggle("loading");
};

manager.onLoad = function () {
    console.log('Loading complete!');
    document.getElementsByClassName('preloader')[0].classList.remove("blank");
    document.getElementsByClassName('preloader')[0].classList.add("loaded");
    document.getElementsByClassName('preloader')[0].classList.toggle("loading");
    document.querySelector('.animation-container').classList.add('animated');
    blockCanvas();
};

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    let percentage = Math.round((itemsLoaded / itemsTotal) * 100);
    console.log(percentage);
    let loaderActive = document.querySelector('.progress-loader-active');
    let loaderIndicator = document.querySelector('.progress-loader-indicator');
    let loaderStatus = document.querySelector('.progress-loader-status');

    if (itemsTotal > 10) {
        loaderStatus.innerHTML = "loading 3D model...";
    } else {
        loaderStatus.innerHTML = "loading assets...";
    }

    loaderActive.style.width = `${percentage}%`;
    loaderIndicator.innerHTML = `${percentage}%`;

    console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
};

manager.onError = function (url) {
    console.log('There was an error loading ' + url);
};

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.TextureLoader(manager).load('threejs_assets/textures/bg.png');
scene.fog = new THREE.FogExp2("rgb(138, 220, 211)", 0.001);

// Lights
const light = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.castShadow = true;
scene.add(directionalLight);

const pointLight1 = new THREE.PointLight(0xD4D4D4, 500, 3900);
pointLight1.position.x = 350;
pointLight1.position.y = 120;
pointLight1.position.z = 186;
pointLight1.castShadow = true;
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight("rgb(231,179,146)", 220, 3000);
pointLight2.position.x = -140;
pointLight2.position.y = 80;
pointLight2.position.z = -174;
pointLight2.castShadow = true;
scene.add(pointLight2);

// gui.add(pointLight2, 'intensity');
// gui.add(pointLight2, 'distance');
// gui.add(pointLight2.position, 'x');
// gui.add(pointLight2.position, 'y');
// gui.add(pointLight2.position, 'z');

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000000000);
camera.position.x = 233;
camera.position.y = 74;
camera.position.z = 233;


// Canvas and renderer
let canvas = document.querySelector('canvas.webgl');
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    logarithmicDepthBuffer: true
});
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// Env. map
let envMap;
new RGBELoader(manager)
    .setDataType(THREE.UnsignedByteType)
    .setPath('threejs_assets/envmaps/')
    .load('venice_sunset_1k.hdr', function (texture) {
        envMap = pmremGenerator.fromEquirectangular(texture).texture;

        // scene.background = envMap;
        scene.environment = envMap;

        texture.dispose();
        pmremGenerator.dispose();
    });

// Handling window resize
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    console.log(sizes);

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Model
const loader = new GLTFLoader(manager);

let model;
loader.load(
    // resource URL
    'threejs_assets/models/zavod.gltf',
    // called when the resource is loaded
    function (gltf) {

        model = gltf.scene;
        model.receiveShadow = true;
        model.castShadow = true;

        for (let child of model.children) {
            if (child.type === "Object3D") {
                for (let anotherChild of child.children) {
                    if (anotherChild.type === "Object3D") {
                        for (let yetAnotherChild of anotherChild.children) {
                            if (yetAnotherChild.type === "Object3D") {

                            } else if (anotherChild.type === "Mesh") {
                                yetAnotherChild.castShadow = true;
                                yetAnotherChild.receiveShadow = true;
                                yetAnotherChild.material.roughness = 0.5;

                                // Remove metalness for ground and other deco cubes
                                if (yetAnotherChild.name.includes("Cube")) {
                                    yetAnotherChild.material.roughness = 0.9;
                                }
                            }
                        }
                    } else if (anotherChild.type === "Mesh") {
                        anotherChild.castShadow = true;
                        anotherChild.receiveShadow = true;
                        anotherChild.material.roughness = 0.5;

                        // Remove metalness for ground and other deco cubes
                        if (anotherChild.name.includes("Cube")) {
                            anotherChild.material.roughness = 0.9;
                        }
                    }
                }
            } else if (child.type === "Mesh") {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.roughness = 0.5;

                // Remove metalness for ground and other deco cubes
                if (child.name.includes("Cube")) {
                    child.material.roughness = 0.9;
                }

                // Darken mountains texture
                if (child.name.includes("Landscape")) {
                    // child.material = model.children[2].children[].material;
                }
            }
        }


        let newChildren = [];
        for (let modelPart of model.children) {
            if (modelPart.name.includes("Cube")) {
                if (modelPart.name === "Cube_6") {
                    modelPart.children[0].material.roughness = 0.9;
                }
                newChildren.push(modelPart);
            } else {
                newChildren.push(modelPart);
            }
        }
        model.children = newChildren;
        scene.add(model);
        console.log(model);


        gltf.animations; // Array<THREE.AnimationClip>
        gltf.scene; // THREE.Group
        gltf.scenes; // Array<THREE.Group>
        gltf.cameras; // Array<THREE.Camera>
        gltf.asset; // Object
    }
);

/* 
Highlighting boxes
*/

// aluTubesPage
let aluTubesPageGeometry = new THREE.BoxGeometry(176, 50, 71);
let aluTubesMaterial = new THREE.MeshPhongMaterial({
    color: "#FFFFFF",
    opacity: 0,
    transparent: true,
});
let aluTubesPage = new THREE.Mesh(aluTubesPageGeometry, aluTubesMaterial);
aluTubesPage.name = "aluTubesPage";
aluTubesPage.position.x = 35;
aluTubesPage.position.y = 20;
aluTubesPage.position.z = 127;
aluTubesPage.rotation.y = -0.03;
scene.add(aluTubesPage);


// aboutOwnerPage
let aboutOwnerGeometry = new THREE.BoxGeometry(132, 41, 71);
let aboutOwnerMaterial = new THREE.MeshPhongMaterial({
    color: "#FFFFFF",
    opacity: 0,
    transparent: true,
});
let aboutOwnerPage = new THREE.Mesh(aboutOwnerGeometry, aboutOwnerMaterial);
aboutOwnerPage.name = "aboutOwnerPage";
aboutOwnerPage.position.x = -132;
aboutOwnerPage.position.y = 18;
aboutOwnerPage.position.z = 132;
aboutOwnerPage.rotation.y = 0.21;
scene.add(aboutOwnerPage);

// laminateTubesPage
let laminateTubesGeometry = new THREE.BoxGeometry(143, 50, 95);
let laminateTubesMaterial = new THREE.MeshPhongMaterial({
    color: "#FFFFFF",
    opacity: 0,
    transparent: true,
});
let laminateTubesPage = new THREE.Mesh(laminateTubesGeometry, laminateTubesMaterial);
laminateTubesPage.name = "laminateTubesPage";
laminateTubesPage.position.x = -206;
laminateTubesPage.position.y = 20;
laminateTubesPage.position.z = 26;
laminateTubesPage.rotation.y = 0.22;
scene.add(laminateTubesPage);

// aboutHRPage
let aboutHRGeometry = new THREE.BoxGeometry(130, 50, 48);
let aboutHRMaterial = new THREE.MeshPhongMaterial({
    color: "#FFFFFF",
    opacity: 0,
    transparent: true,
});
let aboutHRPage = new THREE.Mesh(aboutHRGeometry, aboutHRMaterial);
aboutHRPage.name = "aboutHRPage";
aboutHRPage.position.x = -67;
aboutHRPage.position.y = 15;
aboutHRPage.position.z = 16;
aboutHRPage.rotation.y = -0.89;
scene.add(aboutHRPage);

// featuresPage
let featuresGeometry = new THREE.BoxGeometry(64, 50, 64);
let featuresMaterial = new THREE.MeshPhongMaterial({
    color: "#FFFFFF",
    opacity: 0,
    transparent: true,
});
let featuresPage = new THREE.Mesh(featuresGeometry, featuresMaterial);
featuresPage.name = "featuresPage";
featuresPage.position.x = 51.8;
featuresPage.position.y = 9;
featuresPage.position.z = -16;
featuresPage.rotation.y = 0;
scene.add(featuresPage);

// rAndDPage
let rAndDGeometry = new THREE.BoxGeometry(59, 50, 41);
let rAndDMaterial = new THREE.MeshPhongMaterial({
    color: "#FFFFFF",
    opacity: 0,
    transparent: true,
});
let rAndDPage = new THREE.Mesh(rAndDGeometry, rAndDMaterial);
rAndDPage.name = "rAndDPage";
rAndDPage.position.x = -150.5;
rAndDPage.position.y = 11;
rAndDPage.position.z = -103.2;
rAndDPage.rotation.y = 0.21;
scene.add(rAndDPage);

// qualityPage
let qualityGeometry = new THREE.BoxGeometry(145, 50, 117);
let qualityMaterial = new THREE.MeshPhongMaterial({
    color: "#FFFFFF",
    opacity: 0,
    transparent: true,
});
let qualityPage = new THREE.Mesh(qualityGeometry, qualityMaterial);
qualityPage.name = "qualityPage";
qualityPage.position.x = 191;
qualityPage.position.y = 15;
qualityPage.position.z = -7.5;
qualityPage.rotation.y = 0.22;
scene.add(qualityPage);

// ecologyPage
let ecologyGeometry = new THREE.BoxGeometry(145, 50, 117);
let ecologyMaterial = new THREE.MeshPhongMaterial({
    color: "#FFFFFF",
    opacity: 0,
    transparent: true,
});
let ecologyPage = new THREE.Mesh(ecologyGeometry, ecologyMaterial);
ecologyPage.name = "ecologyPage";
ecologyPage.position.x = 163;
ecologyPage.position.y = 15;
ecologyPage.position.z = -142;
ecologyPage.rotation.y = 0.21;
scene.add(ecologyPage);

// polyethyleneTubesPage
let polyethyleneTubesGeometry = new THREE.BoxGeometry(155, 50, 101);
let polyethyleneTubesMaterial = new THREE.MeshPhongMaterial({
    color: "#FFFFFF",
    opacity: 0,
    transparent: true,
});
let polyethyleneTubesPage = new THREE.Mesh(polyethyleneTubesGeometry, polyethyleneTubesMaterial);
polyethyleneTubesPage.name = "polyethyleneTubesPage";
polyethyleneTubesPage.position.x = -23;
polyethyleneTubesPage.position.y = 16;
polyethyleneTubesPage.position.z = -100;
polyethyleneTubesPage.rotation.y = 0.2;
scene.add(polyethyleneTubesPage);

// logisticsPage
let logisticsGeometry = new THREE.BoxGeometry(275, 50, 215);
let logisticsMaterial = new THREE.MeshPhongMaterial({
    color: "#FFFFFF",
    opacity: 0,
    transparent: true,
});
let logisticsPage = new THREE.Mesh(logisticsGeometry, logisticsMaterial);
logisticsPage.name = "logisticsPage";
logisticsPage.position.x = -57;
logisticsPage.position.y = 15;
logisticsPage.position.z = -280;
logisticsPage.rotation.y = 0.2;
// gui.add(logisticsPage.position, 'x');
// gui.add(logisticsPage.position, 'y');
// gui.add(logisticsPage.position, 'z');
// gui.add(logisticsPage.rotation, 'y');
scene.add(logisticsPage);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enablePan = false;
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.2;
controls.maxDistance = 500;
controls.minDistance = 150;
controls.maxPolarAngle = Math.PI * 0.48;

// Raycasting
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let currentIntersect = {
    object: {
        name: "empty"
    }
};
let canvasBlocked = false;
let prevMousePos;
let prevPage = null;
let currentPage = null;
let popup = {};
const objectsToIntersect = [aluTubesPage, aboutOwnerPage, laminateTubesPage, aboutHRPage, featuresPage, rAndDPage, qualityPage, ecologyPage, polyethyleneTubesPage, logisticsPage];

function onMouseMove(event) {
    // console.log(event.clientX, event.clientY);
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    prevPage = null;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    popup.x = event.clientX;
    popup.y = window.innerHeight - event.clientY;
    // console.log(currentIntersects);
}

// setInterval(() => {
//     if(!mouseMoved && mouseStartedMoving) {
//         console.log(pageClickable);
//         pageClickable = true;
//         mouseStartedMoving = false;
//     }
//     mouseMoved = false;
// }, 1);

function onMouseClick(event) {
    // if (currentIntersect.object !== undefined) {
    //     ++intersectClick;
    //     if (intersectClick === 1) {
    //         prevIntersect = currentIntersect.object;
    //     } else if (intersectClick === 2) {
    //         if (prevIntersect === currentIntersect.object) {
    //             intersectClick = 0;
    //             if (currentPage !== null) {
    //                 document.body.classList.remove("navigation-hover");
    //                 mouse.x = -10000;
    //                 mouse.y = -10000;
    //                 currentIntersect = {
    //                     object: {
    //                         name: "empty"
    //                     }
    //                 };
    //                 document.querySelector(`#${currentPage}`).classList.toggle("activePage");
    //                 document.querySelector(`#${currentPage}`).addEventListener('mouseenter', () => {
    //                     mouse.x = -10000;
    //                     mouse.y = -10000;
    //                 });
    //                 for (let popup of document.querySelectorAll(".navigationPopup")) {
    //                     popup.classList.remove("activePopup");
    //                 }
    //             }
    //         } else {
    //             intersectClick = 0;
    //             prevIntersect = null;
    //         }
    //     }
    // } else {
    //     intersectClick = 0;
    //     prevIntersect = null;
    // }

    // console.log(currentPage, prevPage);
    // console.log(prevMousePos, camera.position.x);
    if (currentPage !== null && prevPage === currentPage) {
        let diff = prevMousePos - camera.position.x;
        if (diff < 0) {
            diff = -diff;
        }
        if (diff < 10) {
            canvasBlocked = true;
            document.body.classList.remove("navigation-hover");
            mouse.x = -10000;
            mouse.y = -10000;
            currentIntersect = {
                object: {
                    name: "empty"
                }
            };
            document.querySelector(`#${currentPage}`).classList.toggle("activePage");
            document.querySelector(`#${currentPage}`).addEventListener('mouseenter', () => {
                mouse.x = -10000;
                mouse.y = -10000;
            });
            for (let popup of document.querySelectorAll(".navigationPopup")) {
                popup.classList.remove("activePopup");
            }
            prevPage = null;
        }
    }

}

function onMouseDown() {
    prevPage = currentPage;
    prevMousePos = camera.position.x;
    // console.log(prevMousePos);
}

function onCanvasTouch(event) {  
    mouse.x = (event.changedTouches[0].clientX / window.screen.width) * 2 - 1;
    mouse.y = -(event.changedTouches[0].clientY / window.screen.height) * 2 + 1;
    // popup.x = event.changedTouches[0].clientX;
    // popup.y = window.screen.height - event.changedTouches[0].clientY;
    popup.x = 0;
    popup.y = 0;
    // console.log(mouse.x, mouse.y);
}

function onCanvasTouchMove(event) {   
    mouse.x = -1000;
    mouse.y = -1000;
    popup.x = 0;
    popup.y = 0;
}


function onCanvasTouchEnd(event) {   
    // console.log(event.changedTouches[0].clientX, event.changedTouches[0].clientY);    
    prevPage = null;
    mouse.x = (event.changedTouches[0].clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.changedTouches[0].clientY / window.innerHeight) * 2 + 1;
    popup.x = 0;
    popup.y = 0;
    // console.log(mouse.x, mouse.y);
}

window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('pointerdown', onMouseDown, false);
window.addEventListener('click', onMouseClick, false);
window.addEventListener("touchstart", onCanvasTouch, false);
canvas.addEventListener("touchmove", onCanvasTouchMove, false);
// canvas.addEventListener("touchend", onCanvasTouchEnd, false);


export function blockCanvas() {
    canvasBlocked = true;
}

export function openCanvas() {
    canvasBlocked = false;
}

export function changeCanvasLanguage(lang) {
    canvasLanguage = lang;
}

// Animation
const clock = new THREE.Clock();

let changingOpacity = false;
let mouseOverNavigation = false;

function changeOpacity(object, to, way) {
    if (changingOpacity === false) {
        changingOpacity = true;
        let changeOpacityTimer = setInterval(() => {
            if (mouseOverNavigation === false) {
                if (way === "down") {
                    if (object.material.opacity > to) {
                        object.material.opacity = object.material.opacity - 0.01;
                    }
                    if (object.material.opacity < to) {
                        clearInterval(changeOpacityTimer);
                        changingOpacity = false;
                    }
                }
            } else {
                if (way === "up") {
                    if (object.material.opacity < to) {
                        object.material.opacity = object.material.opacity + 0.01;
                    }
                    if (object.material.opacity > to) {
                        clearInterval(changeOpacityTimer);
                        changingOpacity = false;
                    }
                }
            }
        }, 0.5);
    }
}

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = clock.getDelta();
    // Update Orbital Controls
    controls.update();

    // Cast a ray from the mouse and handle events
    if (model !== undefined) {
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(objectsToIntersect);
        // console.log(intersects, mouse);


        if (canvasBlocked === false) {
            if (intersects.length !== 0) {
                if (currentIntersect.object.name !== intersects[0].object.name) {
                    currentIntersect = intersects[0];

                    document.body.classList.add("navigation-hover");
                    switch (currentIntersect.object.name) {
                        case 'aluTubesPage':
                            currentPage = `aluTubesPage-${canvasLanguage}`;
                            mouseOverNavigation = true;
                            changingOpacity = false;
                            // changeOpacity(aluTubesPage, 0.3, "up");
                            aluTubesPage.material.opacity = 0.2;
                            showNavigationPopup(`aluTubesPage-${canvasLanguage}`, popup.x, popup.y);
                            break;
                        case 'aboutOwnerPage':
                            currentPage = `aboutOwnerPage-${canvasLanguage}`;
                            mouseOverNavigation = true;
                            changingOpacity = false;
                            aboutOwnerPage.material.opacity = 0.2;
                            // changeOpacity(aboutOwnerPage, 0.3, "up");
                            showNavigationPopup(`aboutOwnerPage-${canvasLanguage}`, popup.x, popup.y);
                            break;
                        case 'laminateTubesPage':
                            currentPage = `laminateTubesPage-${canvasLanguage}`;
                            mouseOverNavigation = true;
                            changingOpacity = false;
                            laminateTubesPage.material.opacity = 0.2;
                            // changeOpacity(laminateTubesPage, 0.3, "up");
                            showNavigationPopup(`laminateTubesPage-${canvasLanguage}`, popup.x, popup.y);
                            break;
                        case 'aboutHRPage':
                            currentPage = `aboutHRPage-${canvasLanguage}`;
                            mouseOverNavigation = true;
                            changingOpacity = false;
                            aboutHRPage.material.opacity = 0.2;
                            // changeOpacity(aboutHRPage, 0.3, "up");
                            showNavigationPopup(`aboutHRPage-${canvasLanguage}`, popup.x, popup.y);
                            break;
                        case 'featuresPage':
                            currentPage = `featuresPage-${canvasLanguage}`;
                            mouseOverNavigation = true;
                            changingOpacity = false;
                            featuresPage.material.opacity = 0.2;
                            // changeOpacity(featuresPage, 0.3, "up");
                            showNavigationPopup(`featuresPage-${canvasLanguage}`, popup.x, popup.y);
                            break;
                        case 'rAndDPage':
                            currentPage = `rAndDPage-${canvasLanguage}`;
                            mouseOverNavigation = true;
                            changingOpacity = false;
                            rAndDPage.material.opacity = 0.2;
                            // changeOpacity(rAndDPage, 0.3, "up");
                            showNavigationPopup(`rAndDPage-${canvasLanguage}`, popup.x, popup.y);
                            break;
                        case 'qualityPage':
                            currentPage = `qualityPage-${canvasLanguage}`;
                            mouseOverNavigation = true;
                            changingOpacity = false;
                            qualityPage.material.opacity = 0.2;
                            // changeOpacity(qualityPage, 0.3, "up");
                            showNavigationPopup(`qualityPage-${canvasLanguage}`, popup.x, popup.y);
                            break;
                        case 'ecologyPage':
                            currentPage = `ecologyPage-${canvasLanguage}`;
                            mouseOverNavigation = true;
                            changingOpacity = false;
                            ecologyPage.material.opacity = 0.2;
                            // changeOpacity(ecologyPage, 0.3, "up");
                            showNavigationPopup(`ecologyPage-${canvasLanguage}`, popup.x, popup.y);
                            break;
                        case 'polyethyleneTubesPage':
                            currentPage = `polyethyleneTubesPage-${canvasLanguage}`;
                            mouseOverNavigation = true;
                            changingOpacity = false;
                            polyethyleneTubesPage.material.opacity = 0.2;
                            // changeOpacity(polyethyleneTubesPage, 0.3, "up");
                            showNavigationPopup(`polyethyleneTubesPage-${canvasLanguage}`, popup.x, popup.y);
                            break;
                        case 'logisticsPage':
                            currentPage = `logisticsPage-${canvasLanguage}`;
                            mouseOverNavigation = true;
                            changingOpacity = false;
                            logisticsPage.material.opacity = 0.2;
                            // changeOpacity(logisticsPage, 0.3, "up");
                            showNavigationPopup(`logisticsPage-${canvasLanguage}`, popup.x, popup.y);
                            break;
                    }
                } else if (currentIntersect.object.name === intersects[0].object.name) {
                    mouseOverNavigation = true;
                    for (let object of objectsToIntersect) {
                        if (object.name !== currentIntersect.object.name) {
                            object.material.opacity = 0;
                        }
                    }
                }
            } else {
                document.body.classList.remove("navigation-hover");
                mouseOverNavigation = false;
                for (let object of objectsToIntersect) {
                    if (object.material.opacity > 0) {
                        changingOpacity = false;
                        changeOpacity(object, 0, "down");
                    }
                }
                currentPage = null;
                currentIntersect = {
                    object: {
                        name: "empty"
                    }
                };
                for (let popup of document.querySelectorAll(".navigationPopup")) {
                    popup.classList.remove("activePopup");
                    popup.style.bottom = "-5000px";
                }
            }
        } else {
            document.body.classList.remove("navigation-hover");
            mouseOverNavigation = false;
            for (let object of objectsToIntersect) {
                if (object.material.opacity > 0) {
                    changingOpacity = false;
                    changeOpacity(object, 0, "down");
                }
            }
            currentPage = null;
            currentIntersect = {
                object: {
                    name: "empty"
                }
            };
            for (let popup of document.querySelectorAll(".navigationPopup")) {
                popup.classList.remove("activePopup");
                popup.style.bottom = "-5000px";
            }
        }







        // for (let object of model.children) {
        //     if (object.name === "Landscape_3") {
        //         // console.log(model.children[model.children.indexOf(object)]);
        //         model.children[model.children.indexOf(object)].material.wireframe = false;
        //     }
        // }
        // model.children[126].material.wireframe = false;
        // currentIntersects = null;
        // for (let intersect of intersects) {
        //     if (intersect.object.name === "Landscape_3") {
        //         currentIntersects = intersect;

        //         for (let object of model.children) {
        //             if (object.name === "Landscape_3") {
        //                 model.children[model.children.indexOf(object)].material.wireframe = true;
        //             }
        //         }
        //         // model.children[126].material.wireframe = true;
        //     }
        // }

        // for (let intersect of intersects) {
        //     if (intersect.object.name === "Cube_6") {
        //         if (currentIntersects[0] !== undefined) {
        //             if(intersect.distance > currentIntersects[0].distance) {
        //                 currentIntersects.push(intersect);
        //             } else {
        //                 currentIntersects.unshift(intersect);
        //             }
        //             console.log("cube_6");
        //         } else {
        //             currentIntersects.push(intersect);
        //         }
        //     } else {
        //         currentIntersects = [];
        //     }
        // }
    }

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();