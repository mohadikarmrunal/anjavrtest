import * as THREE from '../../libs/three/three.module.js';
import { OrbitControls } from '../../libs/three/jsm/OrbitControls.js';
import { ParametricGeometries } from '../../libs/three/jsm/ParametricGeometries.js';
import { Stats } from '../../libs/stats.module.js';
import { ARButton } from '../../libs/ARButton.js';
import { ControllerGestures } from '../../libs/ControllerGestures.js';

class App{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
		this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
		this.camera.position.set( 0, 40, 20);
        
        this.clock = new THREE.Clock();

		this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xaaaaaa );

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
       
        this.initScene();
        this.setupVR();
    
        window.addEventListener('resize', this.resize.bind(this) );
	}	


    initScene(){
        const geometry = new THREE.ParametricGeometry( ParametricGeometries.klein, 40, 30 );
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        material.wireframe=true;
        this.boca = new THREE.Mesh( geometry, material );
        this.boca.visible=false;
        this.scene.add( this.boca );
    }

       
    setupVR(){
        this.renderer.xr.enabled = true; 
        
        const self = this;
        function onSessionStart(){
          console.log('start the session');  
        }

        const btn = new ARButton( this.renderer, {onSessionStart});
      
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