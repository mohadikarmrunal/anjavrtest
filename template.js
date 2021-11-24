import * as THREE from '../../libs/three/three.module.js';
import { OrbitControls } from '../../libs/three/jsm/OrbitControls.js';
import { GLTFLoader } from '../../libs/three/jsm/GLTFLoader.js';
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
        this.createBoxes();
        this.setupVR();
        window.addEventListener('resize', this.resize.bind(this) );
	}	
    
    initScene(){
        console.log('initScene');
        this.loadingBar = new LoadingBar();
        
        this.assetsPath = '../../assets/';
        const loader = new GLTFLoader().setPath(this.assetsPath);
		const self = this;

        loader.load(
			// resource URL
			'TossHead.gltf',
			// called when the resource is loaded
			function ( gltf ) {

                self.animations = {};
                self.head = gltf.scene;
                self.coinH = gltf.scene.children[0].children[1];
                self.head.children[0].children[0].visible = false;
                //gltf.scene.children[0].children[0] je coin
                //gltf.scene.children[0].children[1] je plane
                self.animations['TossHead'] = gltf.animations[0];
                //self.scene.add( self.apple ); 
                //console.log(gltf.animations);
                self.mixer = new THREE.AnimationMixer( self.coinH );
                const clip = self.animations['TossHead'];
                const action = self.mixer.clipAction (clip);
                //action.loop = THREE.LoopOnce;
                action.enabled = true;
                self.action = action;
                //action.play();
                //console.log (action);
                self.loadingBar.visible = false;
                self.head.visible=false;
				const scale = 0.05;
				self.head.scale.set(scale, scale, scale); 
                self.head.position.set( 0, -0.5, -1 ); 
                
			},
			// called while loading is progressing
			function ( xhr ) {

				self.loadingBar.progress = (xhr.loaded / xhr.total);
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'An error happened with coin tossed to head' );
			}
        );

        loader.load(
			// resource URL
			'TossTail.gltf',
			// called when the resource is loaded
			function ( gltf ) {

                self.animationsT = {};
                self.tail = gltf.scene;
                //console.log(gltf.scene.children[0].children[1]);
                self.coinT = gltf.scene.children[0].children[1];
                self.tail.children[0].children[0].visible = false;
                //gltf.scene.children[0].children[0] je coin
                //gltf.scene.children[0].children[1] je plane
                self.animations['TossTail'] = gltf.animations[0];
                //self.scene.add( self.apple ); 
                //console.log(gltf.animations);
                self.mixerT = new THREE.AnimationMixer( self.coinT );
                const clipT = self.animations['TossTail'];
                const actionT = self.mixerT.clipAction (clipT);
                //action.loop = THREE.LoopOnce;
                actionT.enabled = true;
                self.actionT = actionT;
                //action.play();
                //console.log (action);
                self.loadingBar.visible = false;
                self.tail.visible = false;
				const scale = 0.05;
				self.tail.scale.set(scale, scale, scale); 
                self.tail.position.set( 0, -0.5, -1 ); 
                
			},
			// called while loading is progressing
			function ( xhr ) {

				self.loadingBar.progress = (xhr.loaded / xhr.total);
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'An error happened with coin tossed to tail' );
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
        if (sndname == 'canvas1')  self.canvas1 = sound;
        if (sndname == 'canvas2')  self.canvas2 = sound;
        if (sndname == 'canvas3')  self.canvas3 = sound;
        if (sndname == 'canvas4')  self.canvas4 = sound;
    }

    createUI() {
        const self = this;

        //setting up button canvasUI
        const config1 = {
            panelSize: { width: 0.6, height: 0.2 },
            height: 512/3,
            body:{
                textAlign: 'center',
                backgroundColor:'#ccc',
                fontColor:'#000',
                padding: 65,
                fontSize:45,
            },
            info:{ type: "text", fontFamily: 'Verdana'}
        }

        const content1 = {
            info: "EXPERIMENT"
        }

        const ui1 = new CanvasUI(content1, config1);
        this.ui1 = ui1;
        this.ui1.mesh.position.set(0,0.4,-1.1);
        this.ui1.mesh.material.opacity = 0.3;
        this.ui1.mesh.material.transparent = true;
    }

    setupVR(){

        this.renderer.xr.enabled = true;   
        const self = this;
        
        function onSessionStart(){

            self.sound.play();
            var timeout1, timeout2, timeout3;
            timeout1 = setTimeout(next1,31000);
            self.timeout1 = timeout1;
            
        }

        function next1 (){
            const self = this.app;
        }


        function onSessionEnd(){

            if (self.sound && self.sound.isPlaying) self.sound.stop();
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
            
        }

        this.renderer.render( this.scene, this.camera );
    }
}

export { App };