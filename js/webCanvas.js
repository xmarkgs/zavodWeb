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


// GUI
const gui = new GUI();

// Loading manager
const manager = new THREE.LoadingManager();
manager.onStart = function (url, itemsLoaded, itemsTotal) {
    console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    document.getElementsByClassName('preloader')[0].classList.toggle("loading");
};

manager.onLoad = function () {
    console.log('Loading complete!');
    document.getElementsByClassName('preloader')[0].classList.toggle("loading");
};

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
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
    'threejs_assets/models/zavod_full_01.gltf',
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
                console.log(child);
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


        // let newChildren = [];
        // for (let modelPart of model.children) {
        //     if (modelPart.name.includes("Null")) {
        //         newChildren.push(modelPart);
        //     }
        // }
        // model.children = newChildren;
        // console.log(model.children);
        // for (let object of model.children) {
        //     if (object.name === "Null_1") {
        //         console.log(object);
        //         for (let childNull of object.children) {
        //             model.children[model.children.indexOf(object)].children[object.children.indexOf(childNull)].material.wireframe = true;
        //         }
        //     }
        // }
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


// aboutOwnerBox
let aboutOwnerGeometry = new THREE.BoxGeometry(176, 50, 71);
let aboutOwnerMaterial = new THREE.MeshPhongMaterial({
    color: "#FFFFFF",
    opacity: 0,
    transparent: true,
});
let aboutOwnerBox = new THREE.Mesh(aboutOwnerGeometry, aboutOwnerMaterial);
aboutOwnerBox.name = "aboutOwnerBox";
aboutOwnerBox.position.x = 0;
aboutOwnerBox.position.y = 20;
aboutOwnerBox.position.z = 0;
aboutOwnerBox.rotation.y = -0.03;
gui.add(aboutOwnerBox.position, 'x');
gui.add(aboutOwnerBox.position, 'y');
gui.add(aboutOwnerBox.position, 'z');
gui.add(aboutOwnerBox.rotation, 'y');
scene.add(aboutOwnerBox);

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
let currentPage = null;
const objectsToIntersect = [aluTubesPage];

function onMouseMove(event) {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    // console.log(currentIntersects);
}

function onMouseClick(event) {
    if (currentPage !== null) {
        document.body.classList.remove("navigation-hover");
        mouse.x = -10000;
        mouse.y = -10000;
        currentIntersect = {
            object: {
                name: "empty"
            }
        };
        document.querySelector(`#${currentPage}`).classList.toggle("activePage");
        for (let popup of document.querySelectorAll(".navigationPopup")) {
            popup.classList.remove("activePopup");
        }
    }

    console.log(currentIntersect);
    console.log(model.children);
}

window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('click', onMouseClick, false);

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
        // console.log(intersects);

        if (intersects.length !== 0) {
            if (currentIntersect.object.name !== intersects[0].object.name) {
                console.log("new");
                currentIntersect = intersects[0];

                document.body.classList.add("navigation-hover");

                switch (currentIntersect.object.name) {
                    case 'aluTubesPage':
                        currentPage = "aluTubesPage";
                        console.log("alu");
                        mouseOverNavigation = true;
                        changingOpacity = false;
                        changeOpacity(aluTubesPage, 0.3, "up");
                        showNavigationPopup("aluTubesPage");
                        break;
                    case 'aboutOwnerBox':
                        console.log("owner");
                        mouseOverNavigation = true;
                        changingOpacity = false;
                        changeOpacity(aboutOwnerBox, 0.3, "up");
                        break;
                }

            } else if (currentIntersect.object.name === intersects[0].object.name) {
                mouseOverNavigation = true;
                console.log("still");
                for (let object of objectsToIntersect) {
                    if (object.name !== currentIntersect.object.name) {
                        object.material.opacity = 0;
                    }
                }
            }
        } else {
            console.log("clearing");
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