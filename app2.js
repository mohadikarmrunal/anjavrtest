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
//demand curve 
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
        console.log(this);
        this.loadingBar = new LoadingBar();
        
        this.assetsPath = '../../assets/';
        const loader = new GLTFLoader().setPath(this.assetsPath);
		const self = this;

        loader.load(
			// resource URL
			'chair1.glb',
			// called when the resource is loaded
			function ( gltf ) {

                self.apple = gltf.scene;
                self.loadingBar.visible = false;
                self.apple.visible=false;
				const scale = 0.03;
				self.apple.scale.set(scale, scale, scale); 
			},
			// called while loading is progressing
			function ( xhr ) {

				self.loadingBar.progress = (xhr.loaded / xhr.total);
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'An error happened lol' );
			}
        );

        this.createUI();

    }

    createUI() {
        
        const config1 = {
            panelSize: { width: 0.1, height: 0.038 },
            height: 194,
            body:{
                textAlign: 'center',
                backgroundColor:'#ccc',
                fontColor:'#000',
                padding:40,
                fontSize:50,
            },
            info:{ type: "text" }
        }
        const content1 = {
            info: "Price: 1.90e/kg"
        }   

        const content2 = {
            info: "Sold: 90 kg"
        }

        const config = {
            body:{ 
                textAlign: 'center',
                backgroundColor: '#fff', 
                fontColor:'#000', 
                borderRadius: 6,
                padding:50,
                fontSize:50,
            },
            info:{ type: "text" }
            }
        const content = {
                info: ""
        }
        const ui = new CanvasUI( content, config );
        const ui1 = new CanvasUI( content1, config1 );
        const ui2 = new CanvasUI( content2, config1 );
        this.ui = ui;
        this.ui1 = ui1;
        this.ui2 = ui2;
       
    }
       
    setupVR(){
        this.renderer.xr.enabled = true; 
        
        const self = this;
        //let controller;
    
        //draw and label x and y axis
        const a = this.ui.config.width;
        const b = this.ui.config.height;
        const c = 60;
        //increments on x and y axis
        const incx = (a-2*c)/ 15.3;
        const incy = (b-2*c)/ 4.6;

        function onSessionStart(){
            //podesavanje mesa novog
            self.ui.context.lineJoin = "round";  
		    self.ui.context.strokeStyle = "black"; 
		    self.ui.context.font = "20px Arial";
		    self.ui.mesh.position.set(0,0,-2);
		    self.ui.needsUpdate = true;
            //pozicioniranje mesheva starog
            self.ui1.mesh.position.set(0.1, 0.03, -0.3);
            self.ui2.mesh.position.set(-0.1, 0.03, -0.3);
            self.scene.add(self.ui1.mesh);
            self.scene.add(self.ui2.mesh);
            self.scene.add(self.ui.mesh);
            
            //console.log("values of width and height"+ a + b);
            //x i y osa sa oznakama
            self.ui.context.beginPath();
            self.ui.context.moveTo(c,c);
            self.ui.context.lineTo(c,b-c);
            self.ui.context.lineTo(a-c,b-c);
            self.ui.context.stroke();
            self.ui.context.fillText("quantity", a/2,b-c/4);
            self.ui.context.save();
            self.ui.context.rotate(-Math.PI/2);
            self.ui.context.fillText("price", -2*b/3 , 2*c/3);
            self.ui.context.restore();

            if(!self.apple.visible){
                self.apple.visible=true;
                self.apple.position.set( 0.1, -0.2, -0.7 ); 
                self.scene.add( self.apple); 
            }

            setTimeout(next1,3000);
            setTimeout(next2,6000);
            setTimeout(next3,9000);
            
        }

        function next1(){
    
            //update grafa
            this.app.ui.context.beginPath();
			this.app.ui.context.moveTo(a-c,b-c);
			this.app.ui.context.lineTo(9*incx,2.7*incy);
			this.app.ui.context.stroke();
			this.app.ui.context.fillRect(9*incx,2.7*incy,7,7);
			//dashed vertical line with the label of quantity
			this.app.ui.context.beginPath();
			this.app.ui.context.setLineDash([5, 15]);
			this.app.ui.context.moveTo(9*incx,2.7*incy);
			this.app.ui.context.lineTo(9*incx,b-c);
			this.app.ui.context.stroke();
			this.app.ui.context.font = "15px Arial";
			this.app.ui.context.fillText("90", 9*incx, b-2*c/3);
			//dashed horizontal line with the label of price
			this.app.ui.context.beginPath();
			this.app.ui.context.setLineDash([5, 12]);
			this.app.ui.context.moveTo(9*incx,2.7*incy);
			this.app.ui.context.lineTo(c,2.7*incy);
			this.app.ui.context.stroke();
			this.app.ui.context.fillText("1.9", c/3, 2.7*incy);
			this.app.ui.context.restore();
			this.app.ui.needsUpdate = true;
			this.app.ui.texture.needsUpdate = true;
			console.log('prvi timeout gotov');
        }

        function next2(){
            //update cijene i potraznje
            console.log(this);
            this.app.ui1.updateElement('info', 'Price: 2.8e/kg');
            this.app.ui2.updateElement('info', 'Sold: 60'); 
            this.app.ui1.update();
            this.app.ui2.update();  

            //second line
			this.app.ui.context.beginPath();
			this.app.ui.context.moveTo(9*incx,2.7*incy);
			this.app.ui.context.lineTo(6*incx,1.8*incy);
			this.app.ui.context.stroke();
			this.app.ui.context.fillRect(6*incx,1.8*incy,7,7);
			this.app.ui.context.save();
			//dashed vertical line with the label of quantity
			this.app.ui.context.beginPath();
			this.app.ui.context.setLineDash([5, 15]);
			this.app.ui.context.moveTo(6*incx,1.8*incy);
			this.app.ui.context.lineTo(6*incx,b-c);
			this.app.ui.context.stroke();
			this.app.ui.context.font = "15px Arial";
			this.app.ui.context.fillText("60", 6*incx, b-2*c/3);
			//dashed horizontal line with the label of price
			this.app.ui.context.beginPath();
			this.app.ui.context.setLineDash([5, 15]);
			this.app.ui.context.moveTo(6*incx,1.8*incy);
			this.app.ui.context.lineTo(c,1.8*incy);
			this.app.ui.context.stroke();
			this.app.ui.context.fillText("2.8", c/3 , 1.8*incy );
			this.app.ui.context.restore();
			this.app.ui.needsUpdate = true;
			this.app.ui.texture.needsUpdate = true;
			console.log('drugi timeout gotov');
        }

        function next3(){
            //update cijene i potraznje
            console.log(this);
            this.app.ui1.updateElement('info', 'Price: 3.7e/kg');
            this.app.ui2.updateElement('info', 'Sold: 30'); 
            this.app.ui1.update();
            this.app.ui2.update();  

            //third line
            this.app.ui.context.beginPath();
            this.app.ui.context.moveTo(6*incx,1.8*incy);
            this.app.ui.context.lineTo(3*incx,0.9*incy);
            this.app.ui.context.stroke();
            this.app.ui.context.fillRect(3*incx,0.9*incy,7,7);
            this.app.ui.context.save();
            //dashed vertical line with the label of quantity
            this.app.ui.context.beginPath();
            this.app.ui.context.setLineDash([5, 15]);
            this.app.ui.context.moveTo(3*incx,0.9*incy);
            this.app.ui.context.lineTo(3*incx,b-c);
            this.app.ui.context.stroke();
            this.app.ui.context.font = "15px Arial";
            this.app.ui.context.fillText("30", 3*incx, b-2*c/3);
            //dashed horizontal line with the label of price
            this.app.ui.context.beginPath();
            this.app.ui.context.setLineDash([5, 15]);
            this.app.ui.context.moveTo(3*incx,0.9*incy);
            this.app.ui.context.lineTo(c,0.9*incy);
            this.app.ui.context.stroke();
            this.app.ui.context.fillText("3.7", c/3 , 0.9*incy );
            this.app.ui.context.restore();
            this.app.ui.context.beginPath();
            this.app.ui.context.moveTo(3*incx,0.9*incy);
            this.app.ui.context.lineTo(c,c);
            this.app.ui.context.stroke();
            this.app.ui.needsUpdate = true;
            this.app.ui.texture.needsUpdate = true;
            console.log('treci timeout gotov');
            
        }

        function next4(){
            //filling the area
			this.app.ui.context.beginPath();
			this.app.ui.context.moveTo(a-c,b-c);
			this.app.ui.context.lineTo(c,c);
			this.app.ui.context.lineTo(c,b-c);
			this.app.ui.context.lineTo(a-c,b-c);
			this.app.ui.context.fill();
			this.app.ui.needsUpdate = true;
			this.app.ui.texture.needsUpdate = true;
			console.log('cetvrti timeout gotov');
        }

        const btn = new ARButton( this.renderer, {onSessionStart});
        
        //const btn = new ARButton( this.renderer, { onSessionStart, onSessionEnd, sessionInit: { optionalFeatures: [ 'dom-overlay' ], domOverlay: { root: document.body } } } ); 

        //this.gestures = new ControllerGestures( this.renderer );

        /*this.gestures.addEventListener( 'tap', (ev)=>{
            console.log( 'tap' ); 
            if (!self.apple.visible){
                self.apple.visible = true;
                self.apple.position.set( 0, -0.3, -0.7 ).add( ev.position );
                self.ui.mesh.position.set(0.1, 0.01, -0.2).add(ev.position);
                self.ui2.mesh.position.set(-0.1, 0.01, -0.2).add(ev.position);
                self.scene.add( self.apple); 
                self.scene.add(self.ui.mesh);
                self.scene.add(self.ui2.mesh);
                setTimeout( this.plotting(),300000);
            }
        });
*/
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
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };