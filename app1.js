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

        this.listener = new THREE.AudioListener();
        this.camera.add( this.listener );
        
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
			'apple.gltf',
			// called when the resource is loaded
			function ( gltf ) {

                self.apple = gltf.scene;
                self.loadingBar.visible = false;
                self.apple.visible=false;
				const scale = 0.06;
				self.apple.scale.set(scale, scale, scale); 
			},
			// called while loading is progressing
			function ( xhr ) {

				self.loadingBar.progress = (xhr.loaded / xhr.total);
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'An error happened with loading an apple' );
			}
        );

        loader.load(
			// resource URL
			'cart.gltf',
			// called when the resource is loaded
			function ( gltf ) {

                self.cart = gltf.scene;
                self.loadingBar.visible = false;
                self.cart.visible=false;
				//self.cart.scale.set(scale, scale, scale); 
			},
			// called while loading is progressing
			function ( xhr ) {

				self.loadingBar.progress = (xhr.loaded / xhr.total);
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'An error happened with loading a cart' );
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
                padding:65,
                fontSize:55,
            },
            info:{ type: "text" }
        }

        const content = {
            info: ""
        }
        const content1 = {
            info: "Price per kg"
        }   

        const content2 = {
            info: "Sold in kg"
        }

        const content3 = {
            info: ""
        }

        const content4 = {
            info: ""
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

    
        const ui = new CanvasUI( content, config );
        const ui1 = new CanvasUI( content1, config1 );
        const ui2 = new CanvasUI( content2, config1 );
        const ui3 = new CanvasUI( content3, config1 );
        const ui4 = new CanvasUI( content4, config1 );
        
        this.ui = ui;
        this.ui1 = ui1;
        this.ui2 = ui2;
        this.ui3 = ui3;
        this.ui4 = ui4;
        //console.log(this.ui.mesh);

        //positions
        this.ui.mesh.position.set(0,0,-2);
        this.ui1.mesh.position.set(0.3, 0.17, -0.9);
        this.ui2.mesh.position.set(-0.3, 0.17, -0.9);
        this.ui3.mesh.position.set(0.3, 0.13, -0.9);
        this.ui4.mesh.position.set(-0.3, 0.13, -0.9);
        this.ui3.mesh.visible = false;
        this.ui4.mesh.visible = false;

    }

    clearCanvas(){

       //removing graph
        this.ui.context.save();
        this.ui.context.fillStyle = 'white';
        this.ui.context.fillRect(0,0,this.ui.config.width,this.ui.config.height);
        this.ui.needsUpdate = true;
        this.ui.texture.needsUpdate = true;
        this.ui.context.restore();

        //restoring additional two canvases
        this.ui1.updateElement('info', 'Price per kg');
        this.ui2.updateElement('info', 'Sold in kg'); 
        this.ui1.updateConfig ("body", "fontColor", "#000" );
        this.ui1.updateConfig ("body", "fontColor", "#000" );
        this.ui1.update();
        this.ui2.update(); 
        
    }

    converttoDemand(x){
        return 382.5*x+7.65;
    }

    converttoPix(x){
        return 25.621*this.converttoDemand(x)+60;
    }

    funk(x){
        return -0.3*x+4.6;
    }

    

       
    setupVR(){

        var control = false;
        this.control = control;

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
            self.ui.context.fillStyle = 'black';
		   // self.ui.needsUpdate = true;
            self.ui1.mesh.visible = true;
            self.ui2.mesh.visible = true;
            self.scene.add(self.ui.mesh);
            self.scene.add(self.ui1.mesh);
            self.scene.add(self.ui2.mesh);
            self.scene.add(self.ui3.mesh);
            self.scene.add(self.ui4.mesh);

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
            self.ui.context.fillText("Price per kilogram", -11*b/15 , 2*c/3);
            self.ui.context.restore();

            if(!self.apple.visible){
                self.apple.visible = true;
                self.apple.position.set( 0.3, -0.03, -0.9 ); 
                self.scene.add( self.apple); 
            }

            if(!self.cart.visible){
                self.cart.visible = true;
                self.cart.position.set( -0.3, -0.07, -0.9); 
                self.scene.add( self.cart); 
            }

            setTimeout(next1,1000);
            setTimeout(next2,10000);
            setTimeout(next3,11000);
            setTimeout(next4,12000);
            
        }


        function next1(){

            if (this.app.speech === undefined) {

                const sound = new THREE.Audio( self.listener );
                
                const audioLoader = new THREE.AudioLoader();
                    audioLoader.load( 'audio/app1.mp3', ( buffer ) => {
                        sound.setBuffer( buffer );
                        sound.setLoop( false );
                        sound.setVolume( 1.0 );
                        sound.play();
                        console.log('sound');
                    });

                this.app.sound = sound;
                this.app.speech = new THREE.Audio( this.app.listener );
            } else {
                this.app.sound.play();
            }

            //update cijene i potraznje
            console.log('setTimeout1');
            this.app.ui1.updateElement('info', 'Price: 1.9e/kg');
            this.app.ui2.updateElement('info', 'Sold: 90 kg'); 
            this.app.ui1.updateConfig ("body", "fontColor", "#114" );
            this.app.ui1.updateConfig ("body", "fontColor", "#114" );
            this.app.ui1.update();
            this.app.ui2.update();  

            //update grafa
            this.app.ui.context.beginPath();
			this.app.ui.context.moveTo(a-c,b-c);
			this.app.ui.context.lineTo(9*incx+60,2.7*incy+60);
			this.app.ui.context.stroke();
            this.app.ui.context.save();
            this.app.ui.context.fillStyle = 'green';
            this.app.ui.context.fillRect(9*incx+60,2.7*incy+60,7,7);
			//dashed vertical line with the label of quantity
			this.app.ui.context.beginPath();
			this.app.ui.context.setLineDash([5, 15]);
			this.app.ui.context.moveTo(9*incx+60,2.7*incy+60);
			this.app.ui.context.lineTo(9*incx+60,b-c);
			this.app.ui.context.stroke();
			this.app.ui.context.font = "15px Arial";
			this.app.ui.context.fillText("90", 9*incx+60, b-2*c/3);
			//dashed horizontal line with the label of price
			this.app.ui.context.beginPath();
			this.app.ui.context.setLineDash([5, 12]);
			this.app.ui.context.moveTo(9*incx+60,2.7*incy+60);
			this.app.ui.context.lineTo(c,2.7*incy+60);
			this.app.ui.context.stroke();
			this.app.ui.context.fillText("1.9", c/3, 2.7*incy+60);
			this.app.ui.context.restore();
            this.app.ui.needsUpdate = true;
			this.app.ui.texture.needsUpdate = true;
			//console.log('next1');
        }

        function next2(){
            console.log('setTimeout2');
            //update price and demand
            this.app.ui1.updateElement('info', 'Price: 2.8e/kg');
            this.app.ui2.updateElement('info', 'Sold: 60 kg'); 
            this.app.ui1.updateConfig ("body", "fontColor", "#00f" );
            this.app.ui1.updateConfig ("body", "fontColor", "#00f" );
            this.app.ui1.update();
            this.app.ui2.update();  

            //second line
			this.app.ui.context.beginPath();
			this.app.ui.context.moveTo(9*incx+60,2.7*incy+60);
			this.app.ui.context.lineTo(6*incx+60,1.8*incy+60);
			this.app.ui.context.stroke();
            this.app.ui.context.fillStyle = 'blue';
			this.app.ui.context.fillRect(6*incx+60,1.8*incy+60,7,7);
			this.app.ui.context.save();
			//dashed vertical line with the label of quantity
			this.app.ui.context.beginPath();
			this.app.ui.context.setLineDash([5, 15]);
			this.app.ui.context.moveTo(6*incx+60,1.8*incy+60);
			this.app.ui.context.lineTo(6*incx+60,b-c);
			this.app.ui.context.stroke();
			this.app.ui.context.font = "15px Arial";
			this.app.ui.context.fillText("60", 6*incx+60, b-2*c/3);
			//dashed horizontal line with the label of price
			this.app.ui.context.beginPath();
			this.app.ui.context.setLineDash([5, 15]);
			this.app.ui.context.moveTo(6*incx+60,1.8*incy+60);
			this.app.ui.context.lineTo(c,1.8*incy+60);
			this.app.ui.context.stroke();
			this.app.ui.context.fillText("2.8", c/3 , 1.8*incy+60 );
			this.app.ui.context.restore();
			this.app.ui.needsUpdate = true;
			this.app.ui.texture.needsUpdate = true;
			//console.log('next2');
        }

        function next3(){
            //update price and demand
            console.log('setTimeout3');
            this.app.ui1.updateElement('info', 'Price: 3.7e/kg');
            this.app.ui2.updateElement('info', 'Sold:  30kg'); 
            this.app.ui1.updateConfig ("body", "fontColor", "#f00" );
            this.app.ui1.updateConfig ("body", "fontColor", "#f00" );
            this.app.ui1.update();
            this.app.ui2.update();  

            //third line
            this.app.ui.context.beginPath();
            this.app.ui.context.moveTo(6*incx+60,1.8*incy+60);
            this.app.ui.context.lineTo(3*incx+60,0.9*incy+60);
            this.app.ui.context.stroke();
            this.app.ui.context.fillStyle = 'red';
            this.app.ui.context.fillRect(3*incx+60,0.9*incy+60,7,7);
            this.app.ui.context.save();
            //dashed vertical line with the label of quantity
            this.app.ui.context.beginPath();
            this.app.ui.context.setLineDash([5, 15]);
            this.app.ui.context.moveTo(3*incx+60,0.9*incy+60);
            this.app.ui.context.lineTo(3*incx+60,b-c);
            this.app.ui.context.stroke();
            this.app.ui.context.font = "15px Arial";
            this.app.ui.context.fillText("30", 3*incx+60, b-2*c/3);
            //dashed horizontal line with the label of price
            this.app.ui.context.beginPath();
            this.app.ui.context.setLineDash([5, 15]);
            this.app.ui.context.moveTo(3*incx+60,0.9*incy+60);
            this.app.ui.context.lineTo(c,0.9*incy+60);
            this.app.ui.context.stroke();
            this.app.ui.context.fillText("3.7", c/3 , 0.9*incy +60);
            this.app.ui.context.restore();
            this.app.ui.context.beginPath();
            this.app.ui.context.moveTo(3*incx+60,0.9*incy+60);
            this.app.ui.context.lineTo(c,c);
            this.app.ui.context.stroke();
            this.app.ui.context.save();
            this.app.ui.context.rotate(Math.PI/4);
            this.app.ui.context.fillStyle = 'black';
            this.app.ui.context.font = "20px Arial";
            this.app.ui.context.fillText("Demand Curve f(x)", a/2 , -b/80);
            this.app.ui.context.restore();
            this.app.ui.needsUpdate = true;
            this.app.ui.texture.needsUpdate = true;
            //console.log('next3');
            
        }

        function next4(){

            this.app.control = true;
            //empty ui with price/demand
            this.app.ui1.updateElement('info', '');
            this.app.ui2.updateElement('info', ''); 
            this.app.ui1.updateConfig ("body", "fontColor", "#f00" );
            this.app.ui1.updateConfig ("body", "fontColor", "#f00" );
            this.app.ui1.update();
            this.app.ui2.update(); 

            //filling the area
            this.app.ui.context.save();
            this.app.ui.context.fillStyle = 'gray';
			this.app.ui.context.beginPath();
			this.app.ui.context.moveTo(a-c,b-c);
			this.app.ui.context.lineTo(c,c);
			this.app.ui.context.lineTo(c,b-c);
			this.app.ui.context.lineTo(a-c,b-c);
			this.app.ui.context.fill();
            this.app.ui.context.fillStyle = 'black';
			this.app.ui.context.font = "25px Arial";
			this.app.ui.context.fillText("AREA = 352,59", 2*a/5  , 3*b/4 );
            this.app.ui.context.lineWidth = '4';
            this.app.ui.context.beginPath();
			this.app.ui.context.moveTo(c,c);
			this.app.ui.context.lineTo(a-c,b-c);
            this.app.ui.context.stroke();
            this.app.ui.context.restore();
			this.app.ui.needsUpdate = true;
			this.app.ui.texture.needsUpdate = true;
			//console.log('next4');
        }

        function onSessionEnd(){

            if (self.sound && self.sound.isPlaying) self.sound.stop();

            self.control = false; 
            self.clearCanvas();
            self.cart.visible = false;
            self.apple.visible = false;
            self.ui3.mesh.visible = false;
            self.ui3.mesh.visible = false;
            self.scene.remove(self.ui.mesh);
            self.scene.remove(self.ui1.mesh);
            self.scene.remove(self.ui2.mesh);
            self.scene.remove(self.ui3.mesh);
            self.scene.remove(self.ui4.mesh);
            self.scene.remove(self.apple);
            self.scene.remove(self.cart);
            
           
        }

        const btn = new ARButton( this.renderer, { onSessionStart, onSessionEnd, sessionInit: { optionalFeatures: [ 'dom-overlay' ], domOverlay: { root: document.body } }});
        this.gestures = new ControllerGestures( this.renderer );
        
        this.gestures.addEventListener( 'tap', (ev)=>{

            if (self.control){

                console.log( 'tap' ); 
                //console.log(ev.position.x);
                if (-0.02 <= ev.position.x && ev.position.x <= 0.02) {
                    self.clearCanvas();
                    var m = self.converttoPix(ev.position.x);
                    var n = self.converttoDemand(ev.position.x);
                    var t = self.funk(n);
                    var s = b-c-t*incy;
                    console.log(n*10);
                    console.log(s);

                    //drawing a function
                    self.ui.context.fillStyle = 'black';
                    self.ui.context.font = "25px Arial";
                    self.ui.context.save();
                    self.ui.context.beginPath();
                    self.ui.context.moveTo(c,c);
                    self.ui.context.lineTo(c,b-c);
                    self.ui.context.lineTo(a-c,b-c);
                    self.ui.context.lineTo(c,c);
                    self.ui.context.stroke();
                    self.ui.context.fillText("Quantity Demanded", a/2,b-c/4);
                    self.ui.context.save();
                    self.ui.context.rotate(-Math.PI/2);
                    self.ui.context.fillText("Price per kilogram", -11*b/15 , 2*c/3);
                    self.ui.context.restore();

                    //drawing a dashed vertical line-price
                    self.ui.context.save();
                    self.ui.context.beginPath();
                    self.ui.context.setLineDash([5, 15]);
                    self.ui.context.moveTo(m,s);
                    self.ui.context.lineTo(m,b-c);
                    self.ui.context.stroke();
                    self.ui.context.fillStyle = 'green';
                    self.ui.context.font = "15px Arial";
                    self.ui.context.fillText((n*10).toFixed(2), m  , b-2*c/3 );

                    //drawing a dashed horizontal line-demand
                    self.ui.context.beginPath();
                    self.ui.context.setLineDash([5, 15]);
                    self.ui.context.moveTo(m,s);
                    self.ui.context.lineTo(c,s);
                    self.ui.context.stroke();
                    self.ui.context.fillStyle = 'green';
                    self.ui.context.font = "15px Arial";
                    self.ui.context.fillText(t.toFixed(2),c/3,s);
                    self.ui.context.restore();

                    //shading the total revenue area
                    self.ui.context.save();
                    self.ui.context.fillStyle = 'yellow';
                    self.ui.context.beginPath();
                    self.ui.context.moveTo(m,s);
                    self.ui.context.lineTo(m,b-c);
                    self.ui.context.lineTo(c,b-c);
                    self.ui.context.lineTo(c,s);
                    self.ui.context.fill();
                    self.ui.context.restore();

                    //shading the consumers surplus area
                    self.ui.context.save();
                    self.ui.context.fillStyle = 'green';
                    self.ui.context.beginPath();
                    self.ui.context.moveTo(m,s);
                    self.ui.context.lineTo(c,s);
                    self.ui.context.lineTo(c,c);
                    self.ui.context.lineTo(m,s);
                    self.ui.context.fill();
                    self.ui.context.restore();

                    //shading the lost welfare area
                    self.ui.context.save();
                    self.ui.context.fillStyle = 'gray';
                    self.ui.context.beginPath();
                    self.ui.context.moveTo(m,s);
                    self.ui.context.lineTo(a-c,b-c);
                    self.ui.context.lineTo(m,b-c);
                    self.ui.context.lineTo(m,s);
                    self.ui.context.fill();
                    self.ui.context.fillStyle = 'black';
                    self.ui.context.font = "15px Arial";
                    self.ui.context.fillText('Total',m/2,(b-c+s)/2);
                    self.ui.context.fillText('Revenue',m/2,(b-c+s)/2+10);
                    self.ui.context.restore();

                    
                    //area of the triangles
                    //consumer surplus
                    var area1 = ((4.6-t)*n*5).toFixed(2);
                    //lost welfare
                    var area2 = ((t*(153-n*10))/2).toFixed(2);
                    console.log(area1);
                    console.log(area2);
                    //self.ui.context.fillText(area1,m+c,b-c/2);
                    //self.ui.context.fillText(area2,m-c,2*c);

                    //update the ui-meshes showing the area of the triangles 
                    self.ui1.updateElement('info', 'Lost Wellfare'); 
                    self.ui2.updateElement('info', 'Consumer Surplus');
                    self.ui1.updateConfig ("body", "fontColor", "#000" );
                    self.ui2.updateConfig ("body", "fontColor", "#000" );
                    self.ui1.updateConfig ("body", "fontSize", "50" );
                    self.ui2.updateConfig ("body", "fontSize", "50" );
                    self.ui1.update();
                    self.ui2.update(); 
                    self.ui3.mesh.visible = true;
                    self.ui4.mesh.visible = true;
                    self.ui3.updateElement('info', area2);
                    self.ui4.updateElement('info', area1);
                    self.ui3.update();
                    self.ui4.update(); 

                    //hide mesh
                    self.cart.visible = false;
                    self.apple.visible = false;

                }


                //self.ui.updateElement('info', 'tap' );
                /*if (!self.knight.object.visible){
                    self.knight.object.visible = true;
                    self.knight.object.position.set( 0, -0.3, -0.5 ).add( ev.position );
                    self.scene.add( self.knight.object ); 
                }*/
            }
        });
        
        
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
        if ( this.renderer.xr.isPresenting ){
            this.gestures.update();
        }
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };