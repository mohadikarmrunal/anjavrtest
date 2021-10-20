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
                self.head.children[0].children[1].visible = false;
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
                self.tail.children[0].children[1].visible = false;
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
        this.createBoxes();


    }


    createUI() {
        
        const self = this;

        //setting up button canvasUI
        const config1 = {
            //panelSize: { width: 0.6, height: 0.3 },
            //height: 256,
            body:{
                textAlign: 'center',
                backgroundColor:'#ccc',
                fontColor:'#000',
                padding:65,
                fontSize:55,
            },
            info:{ type: "text" }
        }

        const content1 = {
            info: "Event"
        }

        const config2 = {
            //panelSize: { width: 0.6, height: 0.3 },
            //height: 256,
            body:{
                textAlign: 'center',
                backgroundColor:'#ccc',
                fontColor:'#000',
                padding:65,
                fontSize:55,
            },
            info:{ type: "text" }
        }

        const content2 = {
            info: "Sample Space"
        }

        const config3 = {
            //panelSize: { width: 0.6, height: 0.3 },
            //height: 256,
            body:{
                textAlign: 'center',
                backgroundColor:'#ccc',
                fontColor:'#000',
                padding:65,
                fontSize:55,
            },
            info:{ type: "text" }
        }

        const content3 = {
            info: "Random Variables"
        }

        const config4 = {
            //panelSize: { width: 0.6, height: 0.3 },
            //height: 256,
            body:{
                textAlign: 'center',
                backgroundColor:'#ccc',
                fontColor:'#000',
                padding:65,
                fontSize:55,
            },
            info:{ type: "text" }
        }

        const content4 = {
            info: "Probability Distribution"
        }

        const ui1 = new CanvasUI(content1, config1);
        this.ui1 = ui1;
        this.ui1.mesh.position.set(0,0.45,-1);
        this.ui1.mesh.material.opacity = 0.3;

        const ui2 = new CanvasUI(content2, config2);
        this.ui2 = ui2;
        this.ui2.mesh.position.set(0,0.45,-2);
        this.ui2.mesh.material.opacity = 0.3;

        const ui3 = new CanvasUI(content3, config3);
        this.ui3 = ui3;
        this.ui3.mesh.position.set(0,0.45,-3);
        this.ui3.mesh.material.opacity = 0.3;  

        const ui4 = new CanvasUI(content4, config4);
        this.ui4 = ui4;
        this.ui4.mesh.position.set(0,0.45,-4);
        this.ui4.mesh.material.opacity = 0.3;
       
    }

    createBoxes(){
        const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
        const geometry3 = new THREE.BoxGeometry( 0.2, 0.4, 0.2 );
        const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        const cube1 = new THREE.Mesh( geometry, material );
        const cube2 = new THREE.Mesh( geometry, material );
        const cube3 = new THREE.Mesh( geometry3, material );
        this.cube1 = cube1;
        this.cube2 = cube2;
        this.cube3 = cube3;
        this.cube1.position.set(-0.25,-0.1,-4);
        this.cube3.position.set(0,0,-4);
        this.cube2.position.set(0.25,-0.1,-4);
       
        /*this.cube1.position.set(0.75,-0.1,-1);
        this.cube2.position.set(1.25,-0.1,-1);
        this.cube3.position.set(1,0,-1);*/
        
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
             if(!self.head.visible){
                
                setTimeout(next1,3000);
                setTimeout(next2,6000);
                setTimeout(next4,9000);
                //setTimeout(next3, 9000);
                //self.scene.add( self.head);  
                //console.log(self.action);  
                //self.action.loop = THREE.LoopOnce;
                //self.action.play();
            }
        }

        function next1 (){
            this.app.cursor.visible = true; 
            this.app.scene.add(this.app.cursor);
            this.app.ui1.mesh.visible = true;
            this.app.scene.add(this.app.ui1.mesh);
            
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
            this.app.scene.remove(self.head);
            this.app.scene.remove(self.tail);
            

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

        function next4(){
            const self = this.app;

            self.ui1.mesh.visible = false;
            self.scene.remove(self.ui1.mesh);
            
            self.tail.visible = false;
            self.scene.remove(self.head);
            self.scene.remove(self.tail);
            self.scene.remove(self.cursor);
            
            //adding the meshes
            self.scene.add(this.app.ui2.mesh);
            self.ui2.mesh.visible = true;
            self.scene.add(this.app.ui3.mesh);
            self.ui3.mesh.visible = true;
            self.scene.add(this.app.ui4.mesh);
            self.ui4.mesh.visible = true;

            //adding coins 
            /*self.coin.visible = true;
            self.coin.position.set( -1.3, 0.15, -1 ); 
            self.scene.add( self.coin); 
            self.coin1.visible = true;
            self.coin1.position.set( -1.16, 0.15, -1 ); 
            self.scene.add( self.coin1); 
            self.coin2.visible = true;
            self.coin2.position.set( -0.84, 0.15, -1 ); 
            self.scene.add( self.coin2); 
            self.coin3.visible = true;
            self.coin3.position.set( -0.7, 0.15, -1 ); 
            self.scene.add( self.coin3); 
            self.coin4.visible = true;
            self.coin4.position.set( -1.3, -0.15, -1 ); 
            self.scene.add( self.coin4); 
            self.coin5.visible = true;
            self.coin5.position.set( -1.16, -0.15, -1 ); 
            self.scene.add( self.coin5); 
            self.coin6.visible = true;
            self.coin6.position.set( -0.84, -0.15, -1 ); 
            self.scene.add( self.coin6); 
            self.coin7.visible = true;
            self.coin7.position.set( -0.7, -0.15, -1 ); 
            self.scene.add( self.coin7); */
            

            //adding coins 
            self.coin.visible = true;
            self.coin.position.set( -0.3, 0.15, -2 ); 
            self.scene.add( self.coin); 
            self.coin1.visible = true;
            self.coin1.position.set( -0.16, 0.15, -2 ); 
            self.scene.add( self.coin1); 
            self.coin2.visible = true;
            self.coin2.position.set( 0.16, 0.15, -2 ); 
            self.scene.add( self.coin2); 
            self.coin3.visible = true;
            self.coin3.position.set( 0.3, 0.15, -2 ); 
            self.scene.add( self.coin3); 
            self.coin4.visible = true;
            self.coin4.position.set( -0.3, -0.15, -2 ); 
            self.scene.add( self.coin4); 
            self.coin5.visible = true;
            self.coin5.position.set( -0.16, -0.15, -2 ); 
            self.scene.add( self.coin5); 
            self.coin6.visible = true;
            self.coin6.position.set( 0.16, -0.15, -2 ); 
            self.scene.add( self.coin6); 
            self.coin7.visible = true;
            self.coin7.position.set( 0.3, -0.15, -2 ); 
            self.scene.add( self.coin7); 
            
            //addingboxes
            self.scene.add(self.cube1);
            self.cube1.visible = true;
            self.scene.add(self.cube2);
            self.cube2.visible = true;
            self.scene.add(self.cube3);
            self.cube3.visible = true;




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
       /* if ( this.renderer.xr.isPresenting ) {
            this.ui.update();
            this.uiHead.update();
            this.uiTail.update();
        }*/
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };