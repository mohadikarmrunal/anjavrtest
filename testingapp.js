import * as THREE from '../../libs/three/three.module.js';
import { OrbitControls } from '../../libs/three/jsm/OrbitControls.js';
import { GLTFLoader } from '../../libs/three/jsm/GLTFLoader.js';
import { Stats } from '../../libs/stats.module.js';
import { ARButton } from '../../libs/ARButton.js';
import { LoadingBar } from '../../libs/LoadingBar.js';
import { ControllerGestures } from '../../libs/ControllerGestures.js';
import { DRACOLoader } from '../../libs/three/jsm/DRACOLoader.js';


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
        
        this.stats = new Stats();

        this.listener = new THREE.AudioListener();
        this.camera.add( this.listener );

        const sound = new THREE.Audio( this.listener );
        const audioLoader = new THREE.AudioLoader();
            audioLoader.load( 'audio/app1.mp3', ( buffer ) => {
                sound.setBuffer( buffer );
                sound.setLoop( false );
                sound.setVolume( 1.0 );
            });
        this.sound = sound;
        
        this.initScene();
        this.setupVR();
        window.addEventListener('resize', this.resize.bind(this) );
	}	

    stylizeElement( element, active = true, fontSize = 13, ignorePadding = false ) {

        element.style.position = 'absolute';
        //element.style.top = '20px';
        if (!ignorePadding) element.style.padding = '12px 6px';
        element.style.border = '1px solid #fff';
        element.style.borderRadius = '4px';
        element.style.background = (active) ? 'rgba(20,150,80,1)' : 'rgba(180,20,20,1)';
        element.style.color = '#fff';
        element.style.font = `normal ${fontSize}px sans-serif`;
        element.style.textAlign = 'center';
        element.style.opacity = '0.5';
        element.style.outline = 'none';
        element.style.zIndex = '999';

    }
    
    initScene(){
        this.loadingBar11 = new LoadingBar();
        
        this.assetsPath = '../../assets/';
        const loader1 = new GLTFLoader().setPath(this.assetsPath);
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( '../../libs/three/js/draco/' );
        loader1.setDRACOLoader( dracoLoader );
		const self = this;

        loader1.load(
			// resource URL
			'Coin.gltf',
			// called when the resource is loaded
			function ( gltf ) {

                self.apple = gltf.scene;
                self.apple.visible = false;
                self.apple.children[0].rotateX(Math.PI/2);
				const scale = 0.4;
                console.log(self.apple.children[0].children[0]);
				self.apple.scale.set(scale, scale, scale); 

                self.coinH = self.apple.children[0].children[0].clone();
                var prevMaterial = self.coinH.material;
                self.coinH.material.map.minFilter = THREE.LinearMipMapLinearFilter;
                self.coinH.material.map.magFilter = THREE.LinearFilter;
                self.coinH.material.map.anisotropy = self.renderer.capabilities.getMaxAnisotropy();
                self.coinH.material = new THREE.MeshPhongMaterial();
                THREE.MeshBasicMaterial.prototype.copy.call( self.coinH.material, prevMaterial );
                self.coinH.rotateX(Math.PI/2);
				self.coinH.scale.set(scale, scale, scale); 

                self.loadingBar11.visible = false;


			},
			// called while loading is progressing
			function ( xhr ) {
				if (xhr.loaded <= xhr.total) self.loadingBar11.progress = (xhr.loaded / xhr.total);
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'An error happened with loading a 3D Object!' );
                alert('An error happened when loading 3D Objects. Refresh the page!');

			}
        );


    }

       
    setupVR(){

        this.renderer.xr.enabled = true; 
        const self = this;

     
        function onSessionStart(){

          

            if(!self.apple.visible){
                self.apple.visible = true;
                self.apple.position.set( 0.5, 0, -1.5 ); 
                self.scene.add( self.apple); 
                /*self.coinH.visible = true;
                self.coinH.position.set( -0.5, 0, -1.5 ); 
                self.scene.add( self.coinH); */
            }           
        }

        function onSessionEnd(){
            self.apple.visible = false;
            self.coinH.visible = false;
        }

         const btn = new ARButton( this.renderer, { onSessionStart, onSessionEnd, sessionInit: { optionalFeatures: [ 'dom-overlay' ], domOverlay: { root: document.body } }})
         this.gestures = new ControllerGestures( this.renderer );
         this.renderer.setAnimationLoop( this.render.bind(this) );

         const button1 = document.createElement( 'button' );
         button1.style.height = '40px';
         button1.style.display = '';
         button1.style.left = '20px';
         button1.style.top = '20px';
         button1.style.width = '80px';
         button1.style.cursor = 'pointer';
         button1.innerHTML = '<i class="fas fa-camera"></i>';
         this.stylizeElement( button1, true, 30, true );
         button1.onclick = function() {
              console.log('button was clicked');
         };
         document.body.appendChild( button1 );

         console.log (button1);
    }
    
    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }
    

    render( ) {   
        const dt = this.clock.getDelta();
        this.stats.update();
        
        if ( this.renderer.xr.isPresenting ){
            this.gestures.update();
        }
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };