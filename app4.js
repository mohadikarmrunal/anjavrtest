import * as THREE from '../../libs/three/three.module.js';
import { OrbitControls } from '../../libs/three/jsm/OrbitControls.js';
import { GLTFLoader } from '../../libs/three/jsm/GLTFLoader.js';
import { DRACOLoader } from '../../libs/three/jsm/DRACOLoader.js';
import { Stats } from '../../libs/stats.module.js';
import { CanvasUI } from '../../libs/CanvasUI.js'
import { ARButton } from '../../libs/ARButton.js';
import { LoadingBar } from '../../libs/LoadingBar.js';
import { ControllerGestures } from '../../libs/ControllerGestures.js';
import { FontLoader } from '../../libs/FontLoader.js';
import { TextGeometry } from '../../libs/TextGeometry.js';



class App{
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
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
		container.appendChild( this.renderer.domElement );
        
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.target.set(0, 3.5, 0);
        this.controls.update();

        this.listener = new THREE.AudioListener();

        this.stats = new Stats();
        this.initScene();
        this.setupVR();
        window.addEventListener('resize', this.resize.bind(this) );
        
        var teltest, worktest
        this.teltest = teltest;
        this.worktest = worktest;
        this.teltest = false;
        this.worktest = false;
	}	

   /* set action(name){
		if (this.actionName == name) return;
		
		const clip = this.animations[name];
		
        if (clip!==undefined){
			const action = this.mixer.clipAction( clip );
              
			this.actionName = name;
			if (this.curAction) this.curAction.crossFadeTo(action, 0.5);
            
            action.enabled = true;
			action.play();
            
            this.curAction = action;
		}
	}*/
    
    initScene(){
        console.log('initScene');
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
                /////
                console.log(gltf.scene);

                self.worker = gltf.scene.children[0];
                //self.worker.rotateZ(-Math.PI/2);
                //self.worker.rotateX(-Math.PI/10);
                const scale = 0.015;
				self.worker.scale.set(scale, scale, scale); 
                self.worker.rotateZ(Math.PI/2);
                self.worker.position.set(0.3,-1.05,-3);

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
                self.loadingBar.visible = false;

  
                self.worktest = true;         
			},
			// called while loading is progressing
			function ( xhr ) {

				self.loadingBar.progress = (xhr.loaded / xhr.total);
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'An error happened with coin tossed to head' );
                alert ('Objects did not load properly. Please refresh the page!');
                self.worktest = false;         

			}
        );

        loader.load(
			// resource URL
			'telephone1.glb',
			// called when the resource is loaded
			function ( gltf ) {

                self.animationsT = {};
                console.log(gltf.scene);
                self.tel = gltf.scene;
                const scale = 2;
                self.tel.scale.set(scale, scale, scale);
                self.tel.position.set(-0.6,-1,-3);

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
                self.teltest = true;
			},
			// called while loading is progressing
			function ( xhr ) {

				self.loadingBar.progress = (xhr.loaded / xhr.total);
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'An error happened with coin tossed to head' );
                alert ('Objects did not load properly. Please refresh the page!');
                self.teltest = false;

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
            if (sound.isPlaying) sound.stop();
            sound.setBuffer( buffer );
            sound.setLoop( false );
            sound.setVolume( 1.0 );
            sound.play();
        });
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
            info: ""
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
            //panelSize: { width: 1, height: 0.2 },
            panelSize: {height:0.2},
            height: window.innerWidth/5,
            width: window.innerWidth,
            info:{ type: "text", position:{ top: 10, left: 10 } , width: window.innerWidth-20 , height: (window.innerWidth/20), textAlign: 'center', fontFamily: 'Verdana', fontSize: 30, padding: 15},
            info1:{ type: "text", position:{ top: (window.innerWidth/10), left: 20} , width: (window.innerWidth-40)/4, height: (window.innerWidth/20)*2, textAlign: 'center', backgroundColor: "#049", fontFamily: 'Verdana', fontSize: 50, padding: 15},
            info2:{ type: "text", position:{ top: (window.innerWidth/10), left: (window.innerWidth-40)/4+40 } , width: (window.innerWidth-40)/4, height: (window.innerWidth/20)*2, textAlign: 'center', backgroundColor: "#049", fontFamily: 'Verdana', fontSize: 50, padding: 15},
            info3:{ type: "text", position:{ top: (window.innerWidth/10), left: (window.innerWidth-40)/2+60} , width: (window.innerWidth-40)/4, height: (window.innerWidth/20)*2, textAlign: 'center', backgroundColor: "#049", fontFamily: 'Verdana', fontSize: 50, padding: 15},

        }

        const content3 = {
            info: "EXPERIMENT",
            info1: "",
            info2: "",
            info3: "",

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
        this.ui3.mesh.position.set(0,-0.4,-1);
        this.ui3.mesh.material = material3;
        self.ui3.mesh.material.color = new THREE.Color(0xf22602);
        this.ui3.mesh.material.map = this.ui3.texture;  

        //material for the board
        const material4 = new THREE.MeshPhysicalMaterial ();
        material4.color = new THREE.Color(0xf3f5f7);
        material4.transparent = true;
        material4.roughness = 0;
        material4.metalness = 0.4;
        material4.reflectivity = 1;
        material4.clearcoat = 0.7;
        material4.clearcoatRoughness = 1;

        //material for the cylinders when displaying both |   material for the theoretical frequencies
        const material5 = new THREE.MeshPhysicalMaterial ();
        material5.color = new THREE.Color(0x008a49);
        material5.roughness = 0.08;
        material5.metalness = 0.8;
        material5.reflectivity = 0.5;
        material5.clearcoatRoughness = 1;
        material5.flatShading = true;
       
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

        const geometry8 = new THREE.BoxGeometry (0.8,0.02,0.6);

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

        this.cyl1.position.set(-0.3,-0.14,-1); 
        this.cyl2.position.set(-0.2,-0.05,-1); 
        this.cyl3.position.set(-0.1,0,-1); 
        this.cyl4.position.set(0,-0.03,-1); 
        this.cyl5.position.set(0.1,-0.07,-1); 
        this.cyl6.position.set(0.2,-0.1,-1); 
        this.cyl7.position.set(0.3,-0.15,-1); 


        this.cyl11.position.set(-0.3,-0.176,-1); 
        this.cyl12.position.set(-0.2,-0.068,-1); 
        this.cyl13.position.set(-0.1,-0.038,-1); 
        this.cyl14.position.set(0,-0.045,-1); 
        this.cyl15.position.set(0.1,-0.081,-1); 
        this.cyl16.position.set(0.2,-0.124,-1); 
        this.cyl17.position.set(0.3,-0.163,-1); 

        this.cyl11.visible = false;
        this.cyl12.visible = false;
        this.cyl13.visible = false;
        this.cyl14.visible = false;
        this.cyl15.visible = false;
        this.cyl16.visible = false;
        this.cyl17.visible = false;


        this.cube.position.set(0,-0.23,-1);
        console.log(window.innerWidth);


        //text for the histograph 
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


            const text2 = new THREE.Mesh (geometryT2, material5);
            const text3 = new THREE.Mesh (geometryT3, material5);
            const text4 = new THREE.Mesh (geometryT4, material5);
            const text5 = new THREE.Mesh (geometryT5, material5);
            const text6 = new THREE.Mesh (geometryT6, material5);
            const text7 = new THREE.Mesh (geometryT7, material5);
            const text8 = new THREE.Mesh (geometryT8, material5);


            self.text2 = text2;
            self.text3 = text3;
            self.text4 = text4;
            self.text5 = text5;
            self.text6 = text6;
            self.text7 = text7;
            self.text8 = text8;

            self.text2.scale.set(0.006,0.006,0.006);
            self.text3.scale.set(0.006,0.006,0.006);
            self.text4.scale.set(0.006,0.006,0.006);
            self.text5.scale.set(0.006,0.006,0.006);
            self.text6.scale.set(0.006,0.006,0.006);
            self.text7.scale.set(0.006,0.006,0.006);
            self.text8.scale.set(0.006,0.006,0.006);

            self.text2.position.set(-0.35,-0.22,-0.85);     
            self.text3.position.set(-0.25,-0.22,-0.85);
            self.text4.position.set(-0.15,-0.22,-0.85);
            self.text5.position.set(-0.05,-0.22,-0.85);
            self.text6.position.set(0.05,-0.22,-0.85);
            self.text7.position.set(0.15,-0.22,-0.85);
            self.text8.position.set(0.25,-0.22,-0.85);
        } );

        




    }

    setupVR(){

        this.renderer.xr.enabled = true;   
        const self = this;
        //used to enable the swipe option
        self.swipeoption = false;
        //case tells us which experiment is ongoing
        self.case = 0;
        //counts the calls
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

        function next4(){

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
        }

        function next5(){

        }
        
        function onSessionStart(){

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

            //self.sound.play();
            var timeout1, timeout2, timeout3, timeout4, timeout5;
            timeout1 = setTimeout(next1, 1000);
            //timeout2 = setTimeout(next2, 41000);
            //timeout3 = setTimeout(next3, 81000);
            //timeout4 = setTimeout(next4, 121000);
            //just a version for testing so that I dont have to wait 
            timeout4 = setTimeout(next4, 41000);
            //timeout5 = setTimeout(next5, 44000);




            self.timeout1 = timeout1;
            self.timeout2 = timeout2;
            self.timeout3 = timeout3;
            self.timeout4 = timeout4;



            
        }

        function onSessionEnd(){

            self.scene.remove(self.worker);
            self.scene.remove(self.phone);

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
            self.scene.remove(self.ui3.mesh);
            self.camera.remove(self.ui3.mesh);

            clearTimeout(self.timeout1);
            clearTimeout(self.timeout2);
            clearTimeout(self.timeout3);
            clearTimeout(self.timeout4);
            clearInterval(self.interval1);
            clearInterval(self.interval2);
            clearInterval(self.interval3);
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

            
            //if (self.sound && self.sound.isPlaying) self.sound.stop();
        }

        var promise = new Promise(function(resolve, reject) {
            console.log('promise');
            const sound = new THREE.Audio( self.listener );
            const audioLoader = new THREE.AudioLoader();
             audioLoader.load( 'audio/intoapp3.mp3', ( buffer ) => {
              sound.setBuffer( buffer );
              sound.setLoop( false );
              sound.setVolume( 1.0 );
          });
           self.sound = sound;
           self.speech = new THREE.Audio( self.listener );
           const controlspeech = true;
           self.controlspeech = controlspeech;
      
            if (self.controlspeech) {
            resolve("Sound loaded!");
            }
             else {
            reject(Error("Sound did not load."));
            }
         });


       promise.then(function(result) {
               console.log('adding ar button');
               console.log(result);
              const btn = new ARButton( self.renderer, { onSessionStart, onSessionEnd, sessionInit: { optionalFeatures: [ 'dom-overlay' ], domOverlay: { root: document.body } }})
              console.log(result)}, function (error){    
                  console.log(error);
        });
        


        const controller = this.renderer.xr.getController( 0 );

        this.scene.add( controller );
        this.controller = controller;

        this.gestures = new ControllerGestures( this.renderer );

        this.gestures.addEventListener( 'pan', (ev)=>{
            //console.log( ev );   
            //self.ui.updateElement('info', `swipe ${ev.direction}` );
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
           this.gestures.update();
        }

        this.renderer.render( this.scene, this.camera );
    }
}

export { App };