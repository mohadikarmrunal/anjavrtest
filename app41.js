import * as THREE from '../../libs/three/three.module.js';
import { OrbitControls } from '../../libs/three/jsm/OrbitControls.js';
import { GLTFLoader } from '../../libs/three/jsm/GLTFLoader.js';
import { DRACOLoader } from '../../libs/three/jsm/DRACOLoader.js';
import { Stats } from '../../libs/stats.module.js';
import { CanvasUI } from '../../libs/CanvasUI.js'
import { ARButton2 } from '../../libs/ARButton2.js';
import { LoadingBar } from '../../libs/LoadingBar.js';
import { ControllerGestures } from '../../libs/ControllerGestures.js';
import { FontLoader } from '../../libs/FontLoader.js';
import { TextGeometry } from '../../libs/TextGeometry.js';



class App4{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
        this.clock = new THREE.Clock();
        
		this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 20 );
		
		this.scene = new THREE.Scene();
        this.scene.add(this.camera);
       
		this.scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );

        const light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 1, 1, 1 ).normalize();
		this.scene.add( light );
        
        window.createImageBitmap = undefined
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
		container.appendChild( this.renderer.domElement );
        
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.target.set(0, 3.5, 0);
        this.controls.update();

        this.listener = new THREE.AudioListener();

        const sound = new THREE.Audio( this.listener );
        const audioLoader = new THREE.AudioLoader();
         audioLoader.load( 'audio/app4-1.mp3', ( buffer ) => {
          sound.setBuffer( buffer );
          sound.setLoop( false );
          sound.setVolume( 1.0 );
         });
       this.sound = sound;
       this.speech = new THREE.Audio( this.listener );

        this.stats = new Stats();
        this.initScene();
        this.setupVR();
        window.addEventListener('resize', this.resize.bind(this) );
	}	

    
    initScene(){
        this.loadingBar = new LoadingBar();
        this.assetsPath = '../../assets/';
        const loader = new GLTFLoader().setPath(this.assetsPath);
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( '../../libs/three/js/draco/' );
        loader.setDRACOLoader( dracoLoader );
		const self = this;
        
        loader.load(
			// resource URL
			'radnica.glb',
			// called when the resource is loaded
			function ( gltf ) {

                self.animations = {};
                
                gltf.animations.forEach( (anim)=>{
                    self.animations[anim.name] = anim;
                })
                self.worker = gltf.scene.children[0];
                const scale = 0.015;
				self.worker.scale.set(scale, scale, scale); 
                self.worker.rotateZ(Math.PI/4);
                self.worker.position.set(0.3,-2.05,-3);

                //animations
                self.mixer = new THREE.AnimationMixer( self.worker );
                const clipI = self.animations['Idle'];
                const clipA = self.animations['Answer'];
                const actionI = self.mixer.clipAction (clipI);
                const actionA = self.mixer.clipAction (clipA);
                actionI.enable = true;
                actionA.enable = true;
                self.actionI = actionI;
                self.actionA = actionA;
                self.actionA.loop = THREE.LoopOnce;

                self.actionI.play();              
                if (self.tel!= undefined && self.sound!=undefined) self.loadingBar.visible = false;
  
			},
			// called while loading is progressing
			function ( xhr ) {

				self.loadingBar.progress = (xhr.loaded / xhr.total);
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'An error happened while loading 3D object!' );
                alert ('Objects did not load properly. Please refresh the page!');

			}
        );

        loader.load(
			// resource URL
			'telephone1.glb',
			// called when the resource is loaded
			function ( gltf ) {

                self.animationsT = {};
                self.tel = gltf.scene;
                const scale = 2;
                self.tel.scale.set(scale, scale, scale);
                self.tel.position.set(-0.7,-2,-2.6);
                self.tel.rotateX(-Math.PI/8);

                if (gltf.scene.children[1].name == 'phone') {
                    self.phone = gltf.scene.children[1];
                }
                else {
                    self.phone = gltf.scene.children[0];
                }
                self.animationsT['Ring'] = gltf.animations[0];
                self.mixerT = new THREE.AnimationMixer( self.phone );
                const clipT = self.animationsT['Ring'];
                const actionT = self.mixerT.clipAction (clipT);
                actionT.enabled = true;
                self.actionT = actionT;
                self.actionT.loop = THREE.LoopOnce;
                
                if (self.worker!= undefined && self.sound!=undefined) self.loadingBar.visible = false;

			},
			// called while loading is progressing
			function ( xhr ) {

				self.loadingBar.progress = (xhr.loaded / xhr.total);
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'An error happened with loading 3D Objects!' );
                alert ('Objects did not load properly. Please refresh the page!');

			}
        );

        this.createUI();
        
    }

    playSound( sndname ){
        // load a sound and set it as the Audio object's buffer
        const sound = this.speech;
        const self = this;
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load( `audio/${sndname}.mp3`, ( buffer ) => {
            if (sndname != 'ring') {if (sound.isPlaying) sound.stop();}
            sound.setBuffer( buffer );
            sound.setLoop( false );
            sound.setVolume( 1.0 );
            sound.play();
        });
        if (sndname == 'sound1')  self.sound1 = sound;
        if (sndname == 'sound2')  self.sound2 = sound;
        if (sndname == 'ring')  self.ring = sound;
        self.ring.setVolume(0.3);


    }

    createUI() {
        const self = this;

        //canvas for the timer
        const config1 = {
            panelSize: { width: 0.3, height: 0.1 },
            height: 512/3,
            info:{ type: "text", position:{ top: 50, left: 6 }, width: 500 , height: 60, textAlign: 'center', fontFamily: 'Verdana', fontSize: 70}
        }

        const content1 = {
            info: "00:00:00"
        }

        //counter canvas 
        const config2 = {
            panelSize: { width: 0.3, height: 0.1 },
            height: 512/3,
            info:{ type: "text", position:{ top: 50, left: 6 }, width: 500 , height: 60, textAlign: 'center', fontFamily: 'Verdana', fontSize: 70}
        }

        const content2 = {
            info: "COUNTER: 0"
        }

        //experiment canvas
        const config3 = {
            panelSize: {width: 0.1, height: 0.6},
            width: 85.333,
            info:{ type: "text", position:{ top: 12, left: 7.665 } , width: 70 , height: 115, textAlign: 'center', fontFamily: 'Verdana', fontSize: 30, padding:7},
            info1:{ type: "text", position:{ top: 127, left: 7.665} , width: 70, height: 80, textAlign: 'center', backgroundColor: "#0DD", fontFamily: 'Verdana', fontSize: 50, padding: 30},
            info2:{ type: "text", position:{ top: 222, left: 7.665} , width: 70, height: 80, textAlign: 'center', backgroundColor: "#0DD", fontFamily: 'Verdana', fontSize: 50, padding: 30},
            info3:{ type: "text", position:{ top: 317, left: 7.665 } , width: 70, height: 80, textAlign: 'center', backgroundColor: "#0DD", fontFamily: 'Verdana', fontSize: 50, padding: 30},
            info4:{ type: "text", position:{ top: 412, left: 7.665 } , width: 70, height: 80, textAlign: 'center', backgroundColor: "#0DD", fontFamily: 'Verdana', fontSize: 50, padding: 30},

        }

        const content3 = {
            info: "RESULT",
            info1: "",
            info2: "",
            info3: "",
            info4: "",

        }   

  

        //creating materials for canvases
        const material1 = new THREE.MeshPhysicalMaterial ();
        material1.color = new THREE.Color(0x2d7ac8);
        material1.opacity = 0.45;
        material1.roughness = 0.377;
        material1.metalness = 0.389;
        material1.reflectivity = 0.7;
        material1.clearcoat = 0.7;
        const material = material1.clone();
        material1.transparent = true;
        const material2 = material1.clone();
        const material3 = material1.clone();
        
        //material for the board
        const material4 = new THREE.MeshPhysicalMaterial ();
        material4.color = new THREE.Color(0xf3f5f7);
        material4.transparent = true;
        material4.roughness = 0;
        material4.metalness = 0.4;
        material4.reflectivity = 1;
        material4.clearcoat = 0.7;
        material4.clearcoatRoughness = 1;

        //material for the cylinders | material for the theoretical frequencies
        const material5 = new THREE.MeshPhysicalMaterial ();
        material5.color = new THREE.Color(0x008a49);
        material5.roughness = 0.08;
        material5.metalness = 0.8;
        material5.reflectivity = 0.5;
        material5.clearcoatRoughness = 1;
        material5.flatShading = true;

        //material for experiment
        material3.color = new THREE.Color(0x7ebea2);
        material3.roughness = 0;
        material3.metalness = 0.555;
        material3.reflectivity = 0.377;
        material3.clearcoat = 0.15;
        material3.clearcoatRoughness = 0.17;
        material3.transparent = false;

        const ui1 = new CanvasUI(content1, config1);
        this.ui1 = ui1;
        this.ui1.mesh.position.set(-0.2,0.4,-1);
        this.ui1.mesh.material = material1;
        this.ui1.mesh.material.map = this.ui1.texture;        
        self.seconds = 30;

        const ui2 = new CanvasUI(content2, config2);
        this.ui2 = ui2;
        this.ui2.mesh.position.set(-0.2,0,-1);
        this.ui2.mesh.material = material2;
        this.ui2.mesh.material.map = this.ui2.texture;  

        const ui3 = new CanvasUI(content3, config3);
        this.ui3 = ui3;
        this.ui3.mesh.position.set(0.17,0,-0.65);
        this.ui3.mesh.material = material3;
        this.ui3.mesh.material.map = this.ui3.texture;  

        //creating 3D cylinders for the frequency diagram |   theoretical frequency 
        const geometry1 = new THREE.CylinderGeometry( 0.03, 0.03, 0.16, 32 );
        const geometry2 = new THREE.CylinderGeometry( 0.03, 0.03, 0.34, 32 );
        const geometry3 = new THREE.CylinderGeometry( 0.03, 0.03, 0.44, 32 );
        const geometry4 = new THREE.CylinderGeometry( 0.03, 0.03, 0.38, 32 );
        const geometry5 = new THREE.CylinderGeometry( 0.03, 0.03, 0.3, 32 );
        const geometry6 = new THREE.CylinderGeometry( 0.03, 0.03, 0.24, 32 );
        const geometry7 = new THREE.CylinderGeometry( 0.03, 0.03, 0.14, 32 );

        const geometry11 = new THREE.CylinderGeometry( 0.03, 0.03, 0.19, 32 );
        const geometry12 = new THREE.CylinderGeometry( 0.03, 0.03, 0.304, 32 );
        const geometry13 = new THREE.CylinderGeometry( 0.03, 0.03, 0.364, 32 );
        const geometry14 = new THREE.CylinderGeometry( 0.03, 0.03, 0.35, 32 );
        const geometry15 = new THREE.CylinderGeometry( 0.03, 0.03, 0.278, 32 );
        const geometry16 = new THREE.CylinderGeometry( 0.03, 0.03, 0.192, 32 );
        const geometry17 = new THREE.CylinderGeometry( 0.03, 0.03, 0.114, 32 );

        const geometry8 = new THREE.BoxGeometry (0.8,0.02,0.5);

        const cylinder1 = new THREE.Mesh(geometry1,material);
        const cylinder2 = new THREE.Mesh(geometry2,material);
        const cylinder3 = new THREE.Mesh(geometry3,material);
        const cylinder4 = new THREE.Mesh(geometry4,material);
        const cylinder5 = new THREE.Mesh(geometry5,material);
        const cylinder6 = new THREE.Mesh(geometry6,material);
        const cylinder7 = new THREE.Mesh(geometry7,material);

        const cylinder11 = new THREE.Mesh(geometry11,material5);
        const cylinder12 = new THREE.Mesh(geometry12,material5);
        const cylinder13 = new THREE.Mesh(geometry13,material5);
        const cylinder14 = new THREE.Mesh(geometry14,material5);
        const cylinder15 = new THREE.Mesh(geometry15,material5);
        const cylinder16 = new THREE.Mesh(geometry16,material5);
        const cylinder17 = new THREE.Mesh(geometry17,material5);

        const cube = new THREE.Mesh (geometry8, material4);

        this.cyl1 = cylinder1;
        this.cyl2 = cylinder2;
        this.cyl3 = cylinder3;
        this.cyl4 = cylinder4;
        this.cyl5 = cylinder5;
        this.cyl6 = cylinder6;
        this.cyl7 = cylinder7;

        this.cyl11 = cylinder11;
        this.cyl12 = cylinder12;
        this.cyl13 = cylinder13;
        this.cyl14 = cylinder14;
        this.cyl15 = cylinder15;
        this.cyl16 = cylinder16;
        this.cyl17 = cylinder17;

        this.cube = cube;

        this.cyl1.position.set(-0.3,-0.14,-1.1); 
        this.cyl2.position.set(-0.2,-0.05,-1.1); 
        this.cyl3.position.set(-0.1,0,-1.1); 
        this.cyl4.position.set(0,-0.03,-1.1); 
        this.cyl5.position.set(0.1,-0.07,-1.1); 
        this.cyl6.position.set(0.2,-0.1,-1.1); 
        this.cyl7.position.set(0.3,-0.15,-1.1); 


        this.cyl11.position.set(-0.3,-0.176,-1.1); 
        this.cyl12.position.set(-0.2,-0.068,-1.1); 
        this.cyl13.position.set(-0.1,-0.038,-1.1); 
        this.cyl14.position.set(0,-0.045,-1.1); 
        this.cyl15.position.set(0.1,-0.081,-1.1); 
        this.cyl16.position.set(0.2,-0.124,-1.1); 
        this.cyl17.position.set(0.3,-0.163,-1.1); 

        this.cyl11.visible = false;
        this.cyl12.visible = false;
        this.cyl13.visible = false;
        this.cyl14.visible = false;
        this.cyl15.visible = false;
        this.cyl16.visible = false;
        this.cyl17.visible = false;


        this.cube.position.set(0,-0.23,-1.1);

        function back1(){
            self.ui6.mesh.visible = false;
            self.swipeoption = true;
            self.ui8.mesh.visible = false;
        }

        function back2(){
            self.ui7.mesh.visible = false;
            self.swipeoption = true;
            self.ui9.mesh.visible = false;
        }

        //canvas with theory1
        const config6 = {
            panelSize: { width: 0.5, height: 0.5 },
            body:{
                textAlign: 'center',
                backgroundColor:'#ccc',
                fontColor:'#000',
                padding:50,
                fontSize:45,
            },
            image: { type: "img", position: { left: 0, top: 0 }},
        }

        const content6 = {
            image: "../../assets/theory12.png",
        }
        
        //canvas with theory2
        const config7 = {
            panelSize: { width: 0.5, height: 0.5 },
            body:{
                textAlign: 'center',
                backgroundColor:'#ccc',
                fontColor:'#000',
                padding:50,
                fontSize:45,
            },
            image: { type: "img", position: { left: 0, top: 0 }},
        }

        const content7 = {
            image: "../../assets/theory22.png",

        }

        //goback button1
        const config8 = {
            panelSize: { width: 0.035, height: 0.035 },
            back1: { type: "button", position:{ top: 0, left: 0 }, padding:15, fontColor: "#fff", backgroundColor: '#021', fontSize:20, hover: "#4c5ba6", onSelect: back1 },
            renderer: this.renderer
        }

        const content8 = {
            back1: "<path>M 76.8 245.76 L 414.72 76.8 L 414.72 414.72 Z</path>",
        }

        //goback button2
        const config9 = {
            panelSize: { width: 0.035, height: 0.035 },
            back2: { type: "button", position:{ top: 0, left: 0 }, padding:15, fontColor: "#fff", backgroundColor: '#021', fontSize:20, hover: "#4c5ba6", onSelect: back2 },
            renderer: this.renderer
        }

        const content9 = {
            back2: "<path>M 76.8 245.76 L 414.72 76.8 L 414.72 414.72 Z</path>",
        }

        

        const ui6 = new CanvasUI(content6, config6);
        this.ui6 = ui6;
        this.ui6.mesh.position.set(0,0,-0.6);
        self.ui6.mesh.visible = false;


        const ui7 = new CanvasUI(content7, config7);
        this.ui7 = ui7;
        this.ui7.mesh.position.set(0,0,-0.6);
        self.ui7.mesh.visible = false;

        const ui8 = new CanvasUI(content8, config8);
        this.ui8 = ui8;
        this.ui8.mesh.position.set(-0.15,0.145,-0.5);
        self.ui8.mesh.visible = false;

        const ui9 = new CanvasUI(content9, config9);
        this.ui9 = ui9;
        this.ui9.mesh.position.set(0.155,0.145,-0.5);
        self.ui9.mesh.visible = false;


        function button1(){
            self.swipeoption = false;
            self.ui6.mesh.visible = true;
            self.ui8.mesh.visible = true;
        }

        function button2(){
            self.ui7.mesh.visible = true;
            self.swipeoption = false;
            self.ui9.mesh.visible = true;
        }

        //info button1
         const config4 = {
            panelSize: { width: 0.05, height: 0.05 },
            height: 512,
            backgroundColor: '#eff',
            body: {backgroundColor: '#eff', position: {top:0, left:0 }},
            buttonb1: { type: "button", position:{ top: 0, left: 0 }, fontColor: "#fff", padding:100, backgroundColor: '#021', fontSize:100, hover: "#4c5ba6", onSelect: button1 },
            renderer: this.renderer        }

        const content4 = {
            buttonb1: "<path> M 260.4 117.3 L 260.4 117.3 M 260.4 117.3 L 259.5 117 L 139.5 115.5 C 139.5 115.5 139.5 115.5 139.5 115.5 L 115.5 114 C 124.5 117 139.5 120 139.5 132 L 139.5 132 L 138 369.3 L 260.4 369.3 L 291 370.5 C 276 364.5 264 361.5 264 340.5 Z Z M 168 37 A 1.5 1.5 90 0 0 205.5 79.5 A 1 1 0 0 0 169 36 </path>",
        }
       

        //info button2
         const config5 = {
            panelSize: { width: 0.06, height: 0.06 },
            height: 512,
            backgroundColor: '#eff',
            body: {backgroundColor: '#eff', position: {top:0, left:0 }},
            buttonb2: { type: "button", position:{ top: 0, left: 0 }, padding:100, fontColor: "#fff", backgroundColor: '#021', fontSize:100, hover: "#4c5ba6", onSelect: button2 },
            renderer: this.renderer
        }

        const content5 = {
            buttonb2: "<path> M 260.4 117.3 L 260.4 117.3 M 260.4 117.3 L 259.5 117 L 139.5 115.5 C 139.5 115.5 139.5 115.5 139.5 115.5 L 115.5 114 C 124.5 117 139.5 120 139.5 132 L 139.5 132 L 138 369.3 L 260.4 369.3 L 291 370.5 C 276 364.5 264 361.5 264 340.5 Z Z M 168 37 A 1.5 1.5 90 0 0 205.5 79.5 A 1 1 0 0 0 169 36 </path>",
        }

        const ui4 = new CanvasUI(content4, config4);
        this.ui4 = ui4;
        this.ui4.mesh.position.set(0.27,0.22,-0.95);     
        this.ui4.context.fillStyle = "#effeff";  
        this.ui4.context.fillStyle = 'green';  
        this.ui4.needsUpdate = true;
        this.ui4.texture.needsUpdate = true;
  

        const ui5 = new CanvasUI(content5, config5);
        this.ui5 = ui5;
        this.ui5.mesh.position.set(0.37,0.22,-0.95);
        this.ui5.mesh.visible = false;
        this.ui5.context.fillStyle = "#effeff";  
        this.ui5.context.fillStyle = 'green';  
        this.ui5.needsUpdate = true;
        this.ui5.texture.needsUpdate = true;

        //text for the title of the histographs
        const loaderf = new FontLoader();

        loaderf.load( 'assets/helvetiker_regular.typeface.json', function ( font ) {

	         const geometryT2 = new TextGeometry( 'X=2', {
		         font: font,
		         size: 5,
		         height: 2.5,
		         bevelEnabled: true,
                 bevelThickness: 2,
                 bevelSize: 0.5,
		         bevelSegments: 1
	        } );

            const geometryT3 = new TextGeometry( 'X=3', {
                font: font,
                size: 5,
                height: 2.5,
                bevelEnabled: true,
                bevelThickness: 2,
                bevelSize: 0.5,
                bevelSegments: 1
           } );

           const geometryT4 = new TextGeometry( 'X=4', {
                font: font,
                size: 5,
                height: 2.5,
                bevelEnabled: true,
                bevelThickness: 2,
                bevelSize: 0.5,
                bevelSegments: 1
            } );

            const geometryT5 = new TextGeometry( 'X=5', {
                font: font,
                size: 5,
                height: 2.5,
                bevelEnabled: true,
                bevelThickness: 2,
                bevelSize: 0.5,
                bevelSegments: 1
        } );

            const geometryT6 = new TextGeometry( 'X=6', {
                font: font,
                size: 5,
                height: 2.5,
                bevelEnabled: true,
                bevelThickness: 2,
                bevelSize: 0.5,
                bevelSegments: 1
            } );

            const geometryT7 = new TextGeometry( 'X=7', {
                font: font,
                size: 5,
                height: 2.5,
                bevelEnabled: true,
                bevelThickness: 2,
                bevelSize: 0.5,
                bevelSegments: 1
            } );


            const geometryT8 = new TextGeometry( 'X=8', {
                font: font,
                size: 5,
                height: 2.5,
                bevelEnabled: true,
                bevelThickness: 2,
                bevelSize: 0.5,
                bevelSegments: 1
            } );

            const geometryF1 = new TextGeometry( 'Frequency Distribution', {
                font: font,
                size: 5,
                height: 2.5,
                bevelEnabled: true,
                bevelThickness: 2,
                bevelSize: 0.5,
                bevelSegments: 1
           } );

           const geometryF2 = new TextGeometry( 'Poisson Frequency Distribution', {
            font: font,
            size: 5,
            height: 2.5,
            bevelEnabled: true,
            bevelThickness: 2,
            bevelSize: 0.5,
            bevelSegments: 1
       } );

            //labels for the values of the discrete variable X=x
            const text2 = new THREE.Mesh (geometryT2, material5);
            const text3 = new THREE.Mesh (geometryT3, material5);
            const text4 = new THREE.Mesh (geometryT4, material5);
            const text5 = new THREE.Mesh (geometryT5, material5);
            const text6 = new THREE.Mesh (geometryT6, material5);
            const text7 = new THREE.Mesh (geometryT7, material5);
            const text8 = new THREE.Mesh (geometryT8, material5);

            //labels for frequency distributions
            const text9 = new THREE.Mesh (geometryF1, material);
            const text10 = new THREE.Mesh (geometryF2, material5);



            self.text2 = text2;
            self.text3 = text3;
            self.text4 = text4;
            self.text5 = text5;
            self.text6 = text6;
            self.text7 = text7;
            self.text8 = text8;
            self.text9 = text9;
            self.text10 = text10;

            self.text2.scale.set(0.006,0.006,0.006);
            self.text3.scale.set(0.006,0.006,0.006);
            self.text4.scale.set(0.006,0.006,0.006);
            self.text5.scale.set(0.006,0.006,0.006);
            self.text6.scale.set(0.006,0.006,0.006);
            self.text7.scale.set(0.006,0.006,0.006);
            self.text8.scale.set(0.006,0.006,0.006);
            self.text9.scale.set(0.006,0.006,0.006);
            self.text10.scale.set(0.006,0.006,0.006);


            self.text2.position.set(-0.35,-0.22,-0.95);     
            self.text3.position.set(-0.25,-0.22,-0.95);
            self.text4.position.set(-0.15,-0.22,-0.95);
            self.text5.position.set(-0.05,-0.22,-0.95);
            self.text6.position.set(0.05,-0.22,-0.95);
            self.text7.position.set(0.15,-0.22,-0.95);
            self.text8.position.set(0.25,-0.22,-0.95);
            self.text9.position.set(-0.2,0.2,-0.95);
            self.text10.position.set(-0.25,0.2,-0.95);

            self.text10.visible = false;

        } );

    }

    setupVR(){

        this.renderer.xr.enabled = true;   
        const self = this;
        //used to enable the swipe option
        self.swipeoption = false;
        //case = tells us which experiment is ongoing
        self.case = 0;
        //counts the phone calls
        self.counter = 0;
        //keeps track of what is displayed
        self.display = 1;

        function count(number){

            if (self.seconds % number == 0 && self.seconds>0) {
                self.counter = self.counter + 1;   
                self.actionT.reset();
                self.actionA.reset();
                self.actionT.play();
                self.actionA.play();
                self.playSound('ring');
                self.ui2.updateElement('info', "COUNTER: "+self.counter.toString());
            }

            if ( self.seconds < 5 && self.second!= -1){
                self.ui1.mesh.material.color = new THREE.Color(0xf22602);
            }

            if (self.seconds == -1) {
                self.seconds = 30;

                self.ui1.mesh.material.color = new THREE.Color(0x2d7ac8);
                self.ui1.updateElement('info', "00:00:00");
                self.ui2.updateElement('info', "COUNTER: 0");

                if (self.case == 1) {
                    clearInterval(self.interval1);
                    self.ui3.updateElement('info1', self.counter.toString());
                    self.counter = 0;
                }

                if (self.case == 2) {
                    clearInterval(self.interval2);
                    self.ui3.updateElement('info2', self.counter.toString());
                    self.counter = 0;
                }

                if (self.case == 3) {
                    clearInterval(self.interval3);
                    self.ui3.updateElement('info3', self.counter.toString());
                    self.counter = 0;
                }

                if (self.case == 4) {
                    clearInterval(self.interval4);
                    self.ui3.updateElement('info4', self.counter.toString());
                    self.counter = 0;
                }

            }

            else {
                self.ui1.updateElement('info', "00:00:"+self.seconds.toString());
                self.seconds = self.seconds -1;
            }
        }

        function next1() {
            //first experiment
            //num1, num2, num3 are numbers of phonecalls in each of the experiments
            //number1, number2, number3 are used to determine in which second will the phone ring
            const num1 = (Math.floor((Math.random() * 5)+3));
            const number1 = Math.floor(30/num1);
            self.case = 1;
            console.log("first experiment with "+num1.toString()+" phonecalls");
            self.interval1 = setInterval(count,1000,number1);
        }

        function next2() {
            self.playSound('sound1');
            //second experiment
            const num2 = (Math.floor((Math.random() * 5)+3));
            const number2 = Math.floor(30/num2);            
            self.case = 2;
            console.log("second experiment with "+num2.toString()+" phonecalls");
            self.interval2 = setInterval(count,1000,number2);
        }

        function next3() {
            //third experiment
            const num3 = (Math.floor((Math.random() * 5)+3));
            const number3 = Math.floor(30/num3);
            self.case = 3;
            console.log("third experiment with "+num3.toString()+" phonecalls");
            self.interval3 = setInterval(count,1000,number3);
        }

        function next4() {
            //forth experiment
            const num4 = (Math.floor((Math.random() * 5)+3));
            const number4 = Math.floor(30/num4);
            self.case = 4;
            console.log("forth experiment with "+num4.toString()+" phonecalls");
            self.interval4 = setInterval(count,1000,number4);
        }

        function next5(){

            self.playSound('sound2');
            self.swipeoption = true;
            self.scene.remove(self.ui1.mesh);
            self.camera.remove(self.ui1.mesh);

            self.scene.remove(self.ui2.mesh);
            self.camera.remove(self.ui2.mesh);

            self.scene.remove(self.ui3.mesh);
            self.camera.remove(self.ui3.mesh);

            self.actionA.reset();
            self.actionT.reset();
           
            self.scene.remove(self.worker);
            self.scene.remove(self.tel);

            //add the histograms to the scene
            self.scene.add(self.cyl1);
            self.scene.add(self.cyl2);
            self.scene.add(self.cyl3);
            self.scene.add(self.cyl4);
            self.scene.add(self.cyl5);
            self.scene.add(self.cyl6);
            self.scene.add(self.cyl7);
            self.scene.add(self.cube);
            //add the second histogram to the scene, but they are not visible
            self.scene.add(self.cyl11);
            self.scene.add(self.cyl12);
            self.scene.add(self.cyl13);
            self.scene.add(self.cyl14);
            self.scene.add(self.cyl15);
            self.scene.add(self.cyl16);
            self.scene.add(self.cyl17);

            //adding text
            self.scene.add(self.text2);
            self.scene.add(self.text3);
            self.scene.add(self.text4);
            self.scene.add(self.text5);
            self.scene.add(self.text6);
            self.scene.add(self.text7);
            self.scene.add(self.text8);
        
            //adding button-canvases and text
            self.ui4.context.fillStyle = "#effeff";   
            self.ui4.needsUpdate = true;
            self.ui4.texture.needsUpdate = true;
            self.scene.add(self.ui4.mesh);
            self.scene.add(self.ui5.mesh);
            self.scene.add(self.text9);
            self.scene.add(self.text10);


            //adding canvases with theory
            self.scene.add(self.ui6.mesh);
            self.camera.add(self.ui6.mesh);
            self.scene.add(self.ui7.mesh);
            self.camera.add(self.ui7.mesh);

            self.scene.add(self.ui8.mesh);
            self.camera.add(self.ui8.mesh);
            self.scene.add(self.ui9.mesh);
            self.camera.add(self.ui9.mesh);

        }

        
        function onSessionStart(){

            const el = document.getElementById("text");
            self.el = el;
            if (self.el!=undefined) self.el.style.visibility = 'hidden';

            const el1 = document.getElementsByClassName("buttonapp1");
            const el2 = document.getElementsByClassName("buttonapp2");
            const el3 = document.getElementsByClassName("buttonapp3");
            const el5 = document.getElementsByClassName("buttonapp5");
            self.elem1 = el1[0];
            self.elem1.disabled = true;
            self.elem2 = el2[0];
            self.elem2.disabled = true;
            self.elem3 = el3[0];
            self.elem3.disabled = true;
            self.elem5 = el5[0];
            self.elem5.disabled = true;

            self.elem1.style.visibility = 'hidden';
            self.elem2.style.visibility = 'hidden';
            self.elem3.style.visibility = 'hidden';
            self.elem5.style.visibility = 'hidden';

            self.sound.play();

            self.scene.add(self.worker);
            self.scene.add(self.tel);

            self.ui1.mesh.visible = true;
            self.scene.add(self.ui1.mesh);
            self.camera.add(self.ui1.mesh);

            self.ui2.mesh.visible = true;
            self.scene.add(self.ui2.mesh);
            self.camera.add(self.ui2.mesh);

            self.ui3.mesh.visible = true;
            self.scene.add(self.ui3.mesh);
            self.camera.add(self.ui3.mesh);

           
            var timeout1, timeout2, timeout3, timeout4, timeout5;
            timeout1 = setTimeout(next1, 43000);
            timeout2 = setTimeout(next2, 78000);
            timeout3 = setTimeout(next3, 113000);
            timeout4 = setTimeout(next4, 148000);
            timeout5 = setTimeout(next5, 183000);

            self.timeout1 = timeout1;
            self.timeout2 = timeout2;
            self.timeout3 = timeout3;
            self.timeout4 = timeout4;
            self.timeout5 = timeout5;
            
        }

        function onSessionEnd(){

            if (self.el!=undefined) self.el.style.visibility = 'visible';


            self.elem1.disabled = false;
            self.elem2.disabled = false;
            self.elem3.disabled = false;
            self.elem5.disabled = false;

            self.elem1.style.visibility = 'visible';
            self.elem2.style.visibility = 'visible';
            self.elem3.style.visibility = 'visible';
            self.elem5.style.visibility = 'visible';


            if (self.sound && self.sound.isPlaying) self.sound.stop();
            if (self.sound1 && self.sound1.isPlaying) self.sound1.stop();
            if (self.sound2 && self.sound2.isPlaying) self.sound2.stop();
            if (self.ring && self.ring.isPlaying) self.ring.stop();

            self.scene.remove(self.worker);
            self.scene.remove(self.tel);


            self.ui1.updateElement('info', "00:00:00");                
            self.ui1.mesh.material.color = new THREE.Color(0x2d7ac8);


            self.scene.remove(self.ui1.mesh);
            self.camera.remove(self.ui1.mesh);

            self.ui2.updateElement('info', "COUNTER: 0");
            self.scene.remove(self.ui2.mesh);
            self.camera.remove(self.ui2.mesh);

            self.ui3.updateElement('info1', "");
            self.ui3.updateElement('info2', "");
            self.ui3.updateElement('info3', "");
            self.ui3.updateElement('info4', "");
            self.scene.remove(self.ui3.mesh);
            self.camera.remove(self.ui3.mesh);

            clearTimeout(self.timeout1);
            clearTimeout(self.timeout2);
            clearTimeout(self.timeout3);
            clearTimeout(self.timeout4);
            clearTimeout(self.timeout5);
            clearInterval(self.interval1);
            clearInterval(self.interval2);
            clearInterval(self.interval3);
            clearInterval(self.interval4);

            self.case = 0;
            self.seconds = 30;
            self.counter = 0;
            self.swipeoption = false;

            self.cyl11.visible = false;
            self.cyl12.visible = false;
            self.cyl13.visible = false;
            self.cyl14.visible = false;
            self.cyl15.visible = false;
            self.cyl16.visible = false;
            self.cyl17.visible = false;

            self.cyl1.material.wireframe = false;
            self.cyl2.material.wireframe = false;
            self.cyl3.material.wireframe = false;
            self.cyl4.material.wireframe = false;
            self.cyl5.material.wireframe = false;
            self.cyl6.material.wireframe = false;
            self.cyl7.material.wireframe = false;

            self.scene.remove(self.cyl1);
            self.scene.remove(self.cyl2);
            self.scene.remove(self.cyl3);
            self.scene.remove(self.cyl4);
            self.scene.remove(self.cyl5);
            self.scene.remove(self.cyl6);
            self.scene.remove(self.cyl7);

            self.scene.remove(self.cyl11);
            self.scene.remove(self.cyl12);
            self.scene.remove(self.cyl13);
            self.scene.remove(self.cyl14);
            self.scene.remove(self.cyl15);
            self.scene.remove(self.cyl16);
            self.scene.remove(self.cyl17);

            self.scene.remove(self.cube);

            self.scene.remove(self.text2);
            self.scene.remove(self.text3);
            self.scene.remove(self.text4);
            self.scene.remove(self.text5);
            self.scene.remove(self.text6);
            self.scene.remove(self.text7);
            self.scene.remove(self.text8);

            self.scene.remove(self.ui4.mesh);
            self.scene.remove(self.ui5.mesh);
            self.scene.remove(self.text9);
            self.scene.remove(self.text10);

            self.ui6.mesh.visible = false;
            self.scene.remove(self.ui6.mesh);
            self.camera.remove(self.ui6.mesh);
            self.ui7.mesh.visible = false;
            self.scene.remove(self.ui7.mesh);
            self.camera.remove(self.ui7.mesh);

            self.ui8.mesh.visible = false;
            self.ui9.mesh.visible = false;
            self.scene.remove(self.ui8.mesh);
            self.camera.remove(self.ui8.mesh);
            self.scene.remove(self.ui9.mesh);      
            self.camera.remove(self.ui9.mesh);      
        }
        
        const btn = new ARButton2( this.renderer, { onSessionStart, onSessionEnd, sessionInit: { optionalFeatures: [ 'dom-overlay' ], domOverlay: { root: document.body } }}, '40%', '60%', 'buttonapp4')
       
        const controller = this.renderer.xr.getController( 0 );
        this.scene.add( controller );
        this.controller = controller;

        this.gestures = new ControllerGestures( this.renderer );

        this.gestures.addEventListener( 'pan', (ev)=>{

            if (self.swipeoption) {

                if (self.display==1){

                    self.cyl1.material.wireframe = true;
                    self.cyl2.material.wireframe = true;
                    self.cyl3.material.wireframe = true;
                    self.cyl4.material.wireframe = true;
                    self.cyl5.material.wireframe = true;
                    self.cyl6.material.wireframe = true;
                    self.cyl7.material.wireframe = true;

                    self.cyl11.visible = true;
                    self.cyl12.visible = true;
                    self.cyl13.visible = true;
                    self.cyl14.visible = true;
                    self.cyl15.visible = true;
                    self.cyl16.visible = true;
                    self.cyl17.visible = true; 
                    self.display = 2;
                    
                    self.ui4.mesh.visible = false;
                    self.ui5.mesh.visible = true;

                    self.text9.visible = false;
                    self.text10.visible = true;
                }   

                else {
                    self.cyl11.visible = false;
                    self.cyl12.visible = false;
                    self.cyl13.visible = false;
                    self.cyl14.visible = false;
                    self.cyl15.visible = false;
                    self.cyl16.visible = false;
                    self.cyl17.visible = false; 
                
                    self.cyl1.material.wireframe = false;
                    self.cyl2.material.wireframe = false;
                    self.cyl3.material.wireframe = false;
                    self.cyl4.material.wireframe = false;
                    self.cyl5.material.wireframe = false;
                    self.cyl6.material.wireframe = false;
                    self.cyl7.material.wireframe = false;
                    self.display = 1;


                    self.ui4.mesh.visible = true;
                    self.ui5.mesh.visible = false;


                    self.text9.visible = true;
                    self.text10.visible = false;

                }
            }

           
        });

        this.renderer.setAnimationLoop( this.render.bind(this) );
    }
     
    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }
    

    render( ) {   
        const dt = this.clock.getDelta();
        this.stats.update();
   
        if ( this.renderer.xr.isPresenting ) {
           this.mixer.update( dt );
           this.mixerT.update(dt);
           this.ui1.update();
           this.ui2.update();
           this.ui3.update();
           this.ui4.update();
           this.ui5.update();
           this.ui6.update();
           this.ui7.update();
           this.ui8.update();
           this.ui9.update();
           this.gestures.update();
        }

        this.renderer.render( this.scene, this.camera );
    }
}

export { App4 };