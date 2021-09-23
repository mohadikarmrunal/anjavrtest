import * as THREE from '../../libs/three/three.module.js';
import { OrbitControls } from '../../libs/three/jsm/OrbitControls.js';
import { GLTFLoader } from '../../libs/three/jsm/GLTFLoader.js';
import { Stats } from '../../libs/stats.module.js';
import { CanvasUI } from '../../libs/CanvasUI.js'
import { ARButton } from '../../libs/ARButton.js';
//import { FBXLoader } from '../../libs/three/jsm/FBXLoader.js';
import { LoadingBar } from '../../libs/LoadingBar.js';
//import { Player } from '../../libs/Player.js';
import { ControllerGestures } from '../../libs/ControllerGestures.js';
//JUST SOME BASIC TEMPLATE FOR TESTING OBJECTS AND LOADERS
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
        
        this.initScene();
        this.setupVR();
        window.addEventListener('resize', this.resize.bind(this) );
	}	
    
    initScene(){
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
                console.log(gltf.scene.children[0].children[1]);
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

        loader.load(
			// resource URL
			'Coin.gltf',
			// called when the resource is loaded
			function ( gltf ) {

                self.coin = gltf.scene;
                self.loadingBar.visible = false;
                self.coin.visible = false;
				const scale = 0.05;
				self.coin.scale.set(scale, scale, scale); 
                //console.log(self.coin.children[0]);
                self.coin.children[0].rotateX(Math.PI/2);
                console.log(Math.PI);
                self.coin1 = self.coin.clone();
                self.coin2 = self.coin.clone();
                self.coin3 = self.coin.clone();
                self.coin3.children[0].rotateX(Math.PI);
                self.coin4 = self.coin.clone();
                self.coin4.children[0].rotateX(Math.PI);
                self.coin5 = self.coin.clone();
                self.coin6 = self.coin.clone();
                self.coin6.children[0].rotateX(Math.PI);
                self.coin7 = self.coin.clone();
                self.coin7.children[0].rotateX(Math.PI);
			},
			// called while loading is progressing
			function ( xhr ) {

				self.loadingBar.progress = (xhr.loaded / xhr.total);
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'An error happened with the coin' );
			}
        );
         
        
        this.createUI();


    }


    createUI() {
        
        const self = this;
        //setting up button canvasUI
        const config = {
            panelSize: { width: 0.7, height: 0.1 },
            height: 73,
            info: { type: "text", position:{ left: 6, top: 6 }, textAlign: 'center', padding: 10 ,width: 500, height: 28, backgroundColor: "#fff", fontColor: "#000", fontSize: 17, fontStyle: 'Arial'},
            button1: { type: "button", position:{ top: 39, left: 6 }, width: 240, height: 28, fontSize: 25, fontColor: "#fff", padding: 10, backgroundColor: "#02f", hover: "#3df", onSelect: button1 },
            button2: { type: "button", position:{ top: 39, left: 266 }, width: 240, height: 28, fontSize: 25, fontColor: "#fff", padding: 10, backgroundColor: "#02f", hover: "#3df", onSelect: button2 },
            renderer: this.renderer
        }

        const configH = {
            panelSize: { width: 0.7, height: 0.1 },
            height: 73,
            info: { type: "text", position:{ left: 6, top: 6 }, textAlign: 'center', padding: 10 ,width: 500, height: 28, backgroundColor: "#fff", fontColor: "#000", fontSize: 17, fontStyle: 'Arial'},
            button0: { type: "button", position:{ top: 39, left: 6 }, width: 160, height: 28, fontSize: 25, fontColor: "#fff", padding: 10, backgroundColor: "#02f", hover: "#3df", onSelect: button0H },
            button1: { type: "button", position:{ top: 39, left: 176 }, width: 160, height: 28, fontSize: 25, fontColor: "#fff", padding: 10, backgroundColor: "#02f", hover: "#3df", onSelect: button1H },
            button2: { type: "button", position:{ top: 39, left: 186 }, width: 160, height: 28, fontSize: 25, fontColor: "#fff", padding: 10, backgroundColor: "#02f", hover: "#3df", onSelect: button2H },
            renderer: this.renderer
        }

        const configT = {
            panelSize: { width: 0.7, height: 0.1 },
            height: 73,
            info: { type: "text", position:{ left: 6, top: 6 }, textAlign: 'center', padding: 10 ,width: 500, height: 28, backgroundColor: "#fff", fontColor: "#000", fontSize: 17, fontStyle: 'Arial'},
            button0: { type: "button", position:{ top: 39, left: 6 }, width: 160, height: 28, fontSize: 25, fontColor: "#fff", padding: 10, backgroundColor: "#02f", hover: "#3df", onSelect: button0T },
            button1: { type: "button", position:{ top: 39, left: 176 }, width: 160, height: 28, fontSize: 25, fontColor: "#fff", padding: 10, backgroundColor: "#02f", hover: "#3df", onSelect: button1T },
            button2: { type: "button", position:{ top: 39, left: 186 }, width: 160, height: 28, fontSize: 25, fontColor: "#fff", padding: 10, backgroundColor: "#02f", hover: "#3df", onSelect: button2T },
            renderer: this.renderer
        }

        const content = {
            info: "Description of Random Variable:",
            button1: "Head",
            button2: "Tail",
        }

        const contentH = {
            info: "Number of Heads Tossed",
            button1: "1",
            button2: "2",
        }

        const contentT = {
            info: "Number of Tails Tossed",
            button1: "1",
            button2: "2",
        }

        const ui = new CanvasUI( content, config );
        this.ui = ui;
        this.ui.mesh.position.set(0, -0.3, -0.9);

        const uiHead = new CanvasUI(contentH, config);
        this.uiHead = uiHead;
        this.uiHead.mesh.position.set(0, -0.3, -0.9);

        const uiTail = new CanvasUI( contentT, config );
        this.uiTail = uiTail;
        this.uiTail.mesh.position.set(0, -0.3, -0.9);

        function button1(){
            const msg = "You have selected head";
            console.log(msg);
            self.ui.mesh.visible = false;
            self.scene.add(self.uiHead.mesh);
            self.ui.updateElement( "info", msg );
        }
        
        function button2(){
            const msg = "You have selected tail";
            self.ui.mesh.visible = false;
            self.scene.add(self.uiTail.mesh);
            self.ui.updateElement( "info", msg );
        }

        function button0H(){
            const msg = "You have counted cases where no heads are tossed";
            console.log(msg);
            self.ui.updateElement( "info", msg );
        }
        function button1H(){
            const msg = "You have counted cases where 1 head is tossed";
            console.log(msg);
            self.ui.updateElement( "info", msg );
        }
        
        function button2H(){
            const msg = "You have counted cases where 2 heads are tossed";
            console.log(msg);
            self.ui.updateElement( "info", msg );
        }

        function button0T(){
            const msg = "You have counted cases where no tails are tossed";
            console.log(msg);
            self.ui.updateElement( "info", msg );
        }

        function button1T(){
            const msg = "You have counted cases where 1 tail ais tossed";
            console.log(msg);
            self.ui.updateElement( "info", msg );
        }
        
        function button2T(){
            const msg = "You have counted cases where 2 tails are tossed";
            console.log(msg);
            self.ui.updateElement( "info", msg );
        }
       
    }

    countingHeads(){
        //this.ui.mesh.visible = false;
    }

    countingTails(){

    }

    setupVR(){
        this.renderer.xr.enabled = true; 
        
        const self = this;
        //let controller;
       /* function onSessionEnd(){
            self.camera.remove( self.ui.mesh );
        }*/

        function onSessionStart(){
             if(!self.head.visible){
                
                setTimeout(next1,3000);
                setTimeout(next2,6000);
                setTimeout(next3, 9000);
                //self.scene.add( self.head);  
                //console.log(self.action);  
                //self.action.loop = THREE.LoopOnce;
                //self.action.play();
            }
        }

        function next1 (){
            this.app.head.visible = true;
            this.app.scene.add(this.app.head);
            this.app.action.play();
            //this.app.action.loop = THREE.LoopOnce;
        }

        function next2(){
            this.app.head.visible = false;
            this.app.tail.visible = true;
            this.app.scene.add(this.app.tail);
            this.app.actionT.play();
            //this.app.actionT.loop = THREE.LoopOnce;
        }

        function next3(){
            this.app.tail.visible = false;

            this.app.coin.visible = true;
            this.app.coin.position.set( -0.3, 0.15, -0.9 ); 
            this.app.scene.add( this.app.coin); 

            this.app.coin1.visible = true;
            this.app.coin1.position.set( -0.16, 0.15, -0.9 ); 
            this.app.scene.add( this.app.coin1); 

            this.app.coin2.visible = true;
            this.app.coin2.position.set( 0.16, 0.15, -0.9 ); 
            this.app.scene.add( this.app.coin2); 

            this.app.coin3.visible = true;
            this.app.coin3.position.set( 0.3, 0.15, -0.9 ); 
            this.app.scene.add( this.app.coin3); 

            this.app.coin4.visible = true;
            this.app.coin4.position.set( -0.3, -0.15, -0.9 ); 
            this.app.scene.add( this.app.coin4); 

            this.app.coin5.visible = true;
            this.app.coin5.position.set( -0.16, -0.15, -0.9 ); 
            this.app.scene.add( this.app.coin5); 

            this.app.coin6.visible = true;
            this.app.coin6.position.set( 0.16, -0.15, -0.9 ); 
            this.app.scene.add( this.app.coin6); 

            this.app.coin7.visible = true;
            this.app.coin7.position.set( 0.3, -0.15, -0.9 ); 
            this.app.scene.add( this.app.coin7); 

            this.app.scene.add(this.app.ui.mesh);

            
        }

        function onSessionEnd(){
            self.scene.remove(self.head);
            self.scene.remove(self.tail);
            self.scene.remove(self.coin);
            self.scene.remove(self.coin1);
            self.scene.remove(self.coin2);
            self.scene.remove(self.coin3);
            self.scene.remove(self.coin4);
            self.scene.remove(self.coin5);
            self.scene.remove(self.coin6);
            self.scene.remove(self.coin7);
        }


        
        const btn = new ARButton( this.renderer, { onSessionStart, onSessionEnd, sessionInit: { optionalFeatures: [ 'dom-overlay' ], domOverlay: { root: document.body } } } ); 
        const controller = this.renderer.xr.getController( 0 );
        //controller.addEventListener( 'connected', onConnected );
        
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
        this.mixer.update( dt )
        this.mixerT.update( dt )
        if ( this.renderer.xr.isPresenting ) {
            this.ui.update();
            this.uiHead.update();
            this.uiTail.update();
        }
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };