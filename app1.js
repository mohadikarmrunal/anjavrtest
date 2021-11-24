import * as THREE from '../../libs/three/three.module.js';
import { OrbitControls } from '../../libs/three/jsm/OrbitControls.js';
import { GLTFLoader } from '../../libs/three/jsm/GLTFLoader.js';
import { Stats } from '../../libs/stats.module.js';
import { CanvasUI } from '../../libs/CanvasUI.js'
import { ARButton } from '../../libs/ARButton.js';
import { LoadingBar } from '../../libs/LoadingBar.js';
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
				console.log( 'An error happened with loading an apple!' );
                alert('An error happened when loading 3D Objects. Refresh the page!');

			}
        );

        loader.load(
			// resource URL
			'cart.gltf',
			// called when the resource is loaded
			function ( gltf ) {

                self.animations = {};
                self.cart = gltf.scene;
                self.cartobj = gltf.scene.children[0];
                self.animations['click'] = gltf.animations[0];
                self.mixer = new THREE.AnimationMixer( self.cartobj );
                const clip = self.animations['click'];
                const action = self.mixer.clipAction (clip);
                action.enabled = true;
                self.action = action;
                self.action.loop = THREE.LoopRepeat;
                self.loadingBar.visible = false;
                self.cart.visible=false; 
			},
			// called while loading is progressing
			function ( xhr ) {

				self.loadingBar.progress = (xhr.loaded / xhr.total);
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'An error happened with loading a cart!' );
                alert('An error happened when loading 3D Objects. Refresh the page!');

			}
        );

        loader.load(
			// resource URL
			'cursor.gltf',
			// called when the resource is loaded
			function ( gltf ) {

                self.cursor = gltf.scene;
                self.loadingBar.visible = false;
                self.cursor.visible=false;
				const scale = 0.01;
				self.cursor.scale.set(scale, scale, scale); 
                self.cursor.rotateX(Math.PI/2);
                self.cursor1 = self.cursor.clone();
                self.cursor2 = self.cursor.clone();
			},
			// called while loading is progressing
			function ( xhr ) {

				self.loadingBar.progress = (xhr.loaded / xhr.total);
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'An error happened with loading a cursor!' );
                alert('An error happened when loading 3D Objects. Refresh the page!');

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

        const config2 = {
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

        const content1a = {
            info: ""
        }

        const content2a = {
            info: ""
        }

        const content3a = {
            info: ""
        }

        const content1 = {
            info: "Price per kg"
        }   

        const content2 = {
            info: "Sold in kg"
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

        const config1a = {
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

        const config2a = {
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

        const config3a = {
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
        const ui2 = new CanvasUI( content2, config2 );
        const ui1a = new CanvasUI( content1a, config1a );
        const ui2a = new CanvasUI( content2a, config2a );
        const ui3a = new CanvasUI( content3a, config3a );

        this.ui = ui;
        this.ui1 = ui1;
        this.ui2 = ui2;
        this.ui1a = ui1a;
        this.ui2a = ui2a;
        this.ui3a = ui3a;

        this.ui1a.mesh.rotateY(-Math.PI/2);
        this.ui2a.mesh.rotateY(-Math.PI);
        this.ui3a.mesh.rotateY(Math.PI/2);

        const a = this.ui.config.width;
        const b = this.ui.config.height;
        const c = 60;
        this.a = a;
        this.b = b;
        this.c = c;

        //positions
        this.ui.mesh.position.set(0,0,-2);
        this.ui1.mesh.position.set(0.3, 0.17, -0.9);
        this.ui2.mesh.position.set(-0.3, 0.17, -0.9);
        
        
        this.ui1a.mesh.position.set(-0.5,0,-2.5);
        this.ui2a.mesh.position.set(0,0,-3);
        this.ui3a.mesh.position.set(0.5,0,-2.5);

        this.ui1a.mesh.visible = false;
        this.ui2a.mesh.visible = false;
        this.ui3a.mesh.visible = false;

        //setting up style of the line
        this.ui.context.lineJoin = "round";  
        this.ui.context.strokeStyle = "black"; 
        this.ui.context.font = "20px Arial";
        this.ui.context.fillStyle = 'black';
        this.ui1a.context.lineJoin = "round";  
        this.ui1a.context.strokeStyle = "black"; 
        this.ui1a.context.font = "20px Arial";
        this.ui1a.context.fillStyle = 'black';
        this.ui2a.context.lineJoin = "round";  
        this.ui2a.context.strokeStyle = "black"; 
        this.ui2a.context.font = "20px Arial";
        this.ui2a.context.fillStyle = 'black';
        this.ui3a.context.lineJoin = "round";  
        this.ui3a.context.strokeStyle = "black"; 
        this.ui3a.context.font = "20px Arial";
        this.ui3a.context.fillStyle = 'black';

    }

    settingupUI(canv,u,w,i,j,k,l){

        this.ui0 = canv;
        
        //i=total revenue
        //j=price 
        //k=quantity
        //l=consumer surpluss

        const a = this.a;
        const b = this.b;
        const c = this.c;
        const v = (-(b/2)+452);

        //total revenue
        this.ui0.context.save();
        this.ui0.context.fillStyle = 'yellow';
		this.ui0.context.beginPath();
		this.ui0.context.moveTo(u,w);
		this.ui0.context.lineTo(u,b-c);
		this.ui0.context.lineTo(c,b-c);
		this.ui0.context.lineTo(c,w);
		this.ui0.context.fill();
        //drawing a bolder line for demand curve
        this.ui0.context.lineWidth = '4';
        this.ui0.context.beginPath();
		this.ui0.context.moveTo(c,c);
		this.ui0.context.lineTo(a-c,b-c);
        this.ui0.context.stroke();
        //surpluss
        this.ui0.context.fillStyle = 'green';
		this.ui0.context.beginPath();
		this.ui0.context.moveTo(u,w);
		this.ui0.context.lineTo(c,w);
		this.ui0.context.lineTo(c,c);
		this.ui0.context.lineTo(u,w);
		this.ui0.context.fill();
        //lostwellfare
        this.ui0.context.fillStyle = 'gray';
		this.ui0.context.beginPath();
		this.ui0.context.moveTo(u,w);
		this.ui0.context.lineTo(u,b-c);
		this.ui0.context.lineTo(b-c,b-c);
		this.ui0.context.lineTo(u,w);
		this.ui0.context.fill();
        //adding labels
        this.ui0.context.fillStyle = 'black';
		this.ui0.context.font = "15px Arial";
		this.ui0.context.fillText("Total", b/4  , (b-c)-v/2);
        this.ui0.context.fillText("Revenue", b/4  ,(b-c)-v/2+20);
        this.ui0.context.fillText(i + "\u20AC", b/4  , (b-c)-v/2+40 );
        this.ui0.context.fillText('Price = '+j+' \u20AC',2*(b-c)/3,c);
        this.ui0.context.fillText('Quantity = '+k+' kg',2*(b-c)/3,c+20);
        this.ui0.context.fillText('Consumer Surpluss =  '+l+' \u20AC',2*(b-c)/3,c+40);
        this.ui0.context.restore();

    }

    clearCanvas(ind,canv){
        this.ui0 = canv;
       //removing graph
        this.ui0.context.save();
        this.ui0.context.fillStyle = 'white';
        this.ui0.context.fillRect(0,0,this.ui0.config.width,this.ui0.config.height);
        this.ui0.needsUpdate = true;
        this.ui0.texture.needsUpdate = true;
        this.ui0.context.restore();

        //adding the x and y axis
        this.ui0.context.fillStyle = 'black';
        this.ui0.context.font = "25px Arial";
        this.ui0.context.save();
        this.ui0.context.beginPath();
        this.ui0.context.moveTo(this.c,this.c);
        this.ui0.context.lineTo(this.c,this.b-this.c);
        this.ui0.context.lineTo(this.a-this.c,this.b-this.c);
        this.ui0.context.stroke();
        this.ui0.context.fillText("Quantity Demanded", this.a/2,this.b-this.c/4);
        this.ui0.context.save();
        this.ui0.context.rotate(-Math.PI/2);
        this.ui0.context.fillText("Price per kilogram", -11*this.b/15 , 2*this.c/3);
        this.ui0.context.restore();

        //restoring additional two canvases
        if (ind){
            this.ui1.updateElement('info', 'Price per kg');
            this.ui2.updateElement('info', 'Sold in kg'); 
            this.ui1.updateConfig ("body", "fontColor", "#000" );
            this.ui2.updateConfig ("body", "fontColor", "#000" );
            this.ui2.updateConfig ("body", "fontSize", "55" );
            this.ui1.update();
            this.ui2.update(); 
        }        
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

        //increments on x and y axis and measurements
        const a = this.a;
        const b = this.b;
        const c = this.c;
        const incx = (a-2*c)/ 15.3;
        const incy = (b-2*c)/ 4.6;

        function next1(){
            console.log('Sound is playing!');
            this.app.sound.play();
        }

        function next2(){
            this.app.clearCanvas(0,this.app.ui);

            //update of the price and quantity in a ui1 and ui2
            console.log('setTimeout2');
            this.app.ui1.updateElement('info', 'Price: 1.9 \u20AC /kg');
            this.app.ui2.updateElement('info', 'Sold: 90 kg'); 
            this.app.ui1.updateConfig ("body", "fontColor", "#114" );
            this.app.ui2.updateConfig ("body", "fontColor", "#114" );
            this.app.ui1.update();
            this.app.ui2.update();  

            //adding a cursor
            if(!this.app.cursor.visible){
                this.app.cursor.visible = true;
                this.app.cursor.position.set( -0.25, -0.01, -0.86); 
                this.app.scene.add( this.app.cursor); 
            }

            //play the animation very fast
            this.app.action.play();
            this.app.action.timeScale = 3;

            //update of the graph
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
			this.app.ui.context.fillText("1.9", c/3, 2.7*incy+30);
			this.app.ui.context.restore();
            this.app.ui.needsUpdate = true;
			this.app.ui.texture.needsUpdate = true;
        }

        function next3(){
            //update price and demand
            this.app.ui1.updateElement('info', 'Price: 2.8 \u20AC /kg');
            this.app.ui2.updateElement('info', 'Sold: 60 kg'); 
            this.app.ui1.updateConfig ("body", "fontColor", "#00f" );
            this.app.ui2.updateConfig ("body", "fontColor", "#00f" );
            this.app.ui1.update();
            this.app.ui2.update();  

            //update animation-mid speed
            this.app.action.timeScale = 2;

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
        }

        function next4(){
            //update price and demand
            console.log('setTimeout4');
            this.app.ui1.updateElement('info', 'Price: 3.7 \u20AC /kg');
            this.app.ui2.updateElement('info', 'Sold:  30kg'); 
            this.app.ui1.updateConfig ("body", "fontColor", "#f00" );
            this.app.ui2.updateConfig ("body", "fontColor", "#f00" );
            this.app.ui1.update();
            this.app.ui2.update();  

            //play the animation-slow
            this.app.action.timeScale = 1;

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
            
        }

        function next5(){
            //middle of the x-axis and corresponding y value
            var u = b/2;
            var v = (-u+452);
            var w = (b-c)-v;
            this.app.control = true;

            //visibility
            this.app.ui1.mesh.visible = false;
            this.app.ui2.mesh.visible = false;
            this.app.ui1a.mesh.visible = true;
            this.app.ui2a.mesh.visible = true;
            this.app.ui3a.mesh.visible = true;


            this.app.scene.add(this.app.ui1a.mesh);
            this.app.scene.add(this.app.ui2a.mesh);
            this.app.scene.add(this.app.ui3a.mesh);

            //draw axis and curve on every canvas
            this.app.clearCanvas(0,this.app.ui1a);
            this.app.clearCanvas(0,this.app.ui2a);
            this.app.clearCanvas(0,this.app.ui3a);

            //stop the animation
            this.app.action.stop();

            //remove the 3Dobjects
            this.app.cursor.visible = false; 
            this.app.cart.visible = false;
            this.app.apple.visible = false;

            //set up all the ui and rotate them
            this.app.settingupUI(this.app.ui,9*incx+60,2.7*incy+60, 171, 1.9, 90, 121.5);
            this.app.settingupUI(this.app.ui1a,u,w,176.33, 2.305,76.5,99.45);
            this.app.settingupUI(this.app.ui2a, 6*incx+60,1.8*incy+60,168,2.8,60,54);
            this.app.settingupUI(this.app.ui3a, 3*incx+60, 0.9*incy+60, 111, 3.7, 30, 18);
			this.app.ui.needsUpdate = true;
			this.app.ui.texture.needsUpdate = true;
        }

        function onSessionStart(){

            var timeout1, timeout2, timeout3, timeout4, timeout5

            self.ui1.mesh.visible = true;
            self.ui2.mesh.visible = true;
            self.scene.add(self.ui.mesh);
            self.scene.add(self.ui1.mesh);
            self.scene.add(self.ui2.mesh);
            

            self.clearCanvas(0,self.ui);
            self.ui.context.beginPath();
            self.ui.context.moveTo(a-c,b-c);
            self.ui.context.lineTo(c,c);
            self.ui.context.stroke();
            self.ui.context.save();
            self.ui.context.rotate(Math.PI/4);
            self.ui.context.fillStyle = 'black';
            self.ui.context.font = "20px Arial";
            self.ui.context.fillText("Demand Curve f(x)", a/2 , -b/80);
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

            timeout1 = setTimeout(next1,1000);
            timeout2 = setTimeout(next2,52000);
            timeout3 = setTimeout(next3,71000);
            timeout4 = setTimeout(next4,76000);
            timeout5 = setTimeout(next5,89000);
            self.timeout1 = timeout1;
            self.timeout2 = timeout2;
            self.timeout3 = timeout3;
            self.timeout4 = timeout4;
            self.timeout5 = timeout5;            
        }

        function onSessionEnd(){

            if (self.sound && self.sound.isPlaying) self.sound.stop();
            self.control = false; 
            self.action.reset();
            self.action.stop();
            self.clearCanvas(1,self.ui);

            self.cursor.visible = false;
            self.cart.visible = false;
            self.apple.visible = false;
        
            self.scene.remove(self.ui.mesh);
            self.scene.remove(self.ui1.mesh);
            self.scene.remove(self.ui2.mesh);
           
            self.scene.remove(self.apple);
            self.scene.remove(self.cursor);
            self.scene.remove(self.cart);

            

            self.ui1a.mesh.visible = false;
            self.ui2a.mesh.visible = false;
            self.ui3a.mesh.visible = false;

            self.scene.remove(self.ui1a.mesh);
            self.scene.remove(self.ui3a.mesh);
            self.scene.remove(self.ui2a.mesh);

            clearTimeout(self.timeout1);
            clearTimeout(self.timeout2);
            clearTimeout(self.timeout3);
            clearTimeout(self.timeout4);
            clearTimeout(self.timeout5);
        }

        var promise = new Promise(function(resolve, reject) {
             const sound = new THREE.Audio( self.listener );
            const audioLoader = new THREE.AudioLoader();
            audioLoader.load( 'audio/app1.mp3', ( buffer ) => {
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
                const btn = new ARButton( self.renderer, { onSessionStart, onSessionEnd, sessionInit: { optionalFeatures: [ 'dom-overlay' ], domOverlay: { root: document.body } }})
                console.log(result)}, function (error){
                console.log(error);
            });

         this.gestures = new ControllerGestures( this.renderer );
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
            this.mixer.update( dt )
        }
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };