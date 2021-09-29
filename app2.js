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

        const config1 = {
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


        const content1 = {
                info: ""
        }

        const ui1 = new CanvasUI( content1, config1 );
        this.ui1 = ui1;

        const ui2 = new CanvasUI( content1, config1 );
        this.ui2 = ui2;

        const ui3 = new CanvasUI( content1, config1 );
        this.ui3 = ui3;

        const ui4 = new CanvasUI( content1, config1 );
        this.ui4 = ui4;

        const ui5 = new CanvasUI( content1, config1 );
        this.ui5 = ui5;
        
        

        //setting up canvas for graph
        this.ui1.context.lineJoin = "round";  
        this.ui1.context.strokeStyle = "black"; 
        this.ui1.context.font = "20px Arial";
        this.ui2.context.lineJoin = "round";  
        this.ui2.context.strokeStyle = "black"; 
        this.ui2.context.font = "20px Arial";
        this.ui3.context.lineJoin = "round";  
        this.ui3.context.strokeStyle = "black"; 
        this.ui3.context.font = "20px Arial";
        this.ui4.context.lineJoin = "round";  
        this.ui4.context.strokeStyle = "black"; 
        this.ui4.context.font = "20px Arial";
        this.ui5.context.lineJoin = "round";  
        this.ui5.context.strokeStyle = "black"; 
        this.ui5.context.font = "20px Arial";
        
        //creating const for length and width
        const a = this.ui1.config.width;
        const b = this.ui1.config.height;
        const c = 60;
        this.a = a;
        this.b = b;
        this.c = c;
       
        //setting up button canvasUI
        const config2 = {
            panelSize: { height: 0.2 },
            height: 102.4,
            info: { type: "text", position:{ left: 6, top: 6 }, textAlign: 'center', width: 500, height: 42.4, backgroundColor: "#fff", fontColor: "#000", fontSize: 17, fontStyle: 'Arial'},
            //button1: { type: "button", position:{ top: 64, left: 0 }, width: 64, fontColor: "#bb0", hover: "#026", onSelect: button1 },
            button1: { type: "button", position:{ top: 54.4, left: 6.15 }, width: 95, height: 42, fontColor: "#fff", backgroundColor: "#02f", hover: "#3df", onSelect: button1 },
            button2: { type: "button", position:{ top: 54.4, left: 107.3 }, width: 95, height: 42, fontColor: "#fff", backgroundColor: "#02f", hover: "#3df", onSelect: button2 },
            button3: { type: "button", position:{ top: 54.4, left: 208.45}, width: 95, height: 42, fontColor: "#fff", backgroundColor: "#02f", hover: "#3df", onSelect: button3 },
            button4: { type: "button", position:{ top: 54.4, left: 309.6 }, width: 95, height: 42, fontColor: "#fff", backgroundColor: "#02f", hover: "#3df", onSelect: button4 },
            button5: { type: "button", position:{ top: 54.4, left: 410.75 }, width: 95, height: 42, fontColor: "#fff", backgroundColor: "#02f", hover: "#3df", onSelect: button5 },
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

        const ui6 = new CanvasUI( content2, config2 );
        this.ui6 = ui6;

        const config3 = {

            panelSize: { height: 0.2 },
            height: 102.4,
            info:{ type: "text", backgroundColor: "#fff", fontColor: "#000", fontSize: 40, padding:40, textAlign: 'center', fontStyle: 'Arial' },
        }


        const content3 = {
                info: "\u222B\u0192(x) = 67942.04"
        }

        const ui7 = new CanvasUI(content3, config3);
        this.ui7 = ui7;

        this.ui8 = this.ui7.mesh.clone();

        this.ui9 = this.ui7.mesh.clone();

        this.ui10 = this.ui7.mesh.clone();

        this.ui11 = this.ui7.mesh.clone();


        //functions of the buttons

        function button1(){
            const msg = "You have selected length 10";
            self.rectangles(10,self.ui5);
            console.log(msg);
            self.ui6.updateElement( "info", msg );
        }
        
        function button2(){
            const msg = "You have selected length 40";
            self.rectangles(40,self.ui5);
            console.log(msg);
            self.ui6.updateElement( "info", msg );
        }
        
        function button3(){
            const msg = "You have selected length 70";
            self.rectangles(70,self.ui5);
            console.log(msg);
            self.ui6.updateElement( "info", msg );

        }

        function button4(){
            const msg = "You have selected length 100";
            self.rectangles(100,self.ui5);
            console.log(msg);
            self.ui2.updateElement( "info", msg );
        }

        function button5(){
            const msg = "You have selected length 130";
            self.rectangles(130,self.ui5);
            console.log(msg);
            self.ui2.updateElement( "info", msg );
        }

    }
    
    rectangles(n, canv){
        this.ui = canv;
        //console.log(this);
        this.clearCanvas(this.ui);
        this.RenderFunction(this.ui);
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
        //console.log(area);
        this.ui.context.restore();
    }
    
    YC(y) {
        return this.b-this.c-y;
    }

    clearCanvas(canv){
        this.ui = canv ;
        this.ui.context.save();
        this.ui.context.fillStyle = 'white';
        this.ui.context.fillRect(0,0,this.a,this.b);
        this.ui.needsUpdate = true;
        this.ui.texture.needsUpdate = true;
        //console.log("clearCanvas");
        this.ui.context.restore();
    }

    // RenderFunction() renders the input funtion f on the canvas.
    RenderFunction(canv) {
        this.ui = canv;
        //console.log(canv);
        //console.log(this.ui);
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

            //adding meshes to scene
            self.ui1.mesh.position.set(-2,0,-2);
            self.ui1.mesh.rotateY(Math.PI/2);
            console.log(self.ui1.mesh);
            self.scene.add(self.ui1.mesh);
            self.ui7.mesh.position.set(-2,1,-2);
            self.ui7.mesh.rotateY(Math.PI/2);
            self.scene.add(self.ui7.mesh);
            self.rectangles(100,self.ui1);

            self.ui2.mesh.position.set(-2,0,-4);
            self.ui2.mesh.rotateY(Math.PI/4);
            self.scene.add(self.ui2.mesh);
            self.ui8.position.set(-2,1,-4);
            self.ui8.rotateY(Math.PI/4);
            self.scene.add(self.ui8);
            self.rectangles(70,self.ui2);

            self.ui3.mesh.position.set(0,0,-4);
            self.scene.add(self.ui3.mesh);
            self.ui9.position.set(0,1,-4);
            self.scene.add(self.ui9);
            self.rectangles(40,self.ui3);

            self.ui4.mesh.position.set(2,0,-4);
            self.ui4.mesh.rotateY(-Math.PI/4);
            self.scene.add(self.ui4.mesh);
            self.ui10.position.set(2,1,-4);
            self.ui10.rotateY(-Math.PI/4);
            self.scene.add(self.ui10);
            self.rectangles(10,self.ui4);

            self.ui5.mesh.position.set(2,0,-2);
            self.ui5.mesh.rotateY(-Math.PI/2);
            self.scene.add(self.ui5.mesh);
            self.ui11.position.set(2,1,-2);
            self.ui11.rotateY(-Math.PI/2);
            self.scene.add(self.ui11);
            self.RenderFunction(self.ui5);
            self.ui6.mesh.position.set(2,-1,-2);
            self.ui6.mesh.rotateY(-Math.PI/2);
            self.scene.add(self.ui6.mesh);

            
        }
       
        function onSessionEnd(){

            self.clearCanvas(self.ui1);
            self.clearCanvas(self.ui2);
            self.clearCanvas(self.ui3);
            self.clearCanvas(self.ui4);
            self.clearCanvas(self.ui5);

            self.scene.remove( self.ui1.mesh );
            self.scene.remove( self.ui2.mesh );
            self.scene.remove( self.ui3.mesh );
            self.scene.remove( self.ui4.mesh );
            self.scene.remove( self.ui5.mesh );
            self.scene.remove( self.ui6.mesh );
            self.scene.remove( self.ui7.mesh );

            self.scene.remove( self.ui8 );
            self.scene.remove( self.ui9 );
            self.scene.remove( self.ui10 );
            self.scene.remove( self.ui11 );


        }


        const btn = new ARButton( this.renderer, { onSessionStart, onSessionEnd,sessionInit: { optionalFeatures: [ 'dom-overlay' ], domOverlay: { root: document.body } } } ); 
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
        if ( this.renderer.xr.isPresenting ) this.ui6.update();
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };