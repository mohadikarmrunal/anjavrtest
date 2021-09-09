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

        this.createUI();
    }

    createUI() {

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
        this.ui = ui;
       
       
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
            self.scene.add(self.ui.mesh);
            
            //console.log("values of width and height"+ a + b);
            //x i y osa sa oznakama
            self.ui.context.beginPath();
            self.ui.context.moveTo(c,c);
            self.ui.context.lineTo(c,b-c);
            self.ui.context.lineTo(a-c,b-c);
            self.ui.context.stroke();
            self.ui.context.fillText("Quantity Demanded", a/2,b-c/4);
            self.ui.context.save();
            self.ui.context.rotate(-Math.PI/2);
            self.ui.context.fillText("Price per kilogram", -2*b/3 , 2*c/3);
            self.ui.context.restore();


            setTimeout(next1,3000);
            setTimeout(rectangles,5000,60);
            //setTimeout(next3,9000);
            //setTimeout(next4,12000);
            
        }

        function next1(){
            //update grafa
            this.app.ui.context.fillStyle = 'gray';
            this.app.ui.context.beginPath();
			this.app.ui.context.moveTo(c,c);
			this.app.ui.context.quadraticCurveTo(c,b-c,a-c,b-c);
            this.app.ui.context.lineTo(c,b-c);
            this.app.ui.context.lineTo(c,c);
            this.app.ui.context.stroke();
            this.app.ui.context.save();
			this.app.ui.context.fill();
            this.app.ui.context.rotate(Math.PI/4);
            this.app.ui.context.fillStyle = 'black';
            this.app.ui.context.font = "20px Arial";
            this.app.ui.context.fillText("Demand Curve f(x)", a/2 , -b/80);
            this.app.ui.context.restore();
            this.app.ui.needsUpdate = true;
			this.app.ui.texture.needsUpdate = true;
			console.log('prvi timeout gotov');
        }

        function rectangles(n){

            for (let i=1;i*n>a;i++) {
                var x = c+ i*n;
                var y= (b-c)-((1/452)*(x - 452)^2);
                
                if (i==1){
                    this.app.ui.context.beginPath();
                    this.app.ui.context.setLineDash([5, 15]);
                    this.app.ui.context.moveTo(c,y);
                    this.app.ui.context.lineTo(n,y);
                    this.app.ui.context.lineTo(n,b-c);
                    this.app.ui.context.lineTo(c,b-c);
                    this.app.ui.context.lineTo(c,y);
                    this.app.ui.context.stroke();
                    this.app.ui.context.fill();
                    this.app.ui.needsUpdate = true;
			        this.app.ui.texture.needsUpdate = true;
                }

                else{
                    this.app.ui.context.beginPath();
                    this.app.ui.context.setLineDash([5, 15]);
                    this.app.ui.context.moveTo(x-n,y);
                    this.app.ui.context.lineTo(x,y);
                    this.app.ui.context.lineTo(x,b-c);
                    this.app.ui.context.lineTo(x-n,b-c);
                    this.app.ui.context.lineTo(x-n,y);
                    this.app.ui.context.stroke();
                    this.app.ui.context.fill();
                    this.app.ui.needsUpdate = true;
			        this.app.ui.texture.needsUpdate = true;
                }
            }
            console.log('drugi timeout gotov');

        }


        const btn = new ARButton( this.renderer, {onSessionStart});
        
        //const btn = new ARButton( this.renderer, { onSessionStart, onSessionEnd, sessionInit: { optionalFeatures: [ 'dom-overlay' ], domOverlay: { root: document.body } } } ); 
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