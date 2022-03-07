import * as THREE from '../../libs/three/three.module.js';
import { GLTFLoader } from '../../libs/three/jsm/GLTFLoader.js';
import { DRACOLoader } from '../../libs/three/jsm/DRACOLoader.js';
//import { RGBELoader } from '../../libs/three/jsm/RGBELoader.js';
import { LoadingBar } from '../../libs/LoadingBar.js';
import { Stats } from '../../libs/stats.module.js';
import { OrbitControls } from '../../libs/three/jsm/OrbitControls.js';
//adaptstion of 4_4

class App{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
        this.clock = new THREE.Clock();
        
		this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 );
		this.camera.position.set( 0, 1.6, 5 );
        this.camera.lookAt( 0, 0, 0 );
        
		this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x505050 );

		this.scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );

        const light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 1, 1, 1 ).normalize();
		this.scene.add( light );
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
        
		container.appendChild( this.renderer.domElement );
        
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.target.set(0, 1, 0);
        this.controls.update();
        
        this.stats = new Stats();
        document.body.appendChild( this.stats.dom );
        
        this.loadingBar = new LoadingBar();
        this.initScene();
        
        window.addEventListener('resize', this.resize.bind(this) );
	}	
    
    
    initScene(){
        this.loadGLTF( 'knight' );
    }
    
    addButtonEvents(){
        const self = this;
        
        function onClick1(){
            self.actionA.stop();
            self.actionA.reset();
            self.actionI.play();
        }
        function onClick2(){
            self.actionI.stop();
            self.actionI.reset();
            self.actionA.play();   
        }
        
        const btn1 = document.getElementById(`btn${1}`);
        btn1.addEventListener( 'click', onClick1 );
        const btn2 = document.getElementById(`btn${2}`);
        btn2.addEventListener( 'click', onClick2 );

        
    }
    
    loadGLTF(filename){
        this.assetsPath = '../../assets/';
        const loader = new GLTFLoader().setPath(this.assetsPath);
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( '../../libs/three/js/draco/' );
        loader.setDRACOLoader( dracoLoader );

        
        const self = this;
		
		// Load a glTF resource
		loader.load(
			// resource URL
			`${filename}.glb`,
			// called when the resource is loaded
			function ( gltf ) {

                //console.log(gltf.scene.children[0]);

                self.animations = {};
                
                //self.animations[TossHead]= gltf.animations[0];
                //console.log(gltf.animations[0]);
                self.animations['Idle'] = gltf.animations[5];
                self.animations['Answer'] = gltf.animations[3];
                /*gltf.animations.forEach( (anim)=>{
                    self.animations[anim.name] = anim;
                    console.log(anim.name);
                })*/


                console.log(gltf);
                console.log(gltf.scene.children[6]);

                self.worker = gltf.scene.children[6];

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

                
                //this is coin, and 0 is plane
                
                self.worker.position.set(0,0,-2);
                const scale = 0.5;
				self.worker.scale.set(scale, scale, scale); 
                self.scene.add( self.worker );
                
                self.loadingBar.visible = false;
                
                //self.action = "Idle";
                self.addButtonEvents();
                
                self.renderer.setAnimationLoop( self.render.bind(self) );
			},
			// called while loading is progressing
			function ( xhr ) {

				self.loadingBar.progress = (xhr.loaded / xhr.total);
				
			},
			// called when loading has errors
			function ( error ) {

				console.log( 'An error happened' );

			}  
        );
    }
    
    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }
    
	render( ) {   
        const dt = this.clock.getDelta();
        this.stats.update();
        this.mixer.update( dt )
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };