import * as THREE from '../../libs/three/three.module.js';
import { OrbitControls } from '../../libs/three/jsm/OrbitControls.js';
import { GLTFLoader } from '../../libs/three/jsm/GLTFLoader.js';
import { DRACOLoader } from '../../libs/three/jsm/DRACOLoader.js';
import { Stats } from '../../libs/stats.module.js';
import { CanvasUI } from '../../libs/CanvasUI.js'
import { ARButton } from '../../libs/ARButton.js';
import { LoadingBar } from '../../libs/LoadingBar.js';
import { ControllerGestures } from '../../libs/ControllerGestures.js';



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
        this.loadingBar41 = new LoadingBar();
        this.assetsPath = '../../assets/';
        const loader = new GLTFLoader().setPath(this.assetsPath);
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( '../../libs/three/js/draco/' );
        loader.setDRACOLoader( dracoLoader );
		const self = this;
        
        loader.load(
			// resource URL
			'radnicaNOVA.glb',
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
                //self.actionA.loop = THREE.LoopOnce;

                //self.actionA.play();              
                self.loadingBar41.visible = false;
  
			},
			// called while loading is progressing
			function ( xhr ) {

				self.loadingBar41.progress = (xhr.loaded / xhr.total);
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'An error happened while loading 3D object!' );
                alert ('Objects did not load properly. Please refresh the page!');

			}
        );        
    }

   
  
    setupVR(){
        const self = this;
        this.renderer.xr.enabled = true;   

       
       
        function next1() {
            //self.actionA.reset();
            self.actionA.play();
            console.log('next1 happening');
        }

    
        
        function onSessionStart(){
            
           
            self.scene.add(self.worker);

            var timeout1,
            timeout1 = setTimeout(next1, 6000);
            self.timeout1 = timeout1;
          
        }

        function onSessionEnd(){


            self.scene.remove(self.worker);
            clearTimeout(self.timeout1);
           
     
        }

     
        
        const btn = new ARButton( this.renderer, { onSessionStart, onSessionEnd, sessionInit: { optionalFeatures: [ 'dom-overlay' ], domOverlay: { root: document.body } }})

        const controller = this.renderer.xr.getController( 0 );

        this.scene.add( controller );
        this.controller = controller;

        this.gestures = new ControllerGestures( this.renderer );
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
           this.gestures.update();
        }

        this.renderer.render( this.scene, this.camera );
    }
}

export { App };