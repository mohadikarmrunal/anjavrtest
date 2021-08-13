//import * as THREE from '../../libs/three/three.module.js';
//import { OrbitControls } from '../../libs/three/jsm/OrbitControls.js';
//import * as myMod from '../../build/mathbox-bundle.js';
import * as THREE from '../../libs/three/three.module.js';
import { Mesh, 
  CanvasTexture, 
  MeshBasicMaterial, 
  PlaneGeometry
 } from '../../libs/three/three.module.js';
import { Stats } from '../../libs/stats.module.js';
import { OrbitControls } from '../../libs/three/jsm/OrbitControls.js';
import { ARButton } from '../../libs/ARButton.js';

class App{
   
    constructor(){

		const container = document.createElement( 'div' );
		document.body.appendChild( container );
    
    
    var WIDTH = 640;
    var HEIGHT = 480;

		this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
		this.camera.position.set( 0, 40, 20);

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
    
    this.initScene();
    this.setupVR();
    window.addEventListener('resize', this.resize.bind(this) );
    

  }

  initScene(){

    var mathbox = mathBox();
    if (mathbox.fallback) { throw Error("No WebGL support.") };
    
    console.log('IS THIS WORKING?');
    var three = mathbox.three;
    three.renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);
    console.log("console log ");
    console.log(three.canvas);
    
    // Place camera
    var camera =
      mathbox
      .camera({
        proxy: true,
        position: [0, 0, 3],
      });

    // 2D cartesian
    var view =
      mathbox
      .cartesian({
        range: [[-2, 2], [-1, 1]],
        scale: [2, 1],
      });
  
    // Axes + grid
    view
      .axis({
        axis: 1,
        width: 3,
      })
      .axis({
        axis: 2,
        width: 3,
      })
      .grid({
        width: 2,  
        divideX: 20,
        divideY: 10,        
      });

    // Make axes black
    mathbox.select('axis').set('color', 'black');

    // Calibrate focus distance for units
    mathbox.set('focus', 3);

    // Add some data
    var data =
      view
      .interval({
        expr: function (emit, x, i, t) {
          emit(x, Math.sin(x + t));
        },
        width: 64,
        channels: 2,
      });
    
    // Draw a curve
    var curve =
      view
      .line({
        width: 5,
        color: '#3090FF',
      });

    // Draw some points
    var points =
      view
      .point({
        size: 8,
        color: '#3090FF',
      });
    
    
    // Draw ticks and labels
    var scale =
      view.scale({
        divide: 10,
      });
    
    var ticks =
      view.ticks({
        width: 5,
        size: 15,
        color: 'black',
      });
    
    var format =
      view.format({
        digits: 2,
        weight: 'bold',
      });

    var labels =
      view.label({
        color: 'red',
        zIndex: 1,
      });
          
    // Animate
    var play = mathbox.play({
      target: 'cartesian',
      pace: 5,
      to: 2,
      loop: true,
      script: [
        {props: {range: [[-2, 2], [-1, 1]]}},
        {props: {range: [[-4, 4], [-2, 2]]}},
        {props: {range: [[-2, 2], [-1, 1]]}},
      ]
    });
    var opacity=0.7;
    const planeMaterial = new MeshBasicMaterial({ transparent: true, opacity });
    const planeGeometry = new PlaneGeometry(this.WIDTH, this.HEIGHT);

    this.mesh = new THREE.Mesh(planeGeometry, planeMaterial);
    
    this.texture = new CanvasTexture(three.canvas);
    this.mesh.material.map = this.texture;
    console.log('sta je ovo sad?');
    console.log(this.mesh);
    //this.scene.add(this.mesh);

  }

   
  setupVR(){
    this.renderer.xr.enabled = true; 
    
    const self = this;
    function onSessionStart(){
      self.scene.add(self.mesh);
    }

    const btn = new ARButton( this.renderer, {onSessionStart});
  
    this.renderer.setAnimationLoop( this.render.bind(this) );
  }

  resize(){
  this.camera.aspect = window.innerWidth / window.innerHeight;
  this.camera.updateProjectionMatrix();
  this.renderer.setSize( window.innerWidth, window.innerHeight );  
  }

  render(){   
 const dt = this.clock.getDelta();
 this.stats.update();
 this.renderer.render( this.scene, this.camera );
  }
  
}

export {App};