import * as THREE from '../../libs/three/three.module.js';
import { OrbitControls } from '../../libs/three/jsm/OrbitControls.js';

class App{
	constructor(){

        const container = document.createElement( 'div' );
		document.body.appendChild( container );


		this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
		this.camera.position.set( 0, 40, 20);

		this.scene = new THREE.Scene();
        //this.scene.background = new THREE.Color( 0xaaaaaa );


		const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.3);
		this.scene.add(ambient);
        
        const light = new THREE.DirectionalLight();
        light.position.set( 0.2, 1, 1);
        this.scene.add(light);

        
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		container.appendChild( this.renderer.domElement );

        const controls = new OrbitControls( this.camera, this.renderer.domElement );

        var WIDTH = 640;
        var HEIGHT = 480;
        // MathBox context
        var context = new MathBox.Context(this.renderer, this.scene, this.camera).init();
        this.mathbox = context.api;

        // Set size
        //renderer.setSize(WIDTH, HEIGHT);
        context.resize({ viewWidth: WIDTH, viewHeight: HEIGHT });

        // Place camera and set background
        //camera.position.set(0, 0, 3);
        this.renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);

        // MathBox elements
        var view = this.mathbox
        .set({
        focus: 3,
        })
        .cartesian({
        range: [[-2, 2], [-1, 1], [-1, 1]],
        scale: [2, 1, 1],
        });

        view.axis({
        detail: 30,
        });

        view.axis({
        axis: 2,
        });
        
        view.scale({
        divide: 10,
        })
        view.ticks({
        classes: ['foo', 'bar'],
        width: 2
        });

        view.grid({
        divideX: 30,
        width: 1,
        opacity: 0.5,
        zBias: -5,
        });

        view.interval({
        id: 'sampler',
        width: 64,
        expr: function (emit, x, i, t) {
            emit(x, Math.sin(x + t));
        },
        channels: 2,
        });

        view.line({
        points: '#sampler',
        color: 0x3090FF,
        width: 5,
        });
        console.log (this.mathbox._context);

        /*var frame = function () {
        context.frame();
        this.renderer.render(scene, camera);
        };*/

        //requestAnimationFrame(frame);
   
        this.renderer.setAnimationLoop(this.render.bind(this));
    
        window.addEventListener('resize', this.resize.bind(this) );
   
  }

    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }
    
    render( ) {   
        this.renderer.render( this.scene, this.camera );
    }


}

export { App };