import * as THREE from '../../libs/three/three.module.js';
import { OrbitControls } from '../../libs/three/jsm/OrbitControls.js';
import { CanvasUI } from '../../libs/CanvasUI.js'
//intervali sa pravougaonicima samo na screen-u
class App{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
		this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
		this.camera.position.set( 0, 0, 4 );
        
		this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xaaaaaa );

		const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.3);
		this.scene.add(ambient);

		const light = new THREE.DirectionalLight();
		light.position.set( 0, 10, 0);
		this.scene.add(light);

		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		container.appendChild( this.renderer.domElement );

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
        const a = this.ui.config.width;
        const b = this.ui.config.height;
        const c = 60;
        this.ui.context.lineJoin = "round";  
		this.ui.context.strokeStyle = "black"; 
		this.ui.context.font = "20px Arial";
		//this.ui.mesh.position.set(0,0,-1);
        //this.scene.add(this.ui.mesh);
            
       
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
     

        function YC(y) {
            return b-c-y;
        }

        var XSTEP= 5;
        //(a-2*c)/a;

        // RenderFunction() renders the input funtion f on the canvas.
        function RenderFunction() {
            var first = true;
        
            this.app.ui.context.save();
            this.app.ui.context.beginPath() ;
            for (var x = c; x <= a-c; x += XSTEP) {
            var y = (x-452)*(x-452)/452 ;
            if (first) {
            this.app.ui.context.lineWidth = '3';
            this.app.ui.context.moveTo(x,YC(y));
            first = false ;
            } else {
            this.app.ui.context.lineTo(x,YC(y)) ;
            this.app.ui.context.stroke() ;
            this.app.ui.needsUpdate = true;
			this.app.ui.texture.needsUpdate = true;
            }
            }
			console.log('prvi timeout gotov');
            this.app.ui.context.restore();
        }
        
      



        function rectangles(n){
            this.app.ui.context.fillStyle = 'gray';

            for (let i=1;i*n<a-2*c;i++) {
                var area=0;
                var p;
                var x = c+ i*n;
                var y= YC((x-452)*(x-452)/452);
                
                if (i==1){
                    area=n*(((n)-452)*((n)-452)/452);
                    p=area;
                    this.app.ui.context.beginPath();
                    this.app.ui.context.setLineDash([5, 15]);
                    this.app.ui.context.moveTo(c,y);
                    this.app.ui.context.lineTo(x,y);
                    this.app.ui.context.lineTo(x,b-c);
                    this.app.ui.context.lineTo(c,b-c);
                    this.app.ui.context.lineTo(c,y);
                    this.app.ui.context.stroke();
                    this.app.ui.context.save();
                    this.app.ui.context.fillStyle = 'black';
                    this.app.ui.context.fillText(x-60, x, b-2*c/3);
                    //this.app.ui.context.fillText(y, c/3, y);
                    //this.app.ui.context.fillRect(x,y,7,7);
                    this.app.ui.context.restore();
                    this.app.ui.context.fill();
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
                    this.app.ui.context.save();
                    this.app.ui.context.fillStyle = 'black';
                    this.app.ui.context.fillText(x-60, x, b-2*c/3);
                    //this.app.ui.context.fillText(y, c/3, y);
                    //this.app.ui.context.fillRect(x,y,7,7);
                    this.app.ui.context.restore();
                    this.app.ui.context.fill();
                    area=p+n*(((i*n)-452)*((i*n)-452)/452);
                    p=area;
                    
                }
            }
            this.app.ui.context.fillStyle = 'black';
            this.app.ui.context.fillText("Area of the rectangles with lenght "+n, 3*a/5 , c);
            this.app.ui.context.fillText(area.toFixed(2), 3*a/5 , c+30);
            this.app.ui.needsUpdate = true;
			this.app.ui.texture.needsUpdate = true;
            console.log(area);
            console.log('drugi timeout gotov');
        }

        this.scene.add(this.ui.mesh);
        setTimeout(RenderFunction,2000);
		setTimeout(rectangles,4000,40);
		
        
		const controls = new OrbitControls (this.camera, this.renderer.domElement);
		this.renderer.setAnimationLoop(this.render.bind(this));
		window.addEventListener('resize', this.resize.bind(this) );
	}	


    resize(){
		this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight ); 
        
    }
    
	render( ) {   
		//this.mesh.rotateX (0.05);
		//this.mesh2.rotateY(0.05);
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };
