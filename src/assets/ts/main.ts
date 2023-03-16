// ThreeJS library import
import { AmbientLight, LoadingManager, Color, PerspectiveCamera, Scene, WebGLRenderer, MOUSE, TOUCH } from 'three';

// ThreeJS addons 
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

// Other libraries imports

// JS
import gsap from 'gsap';
import tippy from 'tippy.js';
import introJs from 'intro.js';

// CSS
import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.js';
import 'tippy.js/dist/tippy.css';
import 'intro.js/minified/introjs.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Vanilla project imports
import {UI_Audio, Ions, Button, Version, SidebarInfo, PreLoader} from './classes'; 
import '../css/style.css';

// ThreeJS object instantiation
const manager = new LoadingManager();
const loader = new GLTFLoader(manager);
const scene = new Scene();
const light = new AmbientLight();
const camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// Setting initial cam pos & light 
camera.position.set(0, 0, 1.2700000000000002);
// camera.up.set(1,1,1);
light.intensity = 1.50;
scene.add(light);

Button.render('Começar');
Version.display();

// Loading 3D file and setting it's position
loader.load( './resi_complete.gltf', function ( gltf: any ) {
    scene.background = new Color( 0x71BCE1 );
    scene.add( gltf.scene );

    gltf.scene.position.x = -2.99999999999998;
    gltf.scene.position.y = 1.7600000000000016;
    gltf.scene.position.z = -1.740000000000001;

    gltf.scene.quaternion._w = 0.43279318769409064;
    gltf.scene.quaternion._x = 0.4780076701383027;
    gltf.scene.quaternion._y = -0.5130005247426389;
    gltf.scene.quaternion._z = -0.5665943748293979;

    //this keydown event is used to manipulate the cam at development 

    document.addEventListener('keydown', (event) => {
        var code = event.code;
    
        // switch (code) {
        //     // pos
        //     case 'ArrowUp':
        //         controls.target.y += 0.01;
        //     break;
        //     case 'ArrowDown':
        //         controls.target.y -= 0.01;
        //     break;
        //     case 'ArrowLeft':
        //         controls.target.x -= 0.01;
        //     break;
        //     case 'ArrowRight':
        //         controls.target.x += 0.01;
        //     break;
        //     case 'KeyS':
        //         controls.target.z -= 0.01;
        //     break;
        //     case 'KeyW':
        //         controls.target.z += 0.01;
        //     break;

        //     //rotation
        //     case 'KeyI':
        //         camera.position.y += 0.01;
        //     break;
        //     case 'KeyK':
        //         camera.position.y -= 0.01;
        //     break;
        //     case 'KeyJ':
        //         camera.position.x -= 0.01;
        //     break;
        //     case 'KeyL':
        //         camera.position.x += 0.01;
        //     break;
        //     case 'KeyQ':
        //         camera.position.z -= 0.01;
        //     break;
        //     case 'KeyE':
        //         camera.position.z += 0.01;
        //     break;
        // }
    
        // console.log(camera);
        // console.log(controls);
    }, false);

}, undefined, function ( error: any ) {
	console.error( error );
} );

var buildingList = [];
var allBuildings = [];

interface IBuilding {
    camPositionX: number,
    camPositionY: number,
    camPositionZ: number,
    camRotationX: number,
    camRotationY: number,
    camRotationZ: number,
    camDurationPosition: number,
    camDurationRotation: number,
    isBuilding: boolean,
    name: string,
    desc: string,
    x: number,
    y: number,
    z: number
}

async function getBuildingJson() {
    let req = await fetch('./buildings.json');
    let allBuildings: IBuilding[] = await req.json();

    for(let i = 0; i < allBuildings.length; i++) {
        const building = document.createElement("i");
        building.className = 'fa-regular fa-circle-dot';

        if (allBuildings[i].isBuilding) {
            building.setAttribute('block', allBuildings[i].name);
        } else {
            building.setAttribute('buildingName', allBuildings[i].name);
        }

        // Passing all labels as a 2D renderer object, setting it position and adding to the scene// Passing all labels as a 2D renderer object, setting it position and adding to the scene
        building.style.marginTop = "-1em";
        let buildingObj = new CSS2DObject(building);
        buildingObj.position.set(allBuildings[i].x,allBuildings[i].y, allBuildings[i].z);
        scene.add(buildingObj);

        if(allBuildings[i].isBuilding) {
            tippy(building, {
                content: `Bloco ${allBuildings[i].name}`,
                arrow: true,
                placement: 'right'
            });
        }else{
            tippy(building, {
                content: allBuildings[i].name,
                arrow: true,
                placement: 'right'
            });  
        }

        building.onpointerover = () => {
            UI_Audio.hover('./hover.mp3');
        }

        building.onpointerup = () => controls.enabled = true;

        // On label click, go to building position and showing it respective info
        building.onpointerdown = () => {
            // Ions.setState = false;
            controls.enabled = false;
            UI_Audio.click('./click.mp3');
            let blockTarget = building.getAttribute('block');
            let buildingTarget = building.getAttribute('buildingName');

            if (buildingTarget) {
                let buildingInfo = allBuildings.filter(obj => Object.values(obj).includes(buildingTarget));
                const sidebarInfo = new SidebarInfo(buildingInfo[0].name, buildingInfo[0].desc, buildingInfo[0].isBuilding);
                sidebarInfo.render();
            }else if(blockTarget) {
                let buildingInfo = allBuildings.filter(obj => Object.values(obj).includes(blockTarget))
                const sidebarInfo = new SidebarInfo(buildingInfo[0].name, buildingInfo[0].desc, buildingInfo[0].isBuilding);
                sidebarInfo.render();
            }
        }
    }
}

getBuildingJson();

// Loading bar
manager.onStart = function () {
    let progressArea = document.querySelector('.progress-area');
    progressArea!.innerHTML = PreLoader.setLoader(); 
};

// ignoring the unused url parameter

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

var setZAxisToFixedPos = new Promise((resolve) => {
    resolve({
        cameraPositionZ: -0.9673878322917252,
        controlsTargetZ: -1.0368304213606843,
        state: false
    })
});

let progressArea = document.querySelector('.progress-area');
progressArea!.innerHTML = PreLoader.setLoader(); 

manager.onLoad = function () {
    setTimeout(() => {
        document.querySelector<HTMLElement>('.progress-area')!.style.display = 'none';
        document.querySelector<HTMLElement>('.sidebar')!.style.display = 'block';
        gsap.to('canvas', {opacity: 1, duration: 2, ease: "power3.out"});
        gsap.to('.title-discover', {opacity: 1, y: 0, duration: 1, ease: "power3.out", onComplete(){gsap.to('.main-title h1', {opacity: 1, y: 0, duration: 1, ease: "power3.out", onComplete(){gsap.to('.begin-area a', {opacity: 1, duration: 1})}})}});
    }, 1000);

    document.querySelector('.begin-area a')!.addEventListener('click', function() {
        setTimeout(() => {
            let beginArea = document.querySelector<HTMLElement>('.begin-area');
            beginArea!.style.opacity = "0";
            beginArea!.style.zIndex = "0";
            gsap.to(camera.position, {x: -0.1669697190710316, y: -0.9000058336272296, z: -0.9673878322917252, duration: 1.5, ease: "Power4.easeOut"});
            gsap.to(controls.target, {x: -0.16697400768532566, y: -0.8200056156476522, z: -1.0368304213606843, duration: 1.5, ease: "Power4.easeOut"});
            gsap.to('canvas', {filter: "blur(0px)", onComplete(){ 
                setZAxisToFixedPos.then((res: any) => {
                    res.state = true;   
                });
                gsap.to('.ion-app', {opacity: 1});
            }});
        }, 250);

        document.querySelector('.blockInfo i')!.addEventListener('click', () => {
            gsap.to('.blockInfoSidebar', {width: '0px'});
        })
    })  
};

const renderer = new WebGLRenderer({antialias: true, alpha: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild( renderer.domElement );

// Creating 2D renderer
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0px";
labelRenderer.domElement.className = 'ion-app';
document.body.appendChild(labelRenderer.domElement);

// Orbit controls config 
const controls = new OrbitControls( camera, labelRenderer.domElement );
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.05;

controls.enableZoom = false;
controls.enableRotate = true;
controls.panSpeed = 5;

controls.mouseButtons = {
    LEFT: MOUSE.PAN
}

controls.touches.ONE = TOUCH.PAN;
 
function animate() {
    setZAxisToFixedPos.then((res: any) => {
        if(res.state) {
            camera.position.z = -0.9673878322917252;
            controls.target.z = -1.0368304213606843;   
        }
    })

    window.requestAnimationFrame(animate);
    renderer.render( scene, camera );
    labelRenderer.render(scene, camera);
    controls.update();
}

function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

animate();
window.addEventListener('resize', resize, false);