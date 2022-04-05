import * as THREE from './libs/three/three.module.js';
import { OrbitControls } from './libs/three/jsm/OrbitControls.js';
import { Stats } from './libs/stats.module.js';
import { DRACOLoader } from './libs/three/jsm/DRACOLoader.js';
import { LoadingBar } from './libs/LoadingBar.js';
import { GLTFLoader } from './libs/three/jsm/GLTFLoader.js';

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
        
       this.initscene();
        this.setupVR();

        window.addEventListener('resize', this.resize.bind(this) );

	
    }
    
    initscene(){
        
        this.loadingBar = new LoadingBar();
        this.assetsPath = '../../assets/';
        const loader = new GLTFLoader().setPath(this.assetsPath);
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( '../../libs/three/js/draco/' );
        loader.setDRACOLoader( dracoLoader );
        const self = this;
        
        loader.load(
            // resource URL
            'worker2.glb',
            // called when the resource is loaded
            function ( gltf ) {

                self.animations = {};
                self.animations['Talk'] = gltf.animations[0];
                self.worker = gltf.scene.children[0];
                const scale = 0.015;
                self.worker.scale.set(scale, scale, scale); 
                self.worker.position.set(0.3,-2.05,-3);

                //animations
                self.mixer = new THREE.AnimationMixer( self.worker );
                const clip = self.animations['Talk'];
                const action = self.mixer.clipAction (clip);
                action.enable = true;
                self.action = action;
                self.action.timeScale = 0.7;
                self.action.loop = THREE.LoopPingPong;
                self.action.repetitions = 2;

                self.loadingBar.visible = false;

            },
            // called while loading is progressing
            function ( xhr ) {

                if (xhr.loaded <= xhr.total) self.loadingBar.progress = (xhr.loaded / xhr.total);
            },
            // called when loading has errors
            function ( error ) {
                console.log( 'An error happened while loading 3D object!' );
                alert ('Objects did not load properly. Please refresh the page!');

            }
        );

    }

    setupVR() {

        this.renderer.xr.enabled = true;
        const sound = new THREE.Audio( this.listener );
             const audioLoader = new THREE.AudioLoader();
              audioLoader.load( 'audio/app.mp3', ( buffer ) => {
               sound.setBuffer( buffer );
               sound.setLoop( false );
               sound.setVolume( 1.0 );
           });
        this.sound = sound;
        this.speech = new THREE.Audio( this.listener );

        const self = this;
        const count = 0;
        self.count = count;

        function next1(){
            if (self.worker!=undefined) {
                self.scene.add(self.worker);
            
                self.timeout3 = setTimeout(function(){self.sound.play()
                    self.action.play();              
                },2000);


            }
            else {
                 
                self.timeout2 = setTimeout (next1,2000);
            }
        }

        function onSessionStart(){

            const el = document.getElementById("text");
            self.el = el;
            if (self.el!=undefined) self.el.style.visibility = 'hidden';

            var timeout1, 
            timeout1 = setTimeout(next1, 4000);
            self.timeout1 = timeout1;            
            
        }
       
        function onSessionEnd(){

            if (self.el!=undefined) self.el.style.visibility = 'visible';
            if (self.sound && self.sound.isPlaying) self.sound.stop();
            clearTimeout(self.timeout1);
            clearTimeout(self.timeout2);
            clearTimeout(self.timeout3);



        }

        const sessionInit = { optionalFeatures: [ 'dom-overlay' ], domOverlay: { root: document.body } };

        
        self.onSessionStart = onSessionStart;
        self.onSessionEnd = onSessionEnd;
        self.sessionInit = sessionInit;
    
        
        if ( 'xr' in navigator ) {

			const button = document.createElement( 'button' );
			button.style.display = 'none';
            button.style.height = '40px';

			navigator.xr.isSessionSupported( 'immersive-ar' ).then( ( supported ) => {

				supported ? self.showStartAR( button ) : self.showARNotSupported( button );

			} );
            
            document.body.appendChild( button );

		} else {

			const message = document.createElement( 'a' );

			if ( window.isSecureContext === false ) {

				message.href = document.location.href.replace( /^http:/, 'https:' );
				message.innerHTML = 'WEBXR NEEDS HTTPS'; 

			} else {

				message.href = 'https://immersiveweb.dev/';
				message.innerHTML = 'WEBXR NOT AVAILABLE';

			}

			message.style.left = '0px';
			message.style.width = '100%';
			message.style.textDecoration = 'none';

			self.stylizeElement( message, false );
            message.style.bottom = '0px';
            message.style.opacity = '1';
            
            document.body.appendChild ( message );

		}

        
        
        const controller = this.renderer.xr.getController( 0 );
        
        this.scene.add( controller );
        this.controller = controller;
        
        this.renderer.setAnimationLoop( this.render.bind(this) );

    }

    showStartAR( button ) {

        let currentSession = null;
        const self = this;
                
        function onSessionStarted( session ) {

            session.addEventListener( 'end', onSessionEnded );

            self.renderer.xr.setReferenceSpaceType( 'local' );
            self.renderer.xr.setSession( session );
            
            currentSession = session;
            
            if (self.onSessionStart !== undefined && self.onSessionStart !== null) self.onSessionStart();

        }

        function onSessionEnded( ) {

            currentSession.removeEventListener( 'end', onSessionEnded );

            self.stylizeElement( button, true, 12, true );
            button.textContent = 'START AR';

            currentSession = null;
            
            if (self.onSessionEnd !== undefined && self.onSessionEnd !== null) self.onSessionEnd();

        }

        if ( currentSession === null ) {

            // WebXR's requestReferenceSpace only works if the corresponding feature
            // was requested at session creation time. For simplicity, just ask for
            // the interesting ones as optional features, but be aware that the
            // requestReferenceSpace call will fail if it turns out to be unavailable.
            // ('local' is always available for immersive sessions and doesn't need to
            // be requested separately.)
            
            navigator.xr.requestSession( 'immersive-ar', self.sessionInit ).then( onSessionStarted );

        } else {

            currentSession.end();

        }

    }

    showARNotSupported( button ) {
        this.stylizeElement( button, false );
        button.style.display = '';
        button.style.width = '100%';
        button.style.right = '0px';
        button.style.bottom = '0px';
        button.style.border = '';
        button.style.opacity = '1';
        button.style.fontSize = '13px';
        button.textContent = 'AR NOT SUPPORTED';

    }

    stylizeElement( element, active = true, fontSize = 13, ignorePadding = false ) {

        element.style.position = 'absolute';
        element.style.bottom = '20px';
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

    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }
    

    render( ) {   
        const dt = this.clock.getDelta();
        this.stats.update();
        if ( this.renderer.xr.isPresenting ) {
            if (this.worker!=undefined)  this.mixer.update( dt )

        }
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };