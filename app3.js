import * as THREE from '../../libs/three/three.module.js';
import { OrbitControls } from '../../libs/three/jsm/OrbitControls.js';
import { ParametricGeometries } from '../../libs/three/jsm/ParametricGeometries.js';
import { Stats } from '../../libs/stats.module.js';
import { ARButton } from '../../libs/ARButton.js';
import { ControllerGestures } from '../../libs/ControllerGestures.js';
import {CanvasTexture} from '../../libs/three/three.module.js';
import { CanvasUI } from '../../libs/CanvasUI.js'

class App{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
		this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
		this.camera.position.set( 0, 0, 30);
        
        this.clock = new THREE.Clock();

		this.scene = new THREE.Scene();
        this.scene.add(this.camera);
        
		const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.3);
		this.scene.add(ambient);
        
        const light = new THREE.DirectionalLight();
        light.position.set( 0.2, 1, 1);
        this.scene.add(light);

			
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		container.appendChild( this.renderer.domElement );

        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.target.set(0, 3.5, 0);
        this.controls.update();
        
        this.stats = new Stats();

        /*
        //this.initScene();
        //this.setupVR();
        const canvas = document.createElement('canvas');
        this.context = canvas.getContext('2d');
        this.context.fillStyle = 'gray';
        this.context.fillRect (100,100,50,50);

        var GRAPH_TOP = 100;
        var GRAPH_BOTTOM = 150; 
        var GRAPH_LEFT = 100;
        var GRAPH_RIGHT = 150;  
        var GRAPH_HEIGHT = 50;   
        var GRAPH_WIDTH = 50; 
        // draw reference line at the top of the graph  
        // set light grey color for reference lines  
        this.context.strokeStyle = "#000";  
        this.context.beginPath();  
        this.context.moveTo( GRAPH_LEFT, GRAPH_BOTTOM );  
        this.context.lineTo( GRAPH_RIGHT, GRAPH_BOTTOM );  
        this.context.stroke();
        
        this.context.beginPath();  
        this.context.moveTo( GRAPH_LEFT, GRAPH_BOTTOM );  
        this.context.lineTo( GRAPH_LEFT, GRAPH_TOP );  
        this.context.stroke();
            
        
       

        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;

        const material = new THREE.MeshBasicMaterial( {map: texture, side: THREE.DoubleSide} );
        material.transparent = true;
        //const material = new THREE.MeshBasicMaterial( {transparent:true, opacity: 0.7} );

        this.mesh = new THREE.Mesh (new THREE.PlaneGeometry (canvas.width, canvas.height), material);
        this.mesh.position.set(0,60,-60);
        //this.mesh.scale(0.8,0.8,0.8)
        //this.mesh.rotateX(Math.PI/2);
        //this.texture = new CanvasTexture (canvas1);
        //this.mesh.material.map = this.texture;
        this.scene.add(this.mesh);
       
*/      this.createUI();
        
        this.renderer.setAnimationLoop( this.render.bind(this) );
        window.addEventListener('resize', this.resize.bind(this) );
	}	

    createUI() {
        
        const config = {
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


        const content = {
            info: "graph"
        }   

        const ui = new CanvasUI( content, config );
        this.ui = ui;
        this.scene.add(this.ui.mesh);
        this.ui.mesh.position.set(0.08, 0.01, -0.2);
      
    }

   /* initScene(){
        const geometry = new THREE.ParametricGeometry( ParametricGeometries.klein, 40, 30 );
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        material.wireframe=true;
        this.boca = new THREE.Mesh( geometry, material );
        this.boca.position.set(0,0,-4);
        this.boca.scale.set(0.08,0.08,0.08);
    }*/

       
   /* setupVR(){
        this.renderer.xr.enabled = true; 
        
        const self = this;
        function onSessionStart(){
          self.scene.add(self.boca);  
        }

        const btn = new ARButton( this.renderer, {onSessionStart});
      
        this.renderer.setAnimationLoop( this.render.bind(this) );
    }
    */
    
    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }
    
	render( ) {   
        const dt = this.clock.getDelta();
        //this.boca.rotateY( 0.01 );
        this.stats.update();
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };