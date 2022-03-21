import * as THREE from '../../libs/three/three.module.js';
import { BufferGeometryUtils } from '../../libs/three/jsm/BufferGeometryUtils.js';
import { ARButton } from '../../libs/ARButton.js';
import { CanvasUI } from '../../libs/CanvasUI.js'
import { LoadingBar } from '../../libs/LoadingBar.js';
import { GLTFLoader } from '../../libs/three/jsm/GLTFLoader.js';
import { DRACOLoader } from '../../libs/three/jsm/DRACOLoader.js';



class App5{
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
        console.log(THREE.sRGBEncoding);
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

    stylizeElement( element, active = true, fontSize = 13, ignorePadding = false ) {

        element.style.position = 'absolute';
        if (!ignorePadding) element.style.padding = '12px 6px';
        element.style.border = '1px solid #fff';
        element.style.borderRadius = '4px';
        element.style.background = (active) ? 'rgba(20,150,80,1)' : 'rgba(180,20,20,1)';
        element.style.color = '#fff';
        element.style.font = `normal ${fontSize}px sans-serif`;
        element.style.textAlign = 'center';
        element.style.opacity = '0.5';
        element.style.outline = 'none';
        element.style.zIndex = '999';
        element.style.textAlign = 'center';
    }

    initScene(){
        this.loadingBar51 = new LoadingBar();
        
        this.assetsPath = '../../assets/';
        const loader5 = new GLTFLoader().setPath(this.assetsPath);
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( '../../libs/three/js/draco/' );
        loader5.setDRACOLoader( dracoLoader );
        const self = this;

        loader5.load(
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
                console.log(self.coinH);
                self.coinH.material.map.minFilter = THREE.LinearMipMapLinearFilter;
                self.coinH.material.map.magFilter = THREE.LinearFilter;
                self.coinH.material.map.anisotropy = self.renderer.capabilities.getMaxAnisotropy();
               
                var prevMaterial = self.coinH.material;
                self.coinH.material = new THREE.MeshPhongMaterial();
                THREE.MeshBasicMaterial.prototype.copy.call( self.coinH.material, prevMaterial );

              
                /*texture.magFilter = THREE.NearestFilter;
                texture.minFilter = THREE.LinearMipMapLinearFilter;
                textureBack.magFilter = THREE.NearestFilter;
                textureBack.minFilter = THREE.LinearMipMapLinearFilter;*/
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

               if (self.sound!=undefined) self.loadingBar51.visible = false;
               else {alert ('Error Happened! Refresh the page!')};
			},
			// called while loading is progressing
			function ( xhr ) {
                if (xhr.loaded<xhr.total) 	self.loadingBar51.progress = (xhr.loaded / xhr.total);
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

        //ui3 is the canvas for going back 
        function back(){

            self.button1.style.visibility = 'visible';
            self.button2.style.visibility = 'visible';
            self.button3.style.visibility = 'visible';

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

        //creating buttons
        //button1 is calculate button
        const button1 = document.createElement( 'button' );
        button1.style.height = '40px';
        button1.style.display = '';
        button1.style.left = '4%';
        button1.style.top = '100px';
        button1.style.width = '100px';
        button1.style.cursor = 'pointer';
        button1.innerText = 'CALCULATE';
        button1.style.visibility = 'hidden';
        this.stylizeElement( button1, true, 12, true );

        const height = window.innerWidth/2 -50;
        const button2 = document.createElement( 'button' );
        button2.style.height = '40px';
        button2.style.display = '';
        button2.style.left = height.toString()+'px';
        button2.style.top = '100px';
        button2.style.width = '100px';
        button2.style.cursor = 'pointer';
        button2.innerText = 'INFO';
        button2.style.visibility = 'hidden';
        this.stylizeElement( button2, true, 25, true );

        const button3 = document.createElement( 'button' );
        button3.style.height = '40px';
        button3.style.display = '';
        button3.style.right = '4%';
        button3.style.top = '100px';
        button3.style.width = '100px';
        button3.style.cursor = 'pointer';
        button3.innerText = 'RESET';
        button3.style.visibility = 'hidden';
        this.stylizeElement( button3, true, 25, true );

        this.button1 = button1;
        this.button2 = button2;
        this.button3 = button3;
        document.body.appendChild( self.button1 );
        document.body.appendChild( self.button2 );
        document.body.appendChild( self.button3 );

        this.button1.onclick = function calculate (){
           
            self.button1.style.visibility = 'hidden';
            self.button2.style.visibility = 'hidden';
            self.button3.style.visibility = 'hidden';

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

       
        self.button2.onclick = function infobutton(){
            self.control = false;
            if (self.sound && self.sound.isPlaying) self.sound.stop();
            self.playSound('5theory');
        }

       
        self.button3.onclick =   function reset(){
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
       

        //ui1 is the reset button
        //ui2 is the button for calcuating the area!
        //ui4 is the info button
        
    }   

  

    
    setupXR(){
        this.renderer.xr.enabled = true;
        const self = this;
               
        const btn = new ARButton( self.renderer, { onSessionStart, sessionInit: { requiredFeatures: [ 'hit-test' ], optionalFeatures: [ 'dom-overlay' ], domOverlay: { root: document.body } } } );

        this.hitTestSourceRequested = false;
        this.hitTestSource = null;

        function onSessionStart(){

            const el = document.getElementById("text");
            self.el = el;
            if (self.el!=undefined) self.el.style.visibility = 'hidden';

            console.log(self.button1);
            self.button1.style.visibility = 'visible';
            self.button2.style.visibility = 'visible';
            self.button3.style.visibility = 'visible';

            self.sound.play();
           
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

            if (self.el!=undefined) self.el.style.visibility = 'visible';

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
            self.ui.mesh.visible = false;

            self.button1.style.visibility = 'hidden';
            self.button2.style.visibility = 'hidden';
            self.button3.style.visibility = 'hidden';

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
            this.mixer.update( dt ) 

        }

        this.renderer.render( this.scene, this.camera );
    }
}

export { App5 };
