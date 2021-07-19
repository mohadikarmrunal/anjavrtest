import * as THREE from '../../libs/three/three.module.js';
import { OrbitControls } from '../../libs/three/jsm/OrbitControls.js';
import * as myMod from '../../build/mathbox-bundle.js';

class App{
    constructor(){
        const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
		this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
		this.camera.position.set( 0, 40, 20);
        
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
		
        
        const controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.renderer.setAnimationLoop(this.render.bind(this));
    
        window.addEventListener('resize', this.resize.bind(this) );
    
        console.log('THIS JUST FUCKING WORKED');
            
        // MathBox context

        var context = new mathBox.Context(this.renderer, this.scene, this.camera).init();
        var mathbox = context.api;

        // Set size
        //context.resize({ viewWidth: WIDTH, viewHeight: HEIGHT });

        // Place camera and set background
        //renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);

        // MathBox elements
        view = mathbox
        .set({
        focus: 3,
        })
        .cartesian({
        range: [[-2, 2], [-1, 1], [-1, 1]],
        scale: [2, 1, 1],
        });
        // ...

        // Render frames
        /*var frame = function () {
        requestAnimationFrame(frame);
        context.frame();
        renderer.render(scene, camera);
        };
        requestAnimationFrame(frame);
        */

          colors = {
            x: new THREE.Color(0xFF4136),
            y: new THREE.Color(0x2ECC40),
            z: new THREE.Color(0x0074D9)
          };
      
          view = mathbox
          .set({
            scale: 720,
            focus: 1
          })
          .cartesian({
            range: [[-2, 2], [-1, 1], [-1, 1]],
            scale: [2, 1, 1],
          });
          view.axis({
            color: colors.x,
          });
          view.axis({
            axis: 2, // "y" also works
            color: colors.y,
          });
          view.axis({
            axis: 3,
            color: colors.z,
          });
      
          mathbox.select('axis')
            .set('end', true)
            .set('width', 5)
            .bind('depth', function(t){
                return .5 + .5 * Math.sin(t * .5);
            })
      
          view.array({
            id: "colors",
            live: false,
            data: [colors.x, colors.y, colors.z].map(function (color){
              return [color.r, color.g, color.b, 1];
            }),
          });
      
          view.array({
            data: [[2,0,0], [0,1.11,0], [0,0,1]],
            channels: 3, // necessary
            live: false,
          }).text({
            data: ["x", "y", "z"],
          }).label({
            color: 0xFFFFFF,
            colors: "#colors",
          });

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