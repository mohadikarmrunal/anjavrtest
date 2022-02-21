import * as THREE from '../../libs/three/three.module.js';
import { BufferGeometryUtils } from '../../libs/three/jsm/BufferGeometryUtils.js';
import { ARButton } from '../../libs/ARButton.js';
import { CanvasUI } from '../../libs/CanvasUI.js'
import { LoadingBar } from '../../libs/LoadingBar.js';
import { GLTFLoader } from '../../libs/three/jsm/GLTFLoader.js';



class App{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 20 );
        
		this.scene = new THREE.Scene();
        this.scene.add(this.camera);

        this.clock = new THREE.Clock();


		const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 2);
        ambient.position.set( 0.5, 1, 0.25 );
		this.scene.add(ambient);
        
        const light = new THREE.DirectionalLight();
        light.position.set( 0.2, 1, 1);
        this.scene.add(light);
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.outputEncoding = THREE.sRGBEncoding;
		container.appendChild( this.renderer.domElement );
        
        const labelContainer = document.createElement('div');
        labelContainer.style.position = 'absolute';
        labelContainer.style.top = '0px';
        labelContainer.style.pointerEvents = 'none';
        labelContainer.setAttribute('id', 'container');
        container.appendChild(labelContainer);
        this.labelContainer = labelContainer;

        this.listener = new THREE.AudioListener();

        const sound = new THREE.Audio( this.listener );
        const audioLoader = new THREE.AudioLoader();
         audioLoader.load( 'audio/app5.mp3', ( buffer ) => {
          sound.setBuffer( buffer );
          sound.setLoop( false );
          sound.setVolume( 1.0 );
        });
       this.sound = sound;
       this.speech = new THREE.Audio( this.listener );

        
        this.workingVec3 = new THREE.Vector3();
        this.labels = [];
        this.measurements = [];
        this.coordinates = [];
        this.lines = [];
        this.newcoord = [];
        this.sidelength = [];

        this.control = true;

        /*var vekt1 = new THREE.Vector3(0,2,9);
        var vekt2 = new THREE.Vector3(13,2,7);
        var vekt3 = new THREE.Vector3(15,2,-9);
        /*var vekt4 = new THREE.Vector3(11,2,-6);
        var vekt5 = new THREE.Vector3(-2,2,-10);
        var vekt6 = new THREE.Vector3(-4,2,-3);
        var vekt7 = new THREE.Vector3(-7,2,4);
        var vekt12 = vekt1.clone();
        var vekt22 = vekt2.clone();
        var vekt32 = vekt3.clone();
        /*var vekt42 = vekt4.clone();
        var vekt52 = vekt5.clone();
        var vekt62 = vekt6.clone();
        var vekt72 = vekt7.clone();*/
    
        /*this.coordinates.push(vekt1);
        this.coordinates.push(vekt2);
        this.coordinates.push(vekt22);
        this.coordinates.push(vekt3);
        this.coordinates.push(vekt32);
        /*this.coordinates.push(vekt4);
        this.coordinates.push(vekt42);
        this.coordinates.push(vekt5);        
        this.coordinates.push(vekt52);
        this.coordinates.push(vekt6);
        this.coordinates.push(vekt62);
        this.coordinates.push(vekt7);
        this.coordinates.push(vekt72);
        this.coordinates.push(vekt12);
        //this.coordinates.push(new THREE.Vector3(-7,2,4));*/
    
        this.initScene();
        this.setupXR();
        
        this.renderer.setAnimationLoop( this.render.bind(this) );
		
		window.addEventListener('resize', this.resize.bind(this));
        
	}

    
    getCenterPoint(points) {
        let line = new THREE.Line3(...points)
        return line.getCenter( new THREE.Vector3() );
    }

    initLine(point) {
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x000000,
            linewidth: 5,
            linecap: 'round'
        });

        const lineGeometry = new THREE.BufferGeometry().setFromPoints([point, point]);
        return new THREE.Line(lineGeometry, lineMaterial);
    }

    updateLine(matrix, line) {
        const positions = line.geometry.attributes.position.array;
        positions[3] = matrix.elements[12]
        positions[4] = matrix.elements[13]
        positions[5] = matrix.elements[14]
        line.geometry.attributes.position.needsUpdate = true;
        line.geometry.computeBoundingSphere();
    }

    initReticle() {
        let ring = new THREE.RingBufferGeometry(0.045, 0.05, 32).rotateX(- Math.PI / 2);
        let dot = new THREE.CircleBufferGeometry(0.005, 32).rotateX(- Math.PI / 2);
        const reticle = new THREE.Mesh(
            BufferGeometryUtils.mergeBufferGeometries([ring, dot]),
            new THREE.MeshBasicMaterial()
        );
        reticle.material.color = new THREE.Color(0x000000);
        reticle.matrixAutoUpdate = false;
        reticle.visible = false;
        return reticle;
    }

    getDistance(points) {
        if (points.length == 2) return points[0].distanceTo(points[1]);
    }
    
    toScreenPosition(point, camera){
        const width = window.innerWidth;
        const height = window.innerHeight;
        const vec = this.workingVec3;
        
        vec.copy(point);
        vec.project(camera);

        vec.x = (vec.x + 1) * width /2;
        vec.y = (-vec.y + 1) * height/2;
        vec.z = 0;

        return vec

    }

    coordcheck(coordinates){
        const self = this;
        var newcoord1 = [];
        var length = coordinates.length;

        if (length>0){
            //multiply each axis-component with 100 to get the positions
            for (let i=0;i<length;i++){
                newcoord1[i]= new THREE.Vector2(coordinates[i].x*100,coordinates[i].z*100);
            }

            //check if they form a polygon
            if (newcoord1[0].distanceTo(newcoord1[length-1]) > 4) return 0;
           
            //fill the newcoord without double points
            for (let k=0;k<(length-1);k++) {
                self.newcoord.push(newcoord1[k]);
            }
        }
        else if (length=0) return 0;

        return 1;
    }

    area (coordinates){
        const self = this;
        var length = coordinates.length;
        
        if (length==3){
            var s = (self.sidelength[0]+self.sidelength[1]+self.sidelength[2])/2;
            return Math.floor(Math.sqrt(s*(s-self.sidelength[0])*(s-self.sidelength[1])*(s-self.sidelength[2])));

        }
        else if (length>3){
            console.log(length);
            var a = coordinates[0].x*(coordinates[1].y-coordinates[length-1].y)+coordinates[length-1].x*(coordinates[0].y-coordinates[length-2].y);

            for (let i=1;i<length-1;i++){
             a = a + coordinates[i].x*(coordinates[i+1].y-coordinates[i-1].y);
            }
            if (a>=0) return Math.floor(a/2);
            else return -Math.floor(a/2);
        }
        else return 0;

    }


    playSound( sndname ){
        // load a sound and set it as the Audio object's buffer
        const sound = this.speech;
        const self = this;
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load( `audio/${sndname}.mp3`, ( buffer ) => {
            if (sound.isPlaying) sound.stop();
            sound.setBuffer( buffer );
            sound.setLoop( false );
            sound.setVolume( 1.0 );
            sound.play();
        });
        if (sndname == '5theory')  self.sound1 = sound;
    }

    
    initScene(){
        this.loadingBar = new LoadingBar();
        
        this.assetsPath = '../../assets/';
        const loader = new GLTFLoader().setPath(this.assetsPath);
        const self = this;

        loader.load(
			// resource URL
			'TossHead.gltf',
			// called when the resource is loaded
			function ( gltf ) {

                self.animations = {};
                self.head = gltf.scene;

                if (gltf.scene.children[0].children[1].name == 'Coin'){
                    self.coinH = gltf.scene.children[0].children[1];
                    self.head.children[0].children[0].visible = false;
                }
                else {
                    self.coinH = gltf.scene.children[0].children[0];
                    self.head.children[0].children[1].visible = false;
                }
                
                self.animations['TossHead'] = gltf.animations[0];
                self.mixer = new THREE.AnimationMixer( self.coinH );
                const clip = self.animations['TossHead'];
                const action = self.mixer.clipAction (clip);
                action.enabled = true;
                self.action = action;
                self.head.visible=false;
				const scale = 0.05;
				self.head.scale.set(scale, scale, scale); 
                self.action.loop = THREE.LoopOnce;
                self.action.clampWhenFinished = true;


               if (self.sound!=undefined) self.loadingBar.visible = false;
               else {alert ('Error Happened! Refresh the page!')};

			},
			// called while loading is progressing
			function ( xhr ) {

				self.loadingBar.progress = (xhr.loaded / xhr.total);
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'An error happened with loading a 3D Object!' );
                alert('An error happened when loading 3D Objects. Refresh the page!');
			}
        );

        this.reticle = this.initReticle();
        this.scene.add( this.reticle );

        const boxgeometry = new THREE.BoxGeometry (1,0.01,1);
        const color = new THREE.Color(0x008a49);
		const material = new THREE.MeshStandardMaterial( { color: color});
        const boxmaterial = material.clone();
        boxmaterial.tranparent = true;
        boxmaterial.roughness = 0.08;
        boxmaterial.metalness = 0.8;
        boxmaterial.opacity = 0;
        boxmaterial.reflectivity = 0.5;
        boxmaterial.clearcoatRoughness = 1;
        boxmaterial.wireframe = true;

        this.floor = new THREE.Mesh (boxgeometry, boxmaterial);
        this.floor.visible = false;
        this.scene.add(this.floor);

      
        //ui is the main canvas that appears
        const config = {
            panelSize: { width: 0.5, height: 0.5 },
            body:{
                posiiton: {top:0},
                type:"text",
                textAlign: 'center',
                backgroundColor:'#ccc',
                fontColor:'#000',
                padding:50,
                fontSize:35,
            },
            result: {
                type:"text",
                textAlign: 'center',
                backgroundColor:'#ccc',
                fontColor:'#000',
                position: {top: 80},
                fontSize:35,
            },
            kordinate: { 
                type: "text", 
                position: {  top: 250 },
                textAlign: 'center',
                backgroundColor:'#ccc',
                fontColor:'#000',
                fontSize:30,},
        }

        const content = {
            body:"",
            result: "",
            kordinate: "",
        }

        const ui = new CanvasUI(content, config);
        this.ui = ui;
        this.ui.mesh.position.set(0,0,-0.6);
        this.ui.mesh.visible = false;


        //ui1 is the reset button
        function reset(){
            self.control = false;
            console.log('Button for reseting is pressed!');
            self.hitTestSourceRequested = false;
            self.hitTestSource = null;
            self.referenceSpace = null;
            self.floor.visible = false;

            //clear the arrays
            self.lines.forEach (element => self.scene.remove(element));
            self.labels.splice(0,self.labels.length);
            self.coordinates.splice(0,self.coordinates.length);
            self.newcoord.splice(0,self.newcoord.length);
            self.sidelength.splice(0,self.sidelength.length);
            self.measurements.splice(0,self.measurements.length);

            //remove length labels
            const collection = document.getElementsByClassName("label");
            const l = collection.length;
            console.log(collection);
            for (let i=0;i<l;i++){
                collection[l-1-i].parentElement.removeChild(collection[l-i-1]);
            }

            //update the main ui canvas
            self.ui.updateElement('body',"");            
            self.ui.updateElement('result',"");
            self.ui.updateElement('kordinate',"");

            //reset and remove animation
            self.scene.remove(self.head);
        }

        const config1 = {
            body: { clipPath: "M 77.2 104.4 A 1.6 1.6 90 0 0 448.4 354 A 1.6 1.6 90 0 0 82 102.8 Z", textAlign: "center" },
            reset: { clipPath: "M 77.2 104.4 A 1.6 1.6 90 0 0 448.4 354 A 1.6 1.6 90 0 0 82 102.8 Z" , type: "button", position:{ top: 0, left: 0 }, textAlign: "center", padding:120, fontColor: "#fff", backgroundColor: '#021', fontSize:80, hover: "#4c5ba6", onSelect: reset },
            renderer: this.renderer
        }

        const content1 = {
            reset: "     RESET",
        }

        //ui2 is the button for calcuating the area!
        function calculate (){
            self.control = false;
            self.scene.add(self.ui.mesh);
            self.camera.add(self.ui.mesh);
            self.ui.mesh.visible = true;

            self.scene.add(self.ui3.mesh);
            self.camera.add(self.ui3.mesh);
            self.ui3.mesh.visible = true;
            const x = self.coordcheck(self.coordinates);
            const n = self.area(self.newcoord)/100;

            if (self.coordinates.length==0){
                self.ui.updateElement('body',"An error happened!");
                self.ui.updateElement('result',"Click the reset button and try again!");

            }
            else if (x == 0) {
                self.ui.updateElement('body',"An error happened!");
                self.ui.updateElement('result',"Click the reset button and try again!");
                self.ui.updateElement('kordinate',"Polygon wasn't properly drawn! ");


            }
            else if (self.newcoord.length <= 2) {
                self.ui.updateElement('body',"An error happened!");
                self.ui.updateElement('result',"Click the reset button and try again!");
                self.ui.updateElement('kordinate',"Polygon wasn't properly drawn!");


            }
            else if (n>100) {
                self.ui.updateElement('body',"An error happened!");
                self.ui.updateElement('result',"Click the reset button and try again!");
                self.ui.updateElement('kordinate',"Polygon was drawn outside the boundary!");
            }
            else {self.ui.updateElement('result', "Probability of the coin falling in the selected area is " + n.toString()+"%");
            }
            
            console.log(self.coordinates);
            console.log (self.newcoord);
            console.log(self.area(self.newcoord));
        }
       
        const config2 = {
            body: { clipPath: "M 357.87 252 A 1.008 1.008 90 0 0 345 68 L 162.57 69.93 M 161.94 69.93 A 1.008 1.008 90 0 0 155.01 250.74 L 357.87 252 Z", textAlign: "center" },
            button: { clipPath: "M 357.87 252 A 1.008 1.008 90 0 0 345 68 L 162.57 69.93 M 161.94 69.93 A 1.008 1.008 90 0 0 155.01 250.74 L 357.87 252 Z", type: "button", position:{ top: 0, left: 0 }, padding:150, textAlign: "center", fontColor: "#fff", backgroundColor: '#021', fontSize:33, hover: "#4c5ba6", onSelect: calculate },
            renderer: this.renderer
        }

        const content2 = {
            button: "CALCULATE",
        }

        //ui4 is the info button
        function infobutton(){
            self.control = false;
            if (self.sound && self.sound.isPlaying) self.sound.stop();
            self.playSound('5theory');
        }

        const config4 = { 
            body: { clipPath: "M 77.2 104.4 A 1.6 1.6 90 0 0 448.4 354 A 1.6 1.6 90 0 0 82 102.8 Z", textAlign: "center" },
            info: { clipPath: "M 77.2 104.4 A 1.6 1.6 90 0 0 448.4 354 A 1.6 1.6 90 0 0 82 102.8 Z" , type: "button", position:{ top: 0, left: 0 }, textAlign: "center", padding:120, fontColor: "#fff", backgroundColor: '#021', fontSize:80, hover: "#4c5ba6", onSelect: infobutton },
            renderer: this.renderer
        }

        const content4 = {
            info: "   INFO",
        }

       
        const ui1 = new CanvasUI(content1, config1);
        this.ui1 = ui1;
        this.ui1.mesh.position.set(0.15,0.22,-0.7);
        this.ui1.mesh.scale.set(0.14,0.14,0.14);
        this.ui1.mesh.visible = false;

        const ui2 = new CanvasUI(content2, config2);
        this.ui2 = ui2;
        this.ui2.mesh.position.set(-0.14,0.18,-0.7);
        this.ui2.mesh.scale.set(0.25,0.25,0.25);
        this.ui2.mesh.visible = false;

        const ui4 = new CanvasUI(content4, config4);
        this.ui4 = ui4;
        this.ui4.mesh.position.set(0.02,0.22,-0.7);
        this.ui4.mesh.scale.set(0.14,0.14,0.14);
        this.ui4.mesh.visible = false;


        //ui3 is the canvas for going back 
        function back(){
            self.control = false;
            self.ui.mesh.visible = false;
            self.ui3.mesh.visible = false;

            self.scene.remove(self.ui.mesh);
            self.scene.remove(self.ui3.mesh);
            self.camera.remove(self.ui.mesh);
            self.camera.remove(self.ui3.mesh);

            self.ui.updateElement('body', "AREA IS");

            self.hitTestSourceRequested = false;
            self.hitTestSource = null;
            self.referenceSpace = null;
         
        }

        const config3 = {
            panelSize: { width: 0.035, height: 0.035 },
            back1: { type: "button", position:{ top: 0, left: 0 }, padding:15, fontColor: "#fff", backgroundColor: '#021', fontSize:20, hover: "#4c5ba6", onSelect: back },
            renderer: this.renderer
        }

        const content3 = {
            back1: "<path>M 76.8 245.76 L 414.72 76.8 L 414.72 414.72 Z</path>",
        }

        const ui3 = new CanvasUI(content3, config3);
        this.ui3 = ui3;
        this.ui3.mesh.position.set(0.15,0.15,-0.5);
        this.ui3.mesh.visible = false;
    }   

  

    
    setupXR(){
        this.renderer.xr.enabled = true;
        const self = this;

        /*var promise = new Promise(function(resolve, reject) {
            const sound = new THREE.Audio( self.listener );
            const audioLoader = new THREE.AudioLoader();
             audioLoader.load( 'audio/app5.mp3', ( buffer ) => {
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
        const btn = new ARButton( self.renderer, { onSessionStart, sessionInit: { requiredFeatures: [ 'hit-test' ], optionalFeatures: [ 'dom-overlay' ], domOverlay: { root: document.body } } } );
              console.log(result)}, function (error){    
                  console.log(error);
        });*/
        
       
        const btn = new ARButton( self.renderer, { onSessionStart, sessionInit: { requiredFeatures: [ 'hit-test' ], optionalFeatures: [ 'dom-overlay' ], domOverlay: { root: document.body } } } );

        this.hitTestSourceRequested = false;
        this.hitTestSource = null;

        function onSessionStart(){
            self.sound.play();
            self.ui1.mesh.visible = true;
            self.ui2.mesh.visible = true;
            self.ui4.mesh.visible = true;

            
            self.scene.add(self.ui1.mesh);
            self.scene.add(self.ui2.mesh);
            self.scene.add(self.ui4.mesh);
            self.camera.add(self.ui1.mesh);
            self.camera.add(self.ui2.mesh);
            self.camera.add(self.ui4.mesh);

           
        }
        
        function onSelect() {

            if (self.control){

                console.log("on select");

                if (self.reticle.visible){

                    if (self.floor.visible){
                        const pt = new THREE.Vector3();
                        pt.setFromMatrixPosition(self.reticle.matrix);
                        self.measurements.push(pt);
                        self.coordinates.push(pt);

                        if (self.measurements.length == 1) {
                            self.currentLine = self.initLine(self.measurements[0]);
                            self.lines.push(self.currentLine);
                            self.scene.add(self.currentLine);

                        } else if (self.measurements.length >= 2){

                            const distance1 = Math.floor((self.measurements[self.measurements.length-1]).distanceTo(self.measurements[0]) * 100);
                            const distance = Math.floor((self.measurements[self.measurements.length-1]).distanceTo(self.measurements[self.measurements.length-2]) * 100);
                            const text = document.createElement('div');
                            text.className = 'label';
                            text.style.color = 'rgb(255,255,255)';
                            text.textContent = distance + ' cm';
                            document.querySelector('#container').appendChild(text);
                            self.sidelength.push(distance);
                            self.labels.push({div: text, point: self.getCenterPoint([self.measurements[self.measurements.length-2],self.measurements[self.measurements.length-1]])});
                            
                            if (distance1>3){
                                self.currentLine = self.initLine(self.measurements[self.measurements.length-1]);
                                self.lines.push(self.currentLine);
                                self.scene.add(self.currentLine);
                            }
                            else{
                                self.currentLine = null;
                            }
                        }
                    }
                    else {
                        //show and set the floor
                        self.floor.visible = true;
                        //self.workingVec3.setFromMatrixPosition( self.reticle.matrix );
                        self.floor.position.setFromMatrixPosition( self.reticle.matrix );

                        //play the animation
                        self.head.position.setFromMatrixPosition( self.reticle.matrix );
                        self.head.visible = true;
                        self.action.reset();
                        self.scene.add(self.head);
                        self.action.play();
                    }
                }
            }
            self.control = true;
        }

        this.controller = this.renderer.xr.getController( 0 );
        this.controller.addEventListener( 'select', onSelect );
        
        this.scene.add( this.controller );    
    }
    
    requestHitTestSource(){
        const self = this;
        
        const session = this.renderer.xr.getSession();

        session.requestReferenceSpace( 'viewer' ).then( function ( referenceSpace ) {
            
            session.requestHitTestSource( { space: referenceSpace } ).then( function ( source ) {

                self.hitTestSource = source;

            } );

        } );

        session.addEventListener( 'end', function () {
            console.log('end');
            self.hitTestSourceRequested = false;
            self.hitTestSource = null;
            self.referenceSpace = null;
            self.floor.visible = false;
            self.control = true;

            //clear the arrays
            self.lines.forEach (element => self.scene.remove(element));
            self.labels.splice(0,self.labels.length);
            self.coordinates.splice(0,self.coordinates.length);
            self.newcoord.splice(0,self.newcoord.length);
            self.sidelength.splice(0,self.sidelength.length);
            self.measurements.splice(0,self.measurements.length);


            //remove length labels
            const collection = document.getElementsByClassName("label");
            const l = collection.length;
            console.log(collection);
            for (let i=0;i<l;i++){
                collection[l-1-i].parentElement.removeChild(collection[l-i-1]);
            }

            //update the main ui canvas
            self.ui.updateElement('body',"");            
            self.ui.updateElement('result',"");
            self.ui.updateElement('kordinate',"");

            self.ui3.mesh.visible = false;
            self.ui1.mesh.visible = false;
            self.ui4.mesh.visible = false;
            self.ui2.mesh.visible = false;
            self.ui.mesh.visible = false;

            self.scene.remove(self.ui1.mesh);
            self.scene.remove(self.ui4.mesh);
            self.camera.remove(self.ui1.mesh);
            self.camera.remove(self.ui4.mesh);

            self.scene.remove(self.head);
            self.reticle.visible = false;

            
            if (self.sound && self.sound.isPlaying) self.sound.stop();
            if (self.sound1 && self.sound1.isPlaying) self.sound1.stop();

        } );

        this.hitTestSourceRequested = true;

    }
    
    getHitTestResults( frame ){
        const hitTestResults = frame.getHitTestResults( this.hitTestSource );

        if ( hitTestResults.length ) {
            
            const referenceSpace = this.renderer.xr.getReferenceSpace();
            const hit = hitTestResults[ 0 ];
            const pose = hit.getPose( referenceSpace );

            this.reticle.visible = true;
            this.reticle.matrix.fromArray( pose.transform.matrix );
            
            if (this.currentLine) this.updateLine(this.reticle.matrix, this.currentLine);
                
        } else {

            this.reticle.visible = false;

        }

    }            

    resize(){ 
        this.camera.aspect = window.innerWidth / window.innerHeight;
    	this.camera.updateProjectionMatrix();
    	this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }	

    render( timestamp, frame ) {
        const dt = this.clock.getDelta();
        const self = this;
        
        if ( frame ) {

            if ( this.hitTestSourceRequested === false ) this.requestHitTestSource( )

            if ( this.hitTestSource ) this.getHitTestResults( frame );

        }
        
        this.labels.forEach( label => {
            const pos = self.toScreenPosition(label.point, self.renderer.xr.getCamera(self.camera));
            label.div.style.transform = `translate(-50%, -50%) translate(${pos.x}px,${pos.y}px)`;
        })

        if ( this.renderer.xr.isPresenting ) {
            this.ui.update();
            this.ui3.update();
            this.ui1.update();
            this.ui2.update();
            this.ui4.update();
            this.mixer.update( dt ) 

        }

        this.renderer.render( this.scene, this.camera );
    }
}

export { App };
