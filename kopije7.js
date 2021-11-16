import * as THREE from '../../libs/three/three.module.js';
import { OrbitControls } from '../../libs/three/jsm/OrbitControls.js';
import { GLTFLoader } from '../../libs/three/jsm/GLTFLoader.js';
import { Stats } from '../../libs/stats.module.js';
import { CanvasUI } from '../../libs/CanvasUI.js'
import { ARButton } from '../../libs/ARButton.js';
//import { FBXLoader } from '../../libs/three/jsm/FBXLoader.js';
import { LoadingBar } from '../../libs/LoadingBar.js';
//import { Player } from '../../libs/Player.js';
//import { ControllerGestures } from '../../libs/ControllerGestures.js';


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
        this.createBoxes();
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

        loader.load(
			// resource URL
			'T.gltf',
			// called when the resource is loaded
			function ( gltf ) {

                self.T3 = gltf.scene;
                self.loadingBar.visible = false;
				const scale = 0.1;
                self.T3.scale.set(scale, scale, scale); 
                
                //console.log(self.coin.children[0]);
                
                self.T4 = self.T3.clone();
                self.T6 = self.T3.clone();
                self.T7 = self.T3.clone();

                //positions
                self.T3.position.set(0.3,0.17,-3.8);
                self.T4.position.set(-0.3,-0.13,-3.8);
                self.T6.position.set(0.16,-0.13,-3.8);
                self.T7.position.set(0.3,-0.13,-3.8);

                //add them to the scene
                self.T3.visible = false; 
                self.T4.visible = false;
                self.T6.visible = false;
                self.T7.visible = false;
                
				
			},
			// called while loading is progressing
			function ( xhr ) {

				self.loadingBar.progress = (xhr.loaded / xhr.total);
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'An error happened with the T for tail' );
			}
        );

        loader.load(
			// resource URL
			'H.gltf',
			// called when the resource is loaded
			function ( gltf ) {

                self.H0 = gltf.scene;
                self.loadingBar.visible = false;
				const scale = 0.1;
                self.H0.scale.set(scale, scale, scale); 
                
                self.H1 = self.H0.clone();
                self.H2 = self.H0.clone();
                self.H5 = self.H0.clone();

                //positions
                self.H0.position.set(-0.3,0.17,-3.8);
                self.H1.position.set(-0.16,0.17,-3.8);
                self.H2.position.set(0.16,0.17,-3.8);
                self.H5.position.set(-0.16,-0.13,-3.8);

                //add them to the scene
                self.H0.visible = false;
                self.H1.visible = false;
                self.H2.visible = false;
                self.H5.visible = false;
               
				
			},
			// called while loading is progressing
			function ( xhr ) {
				self.loadingBar.progress = (xhr.loaded / xhr.total);
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'An error happened with the H for heads' );
			}
        );

        loader.load(
			// resource URL
			'0.gltf',
			// called when the resource is loaded
			function ( gltf ) {

                self.text0 = gltf.scene;
                self.loadingBar.visible = false;
				const scale = 0.1;
                self.text0.scale.set(scale, scale, scale); 
                
                //positions
                self.text0.position.set(-0.35,-0.1,-5.4);
                self.text0.visible = false;	
			},
			// called while loading is progressing
			function ( xhr ) {
				self.loadingBar.progress = (xhr.loaded / xhr.total);
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'An error happened with loading X=0 text' );
			}
        );

        loader.load(
			// resource URL
			'1.gltf',
			// called when the resource is loaded
			function ( gltf ) {

                self.text1 = gltf.scene;
                self.loadingBar.visible = false;
				const scale = 0.1;
                self.text1.scale.set(scale, scale, scale); 
                
                //positions
                self.text1.position.set(-0.1,0.1,-5.4);
                self.text1.visible = false;	
			},
			// called while loading is progressing
			function ( xhr ) {
				self.loadingBar.progress = (xhr.loaded / xhr.total);
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'An error happened with loading X=1 text' );
			}
        );

        loader.load(
			// resource URL
			'2.gltf',
			// called when the resource is loaded
			function ( gltf ) {

                self.text2 = gltf.scene;
                self.loadingBar.visible = false;
				const scale = 0.1;
                self.text2.scale.set(scale, scale, scale); 
                
                //positions
                self.text2.position.set(0.15,-0.1,-5.4);
                self.text2.visible = false;	
			},
			// called while loading is progressing
			function ( xhr ) {
				self.loadingBar.progress = (xhr.loaded / xhr.total);
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'An error happened with loading X=2 text' );
			}
        );

        loader.load(
			// resource URL
			'num0.gltf',
			// called when the resource is loaded
			function ( gltf ) {

                self.num0 = gltf.scene;
                self.loadingBar.visible = false;
				const scale = 0.1;
                self.num0.scale.set(scale, scale, scale); 
                
                //positions
                self.num0.position.set(0.45,0.17,-3.8);
                self.num0.visible = false;	
			},
			// called while loading is progressing
			function ( xhr ) {
				self.loadingBar.progress = (xhr.loaded / xhr.total);
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'An error happened with loading X=0 text' );
			}
        );

        loader.load(
			// resource URL
			'num1.gltf',
			// called when the resource is loaded
			function ( gltf ) {

                self.num1 = gltf.scene;
                self.loadingBar.visible = false;
				const scale = 0.1;
                self. num1.scale.set(scale, scale, scale); 
                
                //positions
                self.num1.position.set(0.45,-0.13,-3.8);
                self.num1.visible = false;	
			},
			// called while loading is progressing
			function ( xhr ) {
				self.loadingBar.progress = (xhr.loaded / xhr.total);
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'An error happened with loading X=0 text' );
			}
        );

        loader.load(
			// resource URL
			'num2.gltf',
			// called when the resource is loaded
			function ( gltf ) {

                self.num2 = gltf.scene;
                self.loadingBar.visible = false;
				const scale = 0.1;
                self.num2.scale.set(scale, scale, scale); 
                
                //positions
                self.num2.position.set(0.45,-0.43,-3.8);
                self.num2.visible = false;	
			},
			// called while loading is progressing
			function ( xhr ) {
				self.loadingBar.progress = (xhr.loaded / xhr.total);
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'An error happened with loading X=0 text' );
			}
        );

        loader.load(
			// resource URL
			'cursor.gltf',
			// called when the resource is loaded
			function ( gltf ) {

                self.cursor = gltf.scene;
                self.loadingBar.visible = false;
                self.cursor.visible = false;
				const scale = 0.04;
				self.cursor.scale.set(scale, scale, scale); 
                self.cursor.rotateX(Math.PI/2);
                self.cursor.position.set (0,-0.7,-1);
                self.cursor1 = self.cursor.clone();
                self.cursor2 = self.cursor.clone();
                self.cursor3 = self.cursor.clone();
			},
			// called while loading is progressing
			function ( xhr ) {

				self.loadingBar.progress = (xhr.loaded / xhr.total);
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'An error happened with loading a cursor' );
			}
        );

        this.createUI();
        
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

        const config2 = {
            //panelSize: { width: 0.6, height: 0.3 },
            //height: 256,
            body:{
                textAlign: 'center',
                backgroundColor:'#ccc',
                fontColor:'#000',
                padding:50,
                fontSize:45,
            },
            info:{ type: "text", fontFamily: 'Verdana' }
        }

        const content2 = {
            info: "SAMPLE SPACE"
        }

        const config3 = {
            //panelSize: { width: 0.6, height: 0.3 },
            //height: 256,
            body:{
                textAlign: 'center',
                backgroundColor:'#ccc',
                fontColor:'#000',
                padding:50,
                fontSize:45,
            },
            info:{ type: "text", fontFamily: 'Verdana'}
        }

        const content3 = {
            info: "RANDOM VARIABLE"
        }

        const config4 = {
            //panelSize: { width: 0.6, height: 0.3 },
            //height: 256,
            body:{
                textAlign: 'center',
                backgroundColor:'#ccc',
                fontColor:'#000',
                padding:50,
                fontSize:45,
            },
            info:{ type: "text", fontFamily: 'Verdana', width: 512 }
        }

        const content4 = {
            info: "PROBABILITY DISTRIBUTION"
        }

        const ui1 = new CanvasUI(content1, config1);
        this.ui1 = ui1;
        this.ui1.mesh.position.set(0,0.4,-1.1);
        this.ui1.mesh.material.opacity = 0.3;
        this.ui1.mesh.material.transparent = true;

        const ui2 = new CanvasUI(content2, config2);
        this.ui2 = ui2;
        this.ui2.mesh.position.set(0,0,-2.6);
        this.ui2.mesh.material.opacity = 0.3;
        this.ui2.mesh.material.transparent = true;

        const ui3 = new CanvasUI(content3, config3);
        this.ui3 = ui3;
        this.ui3.mesh.position.set(0,0,-4.1);
        this.ui3.mesh.material.opacity = 0.3; 
        this.ui3.mesh.material.transparent = true;
 
        const ui4 = new CanvasUI(content4, config4);
        this.ui4 = ui4;
        this.ui4.mesh.position.set(0,0,-5.6);
        this.ui4.mesh.material.opacity = 0.3;
        this.ui4.mesh.material.transparent = true;

        //button for the question #3
        function buttonq3f(){
            const msg = "False answer!";
            console.log(msg);
            self.uiq3.updateElement( "info", msg );
        }
        function buttonq3ff(){
            const msg = "False answer!";
            console.log(msg);
            self.uiq3.updateElement( "info", msg );
        }
        function buttonq3t(){
            //remove the forth canvas
            self.ui4.mesh.visible = false;
            self.scene.remove(self.ui4.mesh);

            //remove the canvas for the third question
            self.uiq3.mesh.visible = false;
            self.scene.remove(self.uiq3.mesh);

            //reset the probability distribution cuboids
            self.cube1.visible = false;
            self.cube2.visible = false;
            self.cube3.visible = false;
            self.scene.remove(self.cube1);
            self.scene.remove(self.cube2);
            self.scene.remove(self.cube3);

            //remove the text
            self.text0.visible = false;
            self.text1.visible = false;
            self.text2.visible = false;
            self.scene.remove(self.text0);
            self.scene.remove(self.text1);
            self.scene.remove(self.text2);


            //add a congrats sign in the future
        }
        const configq3 = {
            panelSize: { height: 0.2 },
            height: 102.4,
            info: { type: "text", fontFamily: 'Verdana', position:{ left: 6, top: 6 }, textAlign: 'center', width: 500, height: 42.4, backgroundColor: "#fff", fontColor: "#000", fontSize: 17, fontStyle: 'Arial'},
            //button1: { type: "button", position:{ top: 64, left: 0 }, width: 64, fontColor: "#bb0", hover: "#026", onSelect: button1 },
            button1: { type: "button", fontFamily: 'Verdana', position:{ top: 54.4, left: 6 }, width: 160, height: 42, padding:17, fontColor: "#fff", backgroundColor: "#049", hover: "#4c5ba6", onSelect: buttonq3f },
            button2: { type: "button", fontFamily: 'Verdana', position:{ top: 54.4, left: 176 }, width: 160, height: 42, padding:17, fontColor: "#fff", backgroundColor: "#049", hover: "#4c5ba6", onSelect: buttonq3t },
            button3: { type: "button", fontFamily: 'Verdana', position:{ top: 54.4, left: 346 }, width: 160, height: 42, padding:17, fontColor: "#fff", backgroundColor: "#049", hover: "#4c5ba6", onSelect: buttonq3ff },
            renderer: this.renderer
        }
        const contentq3 = {
            info: "What is the probability that X \u2264 1?",
            button1: "\u00BD",
            button2: "\u00BE",
            button3: "\u00BC",
           
        } 
        const uiq3 = new CanvasUI(contentq3,configq3);
        this.uiq3 = uiq3;
        this.uiq3.mesh.position.set(0,-0.7,-5.6);
        this.uiq3.mesh.visible = false;

        //button for the sound #3 connected to canvas #4
        function button3next(){
            console.log('It is time for the third question on the forth canvas!');
            const self = this.app;

            //add the mesh for the third question
            self.uiq3.mesh.visible = true;
            self.scene.add(self.uiq3.mesh); 
        }
        function button3(){
            //we need to play the sound here as well
            console.log('Button for the third sound on the forth canvas was pressed');

            // hide the pressed button for the sound
            self.uib3.mesh.visible = false;
            self.scene.remove(self.uib3.mesh);

            //allow time for the voice over and then display the question
            setTimeout(button3next,3000);
        }
        const configb3 = {
            panelSize: { height: 0.1, width: 0.1},
            height: 512,
            body: {backgroundColor: '#049'},
            buttonb3: { type: "button", position:{ top: 100, left: 50 }, fontColor: "#fff", fontSize:100, hover:"#4c5ba6", onSelect: button3 },
            renderer: this.renderer
        }
        const contentb3 = {
            buttonb3: "<path> M 153.6 72.2 L 153.6 72.2 M 153.6 72.2 L 153.6 72.2 L 72 72.2 L 72 240.2 L 153.6 240.2 L 241 291 L 241 13 M 299.2 112.2 C 359.2 127.4 368.8 193 299.2 217 Z </path>",
        }
        const uib3 = new CanvasUI( contentb3, configb3 );
        this.uib3 = uib3;
        this.uib3.mesh.position.set(0.7,0.4,-5.6);
        this.uib3.mesh.visible = false;
        this.uib3.mesh.scale.set(2,2,2);


        //button for the question #2
        function buttonq2f(){
            const msg = "False answer!";
            console.log(msg);
            self.uiq2.updateElement( "info", msg );
        }
        function buttonq2ff(){
            const msg = "False answer!";
            console.log(msg);
            self.uiq2.updateElement( "info", msg );
        }
        function buttonq2t(){
            //remove the third canvas
            self.ui3.mesh.visible = false;
            self.scene.remove(self.ui3.mesh);

            //remove the canvas of the second question
            self.uiq2.mesh.visible = false;
            self.scene.remove(self.uiq2.mesh);

            //return the coins in the right position then delete them from the scene
            self.coin.position.set( -0.3, 0.15, -2.3 ); 
            self.coin1.position.set( -0.16, 0.15, -2.3 ); 
            self.coin2.position.set( 0.16, 0.15, -2.3 ); 
            self.coin3.position.set( 0.3, 0.15, -2.3 ); 
            self.coin4.position.set( -0.3, -0.15, -2.3 ); 
            self.coin5.position.set( -0.16, -0.15, -2.3 ); 
            self.coin6.position.set( 0.16, -0.15, -2.3 ); 
            self.coin7.position.set( 0.3, -0.15, -2.3 ); 
            //rotate them down
            self.coin.children[0].rotateX(-Math.PI/2);
            self.coin1.children[0].rotateX(-Math.PI/2);
            self.coin2.children[0].rotateX(-Math.PI/2);
            self.coin3.children[0].rotateX(-Math.PI/2);
            self.coin4.children[0].rotateX(-Math.PI/2);
            self.coin5.children[0].rotateX(-Math.PI/2);
            self.coin6.children[0].rotateX(-Math.PI/2);
            self.coin7.children[0].rotateX(-Math.PI/2);
            self.coin.visible = false;
            self.coin1.visible = false;
            self.coin2.visible = false;
            self.coin3.visible = false;
            self.coin4.visible = false;
            self.coin5.visible = false;
            self.coin6.visible = false;
            self.coin7.visible = false;
            self.scene.remove(self.coin);
            self.scene.remove(self.coin1);
            self.scene.remove(self.coin2);
            self.scene.remove(self.coin3);
            self.scene.remove(self.coin4);
            self.scene.remove(self.coin5);
            self.scene.remove(self.coin6);
            self.scene.remove(self.coin7);
            //remove letters
            self.scene.remove(self.H0);
            self.scene.remove(self.H1);
            self.scene.remove(self.H2);
            self.scene.remove(self.T3);
            self.scene.remove(self.T4);
            self.scene.remove(self.H5);
           

            //display the forth and final canvas
            self.ui4.mesh.visible = true;
            self.scene.add(self.ui4.mesh);

            //display the probability distribution cuboids
            self.cube1.visible = true;
            self.cube2.visible = true;
            self.cube3.visible = true;
            self.scene.add(self.cube1);
            self.scene.add(self.cube2);
            self.scene.add(self.cube3);

            self.text0.visible = true;
            self.text1.visible = true;
            self.text2.visible = true;
            self.scene.add(self.text0);
            self.scene.add(self.text1);
            self.scene.add(self.text2);




            //display the button for the sound
            self.uib3.mesh.visible = true;
            self.scene.add(self.uib3.mesh);   
        }
        const configq2 = {
            panelSize: { height: 0.3 },
            height: 153.6,
            info: { type: "text", fontFamily: 'Verdana', position:{ left: 6, top: 7.2 }, textAlign: 'center', width: 500, height: 92.4, backgroundColor: "#fff", fontColor: "#000", fontSize: 17, fontStyle: 'Arial',padding: 30},
            //button1: { type: "button", position:{ top: 64, left: 0 }, width: 64, fontColor: "#bb0", hover: "#026", onSelect: button1 },
            buttonq21: { type: "button", fontFamily: 'Verdana', position:{ top: 104.4, left: 6 }, width: 160, height: 42, padding:17, fontColor: "#fff", backgroundColor: "#049", hover: "#4c5ba6", onSelect: buttonq2f },
            buttonq22: { type: "button", fontFamily: 'Verdana', position:{ top: 104.4, left: 176 }, width: 160, height: 42, padding:17, fontColor: "#fff", backgroundColor: "#049", hover: "#4c5ba6", onSelect: buttonq2ff },
            buttonq23: { type: "button", fontFamily: 'Verdana', position:{ top: 104.4, left: 346 }, width: 160, height: 42, padding:17, fontColor: "#fff", backgroundColor: "#049", hover: "#4c5ba6", onSelect: buttonq2t },
            renderer: this.renderer
        }
        const contentq2 = {
            info: "What is the value of random variable X that corresponds to the shown event?",
            buttonq21: "X<1",
            buttonq22: "X=1",
            buttonq23: "X \u2264 1",
        } 
        const uiq2 = new CanvasUI(contentq2,configq2);
        this.uiq2 = uiq2;
        this.uiq2.mesh.position.set(0,-0.7,-4.1);
        this.uiq2.mesh.visible = false;

       //button for the sound #2 for the canvas #3
        function button2next(){

            console.log('It is time for the second question on the third canvas!');
            const self = this.app;

            self.counting(0,1);
            self.coin.visible = true;
            self.coin1.visible = true;

            //coin visibility
            self.T6.visible = false;
            self.T7.visible = false;
            self.scene.remove(self.T6);
            self.scene.remove(self.T7);

            //remove the spheres
            self.sphere1.visible = false;
            self.scene.remove(self.sphere1);
            self.sphere2.visible = false;
            self.scene.remove(self.sphere2);
            self.sphere3.visible = false;
            self.scene.remove(self.sphere3);

            //remove numbers
            self.num0.visible = false;
            self.scene.remove(self.num0);
            self.num1.visible = false;
            self.scene.remove(self.num1);
            self.num2.visible = false;
            self.scene.remove(self.num2);

            //add the mesh for the second question
            self.uiq2.mesh.visible = true;
            self.scene.add(self.uiq2.mesh);
        }
        function button2(){
            //we need to play the sound here as well
            console.log('Button for the second sound on the third canvas was pressed!');

            // hide the pressed button for the sound
            self.uib2.mesh.visible = false;
            self.scene.remove(self.uib2.mesh);

            //allow time for the voice over and then display the question
            setTimeout(button2next,3000);
        }

        const configb2 = {
            panelSize: { height: 0.1, width: 0.1},
            height: 512,
            body: {backgroundColor: '#049',fontFamily: 'Verdana'},
            buttonb2: { type: "button", fontFamily: 'Verdana', position:{ top: 100, left: 50 }, fontColor: "#fff", fontSize:100, hover: "#4c5ba6", onSelect: button2 },
            renderer: this.renderer
        }
        const contentb2 = {
            buttonb2: "<path> M 153.6 72.2 L 153.6 72.2 M 153.6 72.2 L 153.6 72.2 L 72 72.2 L 72 240.2 L 153.6 240.2 L 241 291 L 241 13 M 299.2 112.2 C 359.2 127.4 368.8 193 299.2 217 Z </path>",
        }
        const uib2 = new CanvasUI( contentb2, configb2 );
        this.uib2 = uib2;
        this.uib2.mesh.position.set(0.7,0.4,-4.1);
        this.uib2.mesh.visible = false;
        this.uib2.mesh.scale.set(2,2,2);


        //button for question #1
        function buttonq1f(){
            const msg = "False answer!";
            console.log(msg);
            self.uiq1.updateElement( "info", msg );
        }
        function buttonq1t(){
            //remove the question mesh
            self.uiq1.mesh.visible = false;
            self.scene.remove(self.uiq1.mesh);
            
            //remove the second canvases
            self.ui2.mesh.visible = false;
            self.scene.remove(self.ui2.mesh);

            //display the third canvas
            self.ui3.mesh.visible = true;
            self.scene.add(self.ui3.mesh);

            //move the coins to a different position;
            self.coin.position.set( -0.45, 0.15, -3.8 ); 
            self.coin1.position.set( -0.31, 0.15, -3.8 ); 

            self.coin2.position.set( -0.45, -0.15, -3.8 ); 
            self.coin3.position.set(-0.31, -0.15, -3.8 ); 
            self.coin4.position.set( -0.06, -0.15, -3.8 ); 
            self.coin5.position.set( 0.08, -0.15, -3.8 ); 

            self.coin6.position.set( -0.45, -0.45, -3.8 ); 
            self.coin7.position.set( -0.31, -0.45, -3.8 ); 
            //rotate them
            self.coin.children[0].rotateX(Math.PI/2);
            self.coin1.children[0].rotateX(Math.PI/2);
            self.coin2.children[0].rotateX(Math.PI/2);
            self.coin3.children[0].rotateX(Math.PI/2);
            self.coin4.children[0].rotateX(Math.PI/2);
            self.coin5.children[0].rotateX(Math.PI/2);
            self.coin6.children[0].rotateX(Math.PI/2);
            self.coin7.children[0].rotateX(Math.PI/2);

            //display letters
            self.H0.position.set(-0.45,0.17,-3.8);
            self.H1.position.set(-0.31,0.17,-3.8);
            self.H2.position.set(-0.45,-0.13,-3.8);
            self.T3.position.set(-0.36,-0.13,-3.8);
            self.T4.position.set(-0.06,-0.13,-3.8);
            self.H5.position.set(0.08,-0.13,-3.8);
            self.T6.position.set(-0.45,-0.43,-3.8);
            self.T7.position.set(-0.36,-0.43,-3.8);


            self.H0.visible = true;
            self.scene.add(self.H0);
            self.H1.visible = true;
            self.scene.add(self.H1);
            self.H2.visible = true;
            self.scene.add(self.H2);
            self.T3.visible = true;
            self.scene.add(self.T3);
            self.T4.visible = true;
            self.scene.add(self.T4);
            self.H5.visible = true;
            self.scene.add(self.H5);
            self.T6.visible = true;
            self.scene.add(self.T6);
            self.T7.visible = true;
            self.scene.add(self.T7);

            //add the shapes for the events
            self.sphere1.visible = true;
            self.scene.add(self.sphere1);
            self.sphere2.visible = true;
            self.scene.add(self.sphere2);
            self.sphere3.visible = true;
            self.scene.add(self.sphere3);

            //add numbers
            self.num0.visible = true;
            self.scene.add(self.num0);
            self.num1.visible = true;
            self.scene.add(self.num1);
            self.num2.visible = true;
            self.scene.add(self.num2);


            //display the button for the sound
            self.uib2.mesh.visible = true;
            self.scene.add(self.uib2.mesh);
        }

        const configq1 = {
            panelSize: { height: 0.3 },
            height: 153.6,
            info: { type: "text", fontFamily: 'Verdana', position:{ left: 6, top: 7.2 }, textAlign: 'center', width: 500, height: 92.4, backgroundColor: "#fff", fontColor: "#000", fontSize: 17, fontStyle: 'Arial', padding: 30},
            //button1: { type: "button", position:{ top: 64, left: 0 }, width: 64, fontColor: "#bb0", hover: "#026", onSelect: button1 },
            buttonq1t: { type: "button", fontFamily: 'Verdana', position:{ top: 104.4, left: 6 }, width: 245, height: 42, padding:17, fontColor: "#fff", backgroundColor: "#049", hover: "#4c5ba6", onSelect: buttonq1t },
            buttonq1f: { type: "button", fontFamily: 'Verdana', position:{ top: 104.4, left: 261 }, width: 245, height: 42, padding:17, fontColor: "#fff", backgroundColor: "#049", hover: "#4c5ba6", onSelect: buttonq1f },
            renderer: this.renderer
        }
        const contentq1 = {
            info: " Is the displayed set domain or codomain of the random variable?",
            buttonq1t: "DOMAIN",
            buttonq1f: "CODOMAIN",
           
        } 
        const uiq1 = new CanvasUI( contentq1, configq1 );
        this.uiq1 = uiq1;
        this.uiq1.mesh.position.set(0,-0.7,-2.6);
        this.uiq1.mesh.visibile = false;

        //button for sound #1 for the canvas #2
        function button1next(){
            console.log('It is time for the first question of the day');
            const self = this.app;
            //self.ui2.mesh.visible = true;
            self.uiq1.mesh.visible = true;
            self.scene.add(self.uiq1.mesh);
        }
        function button1(){
            //we need to play the sound here as well
            console.log('Button for the first sound on the second canvas was pressed');

            // testni komand self.ui2.mesh.visible = false;
            self.uib1.mesh.visible = false;
            self.scene.remove(self.uib1.mesh);

            //delay for the question
            setTimeout(button1next,3000);
        }
        const configb1 = {
            panelSize: { height: 0.1, width: 0.1},
            height: 512,
            body: {backgroundColor: '#049'},
            buttonb1: { type: "button", position:{ top: 100, left: 50 }, fontColor: "#fff", fontSize:100, hover: "#4c5ba6", onSelect: button1 },
            renderer: this.renderer
        }
        const contentb1 = {
            buttonb1: "<path> M 153.6 72.2 L 153.6 72.2 M 153.6 72.2 L 153.6 72.2 L 72 72.2 L 72 240.2 L 153.6 240.2 L 241 291 L 241 13 M 299.2 112.2 C 359.2 127.4 368.8 193 299.2 217 Z </path>",
        }

        const uib1 = new CanvasUI( contentb1, configb1 );
        this.uib1 = uib1;
        this.uib1.mesh.position.set(0.7,0.4,-2.6);
        this.uib1.mesh.visible = false; 
        this.uib1.mesh.scale.set(2,2,2);
    }


    createBoxes(){

        const self = this;
        const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
        const geometry3 = new THREE.BoxGeometry( 0.2, 0.4, 0.2 );
        const material = new THREE.MeshNormalMaterial( {color: 0xe268f} );
        const cube1 = new THREE.Mesh( geometry, material );
        const cube2 = new THREE.Mesh( geometry, material );
        const cube3 = new THREE.Mesh( geometry3, material );
        this.cube1 = cube1;
        this.cube2 = cube2;
        this.cube3 = cube3;
        this.cube1.position.set(-0.25,-0.2,-5.4);
        this.cube3.position.set(0,-0.1,-5.4);
        this.cube2.position.set(0.25,-0.2,-5.4);

        //sphere
        const geometrys = new THREE.CylinderGeometry( 0.03, 0.03, 0.56, 32 );
        const geometrys2 = new THREE.CylinderGeometry( 0.03, 0.03, 0.17, 32 );
        const material1 = new THREE.MeshBasicMaterial ({color: 0xffff00});
        const material2 = new THREE.MeshBasicMaterial ({color: 0x1fad10});
        const material3 = new THREE.MeshBasicMaterial ({color: 0x2b1596});

        const sphere1 = new THREE.Mesh(geometrys,material1);
        this.sphere1 = sphere1;
        this.sphere1.rotateZ(Math.PI/2);
        this.sphere1.visible = false;
        this.sphere1.material.opacity = 0.8;
   
        //short cylinder
        const sphere2 = new THREE.Mesh(geometrys2,material2);
        this.sphere2 = sphere2;
        this.sphere2.visible = false;
        this.sphere2.rotateZ(Math.PI/2);
        this.sphere2.material.opacity = 0.8;
        this.sphere2.material.transparent = true;

        //third cylinder
        const sphere3 = new THREE.Mesh(geometrys,material3);
        this.sphere3 = sphere3;
        this.sphere3.rotateZ(Math.PI/2);
        this.sphere3.visible = false;
        this.sphere3.material.opacity = 0.8;

        this.sphere1.position.set(0.12,0.19,-3.8);
        this.sphere2.position.set(0.315,-0.11,-3.8);
        this.sphere3.position.set(0.12,-0.41, -3.8);
       /* function onCubeTap(event){
            if (event.target == self.cube1) {
                console.log("you have pressed on the cube");
            }
        }

        const domEvents = new THREEx.DomEvents(this.camera, this.renderer.domElement);
        domEvents.addEventListener(this.cube1, 'tap', onCubeTap, false);*/
        
    }

    counting(x,y){
        const self = this;
        //x = 0 or 1, where 0 is head, tail is 1
            if (x)
            {
                if (y==0)   {
                    self.coin.visible = true;
                    self.coin1.visible = true;
                    self.coin2.visible = false;
                    self.coin3.visible = false;
                    self.coin4.visible = false;
                    self.coin5.visible = false;
                    self.coin6.visible = false;
                    self.coin7.visible = false;
                }
                
                if (y==1)  {
                    self.coin.visible = false;
                    self.coin1.visible = false;
                    self.coin2.visible = true;
                    self.coin3.visible = true;
                    self.coin4.visible = true;
                    self.coin5.visible = true;
                    self.coin6.visible = false;
                    self.coin7.visible = false;
                }

                if (y==2)  {
                    self.coin.visible = false;
                    self.coin1.visible = false;
                    self.coin2.visible = false;
                    self.coin3.visible = false;
                    self.coin4.visible = false;
                    self.coin5.visible = false;
                    self.coin6.visible = true;
                    self.coin7.visible = true;
                }


            }
            else {  
                
                if (y==0)   {
                    self.coin.visible = false;
                    self.coin1.visible = false;
                    self.coin2.visible = false;
                    self.coin3.visible = false;
                    self.coin4.visible = false;
                    self.coin5.visible = false;
                    self.coin6.visible = true;
                    self.coin7.visible = true;
                }
                
                if (y==1)  {
                    self.coin.visible = false;
                    self.coin1.visible = false;
                    self.coin2.visible = true;
                    self.coin3.visible = true;
                    self.coin4.visible = true;
                    self.coin5.visible = true;
                    self.coin6.visible = false;
                    self.coin7.visible = false;
                }

                if (y==2)  {
                    self.coin.visible = true;
                    self.coin1.visible = true;
                    self.coin2.visible = false;
                    self.coin3.visible = false;
                    self.coin4.visible = false;
                    self.coin5.visible = false;
                    self.coin6.visible = false;
                    self.coin7.visible = false;
                }

            }
    }
    

    setupVR(){
        
        this.renderer.xr.enabled = true;   
        const self = this;
        

        function onSessionStart(){

            //play the sound

             if(!self.head.visible){

                //kad krene que za animaciju ide prvi setTimeout
                setTimeout(next1,2000);
                //da bi se desila animacija trebam i drugi setTimeout
                setTimeout(next2,4000);
                //trebam i treci setTimeout da bih ukinula sve 
                setTimeout(next3,6000);

            }
        }

        function next1 (){
            const self = this.app;

            self.cursor.visible = true; 
            self.scene.add(self.cursor);

            self.ui1.mesh.visible = true;
            self.scene.add(self.ui1.mesh);
            
            self.head.visible = true;
            self.scene.add(self.head);
            self.action.play();
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
            const self = this.app;
            //removing the coins and the cursor
            self.tail.visible = false;
            self.scene.remove(self.head);
            self.scene.remove(self.tail);
            self.ui1.mesh.visible = false;
            self.scene.remove(self.ui1.mesh);
            self.scene.remove(self.cursor);

            //adding the second canvas
            self.ui2.mesh.visible = true;
            self.scene.add(self.ui2.mesh);


            //adding coins 
            self.coin.visible = true;
            self.coin.position.set( -0.3, 0.15, -2.3 ); 
            self.scene.add( self.coin); 
            self.coin1.visible = true;
            self.coin1.position.set( -0.16, 0.15, -2.3 ); 
            self.scene.add( self.coin1); 
            self.coin2.visible = true;
            self.coin2.position.set( 0.16, 0.15, -2.3 ); 
            self.scene.add( self.coin2); 
            self.coin3.visible = true;
            self.coin3.position.set( 0.3, 0.15, -2.3 ); 
            self.scene.add( self.coin3); 
            self.coin4.visible = true;
            self.coin4.position.set( -0.3, -0.15, -2.3 ); 
            self.scene.add( self.coin4); 
            self.coin5.visible = true;
            self.coin5.position.set( -0.16, -0.15, -2.3 ); 
            self.scene.add( self.coin5); 
            self.coin6.visible = true;
            self.coin6.position.set( 0.16, -0.15, -2.3); 
            self.scene.add( self.coin6); 
            self.coin7.visible = true;
            self.coin7.position.set( 0.3, -0.15, -2.3 ); 
            self.scene.add( self.coin7); 
           
            //adding a button for the sound
            self.uib1.mesh.visible = true;
            self.scene.add(self.uib1.mesh);
            

           
            
        }


        function onSessionEnd(){
            self.scene.remove(self.coin);
            self.scene.remove(self.coin1);
            self.scene.remove(self.coin2);
            self.scene.remove(self.coin3);
            self.scene.remove(self.coin4);
            self.scene.remove(self.coin5);
            self.scene.remove(self.coin6);
            self.scene.remove(self.coin7);
            self.scene.remove(self.ui2.mesh);
            self.scene.remove(self.ui3.mesh);
            self.scene.remove(self.ui4.mesh);
            self.scene.remove(self.T3);
            self.scene.remove(self.T4);
            self.scene.remove(self.T6);
            self.scene.remove(self.T7);
        }


        
        const btn = new ARButton( this.renderer, { onSessionStart, onSessionEnd, sessionInit: { optionalFeatures: [ 'dom-overlay' ], domOverlay: { root: document.body } } } ); 
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
            this.uib1.update();
            this.uib2.update();
            this.uib3.update();
            this.uiq1.update();
            this.uiq2.update();
            this.uiq3.update();
            this.mixer.update( dt ) 
            this.mixerT.update( dt )
        }

        if(this.T3!=undefined && this.H0!=undefined){
        this.T3.children[0].rotateY(0.05);
        this.T4.children[0].rotateY(0.05);
        this.T6.children[0].rotateY(0.05);
        this.T7.children[0].rotateY(0.05);
        this.H0.children[0].rotateY(0.05);
        this.H1.children[0].rotateY(0.05);
        this.H2.children[0].rotateY(0.05);
        this.H5.children[0].rotateY(0.05);
    }
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };