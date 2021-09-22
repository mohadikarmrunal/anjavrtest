import * as THREE from '../../libs/three/three.module.js';
import { OrbitControls } from '../../libs/three/jsm/OrbitControls.js';
//import { GLTFLoader } from '../../libs/three/jsm/GLTFLoader.js';
import { Stats } from '../../libs/stats.module.js';
import { CanvasUI } from '../../libs/CanvasUI.js'
import { ARButton } from '../../libs/ARButton.js';
//import { FBXLoader } from '../../libs/three/jsm/FBXLoader.js';
//import { LoadingBar } from '../../libs/LoadingBar.js';

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
        
        this.createUI();
        this.setupVR();

        window.addEventListener('resize', this.resize.bind(this) );
	
    }

    createUI(){

        const self = this;

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

        //setting up canvas for graph
        this.ui.context.lineJoin = "round";  
        this.ui.context.strokeStyle = "black"; 
        this.ui.context.font = "20px Arial";

        //creating const for length and width
        const a = this.ui.config.width;
        const b = this.ui.config.height;
        const c = 60;
        this.a = a;
        this.b = b;
        this.c = c;
       
        //setting up button canvasUI
        const config2 = {
            panelSize: { width: 2.6, height: 0.5 },
            height: 128,
            info: { type: "text", position:{ left: 6, top: 6 }, textAlign: 'center', width: 500, height: 58, backgroundColor: "#fff", fontColor: "#000", fontSize: 17, fontStyle: 'Arial'},
            //button1: { type: "button", position:{ top: 64, left: 0 }, width: 64, fontColor: "#bb0", hover: "#026", onSelect: button1 },
            button1: { type: "button", position:{ top: 70, left: 6.15 }, width: 95, height: 52, fontColor: "#fff", backgroundColor: "#02f", hover: "#3df", onSelect: button1 },
            button2: { type: "button", position:{ top: 70, left: 107.3 }, width: 95, height: 52, fontColor: "#fff", backgroundColor: "#02f", hover: "#3df", onSelect: button2 },
            button3: { type: "button", position:{ top: 70, left: 208.45}, width: 95, height: 52, fontColor: "#fff", backgroundColor: "#02f", hover: "#3df", onSelect: button3 },
            button4: { type: "button", position:{ top: 70, left: 309.6 }, width: 95, height: 52, fontColor: "#fff", backgroundColor: "#02f", hover: "#3df", onSelect: button4 },
            button5: { type: "button", position:{ top: 70, left: 410.75 }, width: 95, height: 52, fontColor: "#fff", backgroundColor: "#02f", hover: "#3df", onSelect: button5 },
            //continue: { type: "button", position:{ top: 70, right: 10 }, width: 200, height: 52, fontColor: "#fff", backgroundColor: "#1bf", hover: "#3df", onSelect: button4 },
            renderer: this.renderer
        }
        const content2 = {
            info: "Select the lenght of the rectangles by pressing buttons",
            button1: "10",
            button2: "40",
            button3: "70",
            button4: "100",
            button5: "130",
        }

        const ui2 = new CanvasUI( content2, config2 );
        this.ui2 = ui2;

        const config3 = {

            panelSize: { width: 2.6, height: 0.5 },
            height: 98.46,
            info:{ type: "text", backgroundColor: "#fff", fontColor: "#000", fontSize: 40, padding:40, textAlign: 'center', fontStyle: 'Arial' },
        }


        const content3 = {
                info: "\u222B\u0192(x) = 67942.04"
        }

        const ui3 = new CanvasUI(content3, config3);
        this.ui3 = ui3;


        //functions of the buttons

        function button1(){
            const msg = "You have selected length 10";
            self.rectangles(10);
            console.log(msg);
            self.ui2.updateElement( "info", msg );
        }
        
        function button2(){
            const msg = "You have selected length 40";
            self.rectangles(40);
            console.log(msg);
            self.ui2.updateElement( "info", msg );
        }
        
        function button3(){
            const msg = "You have selected length 70";
            self.rectangles(70);
            console.log(msg);
            self.ui2.updateElement( "info", msg );

        }

        function button4(){
            const msg = "You have selected length 100";
            self.rectangles(100);
            console.log(msg);
            self.ui2.updateElement( "info", msg );
        }

        function button5(){
            const msg = "You have selected length 130";
            self.rectangles(130);
            console.log(msg);
            self.ui2.updateElement( "info", msg );
        }

    }
    
    rectangles(n){
        console.log(this);
        this.clearCanvas();
        this.RenderFunction();
        this.ui.context.save();
        this.ui.context.fillStyle = 'gray';
        const a = this.a;
        const b = this.b;
        const c = this.c;

        for (let i=1;i*n<a-2*c;i++) {
            var area=0;
            var p;
            var k=i;
            var x = c+ i*n;
            var y= this.YC((x-452)*(x-452)/452);
            
            if (i==1){
                area=n*(((n)-452)*((n)-452)/452);
                p=area;
                this.ui.context.beginPath();
                this.ui.context.setLineDash([5, 15]);
                this.ui.context.moveTo(c,y);
                this.ui.context.lineTo(x,y);
                this.ui.context.lineTo(x,b-c);
                this.ui.context.lineTo(c,b-c);
                this.ui.context.lineTo(c,y);
                this.ui.context.stroke();
                this.ui.context.save();
                this.ui.context.fillStyle = 'black';
                this.ui.context.fillText(x-60, x, b-2*c/3);
                //this.app.ui.context.fillText(y, c/3, y);
                //this.app.ui.context.fillRect(x,y,7,7);
                this.ui.context.restore();
                this.ui.context.fill();
            }

            else{
                this.ui.context.beginPath();
                this.ui.context.setLineDash([5, 15]);
                this.ui.context.moveTo(x-n,y);
                this.ui.context.lineTo(x,y);
                this.ui.context.lineTo(x,b-c);
                this.ui.context.lineTo(x-n,b-c);
                this.ui.context.lineTo(x-n,y);
                this.ui.context.stroke();
                this.ui.context.save();
                this.ui.context.fillStyle = 'black';
                if (n>10){
                   this.ui.context.fillText(x-60, x, b-2*c/3);
                }
                else {
                    if(k%5==0) {
                    this.ui.context.fillText(x-60, x, b-2*c/3);
                    }
                }
                //this.app.ui.context.fillText(y, c/3, y);
                //this.app.ui.context.fillRect(x,y,7,7);
                this.ui.context.restore();
                this.ui.context.fill();
                area=p+n*(((i*n)-452)*((i*n)-452)/452);
                p=area;
                
            }
        }

        this.ui.context.fillStyle = 'black';
        this.ui.context.fillText("Area of the rectangles with lenght "+n, 3*a/5 , c);
        this.ui.context.save();
        this.ui.context.fillStyle = "#02f";
        this.ui.context.font = "bold 20px Arial";
        this.ui.context.fillText(area.toFixed(2), 3*a/5 , c+30);
        this.ui.context.restore();
        this.ui.needsUpdate = true;
        this.ui.texture.needsUpdate = true;
        console.log(area);
        this.ui.context.restore();
    }
    
    YC(y) {
        return this.b-this.c-y;
    }

    clearCanvas(){
        this.ui.context.save();
        this.ui.context.fillStyle = 'white';
        this.ui.context.fillRect(0,0,this.a,this.b);
        this.ui.needsUpdate = true;
        this.ui.texture.needsUpdate = true;
        //console.log("clearCanvas");
        this.ui.context.restore();
    }

    // RenderFunction() renders the input funtion f on the canvas.
    RenderFunction() {

        var XSTEP= 5;
        var first = true;
        const a = this.a;
        const b = this.b;
        const c = this.c;
        //this.ui.context.fillStyle = '#fff';
        //this.ui.context.clearRect(0, 0, a, b);
        //this.ui.context.clear();

        //x and y axis with labels
        this.ui.context.beginPath();
        this.ui.context.moveTo(c,c);
        this.ui.context.lineTo(c,b-c);
        this.ui.context.lineTo(a-c,b-c);
        this.ui.context.stroke();
        this.ui.context.fillText("Quantity Demanded", a/2,b-c/4);
        this.ui.context.save();
        this.ui.context.rotate(-Math.PI/2);
        this.ui.context.fillText("Price per kilogram", -2*b/3 , 2*c/3);
        this.ui.context.restore(); 
        this.ui.context.save();
        this.ui.context.rotate(2*Math.PI/7);
        this.ui.context.fillStyle = 'black';
        this.ui.context.font = "20px Arial";
        this.ui.context.fillText("Demand Curve f(x)", a/2 , -b/70);
        this.ui.context.restore();

        //step for function drawing
        this.ui.context.save();
        this.ui.context.beginPath() ;
        for (var x = c; x <= a-c; x += XSTEP) {
        var y = (x-452)*(x-452)/452 ;
        if (first) {
        this.ui.context.lineWidth = '3';
        this.ui.context.moveTo(x,this.YC(y));
        first = false ;
        } else {
        this.ui.context.lineTo(x,this.YC(y)) ;
        this.ui.context.stroke() ;
        this.ui.needsUpdate = true;
        this.ui.texture.needsUpdate = true;
        }
        }
        
        //console.log('renderFunction');
        this.ui.context.restore();
    }

    setupVR() {
        this.renderer.xr.enabled = true; 

        const self = this;
        const a = this.a;
        const b = this.b;
        const c = this.c;
            
        function onSessionStart(){
            //adding mesh to scene
            self.ui.mesh.position.set(0,0,-2);
            self.scene.add(self.ui.mesh);

            self.ui2.mesh.position.set(0,-1.7,-5);
            self.scene.add(self.ui2.mesh);

            self.ui3.mesh.position.set(0,1.7,-5);
            self.scene.add(self.ui3.mesh);
            
            self.RenderFunction();
            
        }
       
        function onSessionEnd(){
            self.clearCanvas();
            self.scene.remove( self.ui.mesh );
            self.scene.remove( self.ui2.mesh );
            self.scene.remove( self.ui3.mesh );
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
        if ( this.renderer.xr.isPresenting ) this.ui2.update();
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };