//import * as THREE from '../../libs/three/three.module.js';
/*import { OrbitControls } from '../../libs/three/jsm/OrbitControls.js';
import * as THREE from '../../libs/three/three.module.js';
import { OrbitControls } from '../../libs/three/jsm/OrbitControls.js';
import { Stats } from '../../libs/stats.module.js';
import { ARButton } from '../../libs/ARButton.js';
import { ControllerGestures } from '../../libs/ControllerGestures.js';
*/
class App{
	constructor(){

		const container = document.createElement( 'div' );
		document.body.appendChild( container );
    

    var mathbox = mathBox({
      plugins: ['core', 'controls', 'cursor', 'mathbox'],
      controls: {
        // Orbit controls, i.e. Euler angles, with gimbal lock
        klass: THREE.OrbitControls,

        // Trackball controls, i.e. Free quaternion rotation
        //klass: THREE.TrackballControls,
      },
    });
    if (mathbox.fallback) throw "WebGL not supported"
    
    var three = mathbox.three;
    three.renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);
    console.log("console log ");
    console.log(three.canvas);
    var mesh = new THREE.Mesh(new THREE.CubeGeometry(.5, .5, .5), new THREE.MeshNormalMaterial());
    three.scene.add(mesh);

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

	}	

}

export { App };