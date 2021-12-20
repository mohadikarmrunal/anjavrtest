import * as THREE from '../../libs/three/three.module.js';
import { OrbitControls } from '../../libs/three/jsm/OrbitControls.js';
import { GLTFLoader } from '../../libs/three/jsm/GLTFLoader.js';
import { DRACOLoader } from '../../libs/three/jsm/DRACOLoader.js';
import { Stats } from '../../libs/stats.module.js';
import { CanvasUI } from '../../libs/CanvasUI.js'
import { ARButton } from '../../libs/ARButton.js';
import { LoadingBar } from '../../libs/LoadingBar.js';


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
            panelSize: { width: 0.3, height: 0.2 },
            height: 512/1.5,
            info:{ type: "text", position:{ top: 130, left: 6 }, width: 500 , height: 200, textAlign: 'center', fontFamily: 'Verdana', fontSize: 70}
        }

        const content1 = {
            info: ""
        }

        //counter canvas 
        const config2 = {
            panelSize: { width: 0.3, height: 0.2 },
            height: 512/1.5,
            info:{ type: "text", position:{ top: 130, left: 6 }, width: 500 , height: 200, textAlign: 'center', fontFamily: 'Verdana', fontSize: 70}
        }

        const content2 = {
            info: "COUNTER: 0"
        }

        //experiment canvas
        const config3 = {
            panelSize: { width: 1, height: 0.25 },
            height: 128,
            info:{ type: "text", position:{ top: 6, left: 6 } , width: 500, height: 60, textAlign: 'center', fontFamily: 'Verdana', fontSize: 30},
            info1:{ type: "text", position:{ top: 60, left: 6 } , width: 160, height: 56, textAlign: 'center', backgroundColor: "#049", fontFamily: 'Verdana', fontSize: 30},
            info2:{ type: "text", position:{ top: 60, left: 176 } , width: 160, height: 56, textAlign: 'center', backgroundColor: "#049", fontFamily: 'Verdana', fontSize: 30},
            info3:{ type: "text", position:{ top: 60, left: 346 } , width: 160, height: 56, textAlign: 'center', backgroundColor: "#049", fontFamily: 'Verdana', fontSize: 30},

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
    }

    setupVR(){

        this.renderer.xr.enabled = true;   
        const self = this;
        //case tells us which experiment is ongoing
        self.case = 0;
        //counts the calls
        self.counter = 0;

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

            self.scene.remove(self.ui1.mesh);
            self.camera.remove(self.ui1.mesh);

            self.scene.remove(self.ui2.mesh);
            self.camera.remove(self.ui2.mesh);

            self.actionA.reset();
            self.actionT.reset();
           
            self.scene.remove(self.worker);
            self.scene.remove(self.tel);

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
            var timeout1, timeout2, timeout3, timeout4;
            timeout1 = setTimeout(next1, 1000);
            timeout2 = setTimeout(next2, 41000);
            timeout3 = setTimeout(next3, 81000);
            timeout4 = setTimeout(next4, 121000);

            self.timeout1 = timeout1;
            self.timeout2 = timeout2;
            self.timeout3 = timeout3;
            self.timeout4 = timeout4;



            
        }

        function onSessionEnd(){

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
        }

        this.renderer.render( this.scene, this.camera );
    }
}

export { App };