import * as THREE from '../../libs/three/three.module.js';
import { BufferGeometryUtils } from '../../libs/three/jsm/BufferGeometryUtils.js';
import { ARButton } from '../../libs/ARButton.js';
import { CanvasUI } from '../../libs/CanvasUI.js'


class App{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 20 );
		//this.camera.position.set( 0, 1.6, 3 );
        
		this.scene = new THREE.Scene();

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
        
        this.workingVec3 = new THREE.Vector3();
        this.labels = [];
        this.measurements = [];
        this.coordinates = [];
        this.lines = [];
        this.newcoord = [];

        /*var vekt1 = new THREE.Vector3(0,2,9);
        var vekt2 = new THREE.Vector3(13,2,7);
        var vekt3 = new THREE.Vector3(15,2,-9);
        var vekt4 = new THREE.Vector3(11,2,-6);
        var vekt5 = new THREE.Vector3(-2,2,-10);
        var vekt6 = new THREE.Vector3(-4,2,-3);
        var vekt7 = new THREE.Vector3(-7,2,4);
        var vekt12 = vekt1.clone();
        var vekt22 = vekt2.clone();
        var vekt32 = vekt3.clone();
        var vekt42 = vekt4.clone();
        var vekt52 = vekt5.clone();
        var vekt62 = vekt6.clone();
        var vekt72 = vekt7.clone();
    
        this.coordinates.push(vekt1);
        this.coordinates.push(vekt2);
        this.coordinates.push(vekt22);
        this.coordinates.push(vekt3);
        this.coordinates.push(vekt32);
        this.coordinates.push(vekt4);
        this.coordinates.push(vekt42);
        this.coordinates.push(vekt5);        
        this.coordinates.push(vekt52);
        this.coordinates.push(vekt6);
        this.coordinates.push(vekt62);
        this.coordinates.push(vekt7);
        this.coordinates.push(vekt72);
        this.coordinates.push(vekt12);
        //this.coordinates.push(new THREE.Vector3(-7,2,4));*/

        /*const self = this;
        console.log(this.coordinates);
        if (this.coordcheck(this.coordinates) == 1){
            console.log(self.newcoord);
        }
        else console.log("Polygon is bad!");*/

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
        //multiply each axis-component with 100 to get the positions
        for (let i=0;i<length;i++){
            newcoord1[i]= new THREE.Vector2(coordinates[i].x*100,coordinates[i].z*100);
        }

        //check if they form a polygone
        if (newcoord1[0].distanceTo(newcoord1[length-1]) > 4) return 0;
        for (let j=1;j<(length-1);j=j+2){
            
            if (newcoord1[j].distanceTo(newcoord1[j+1]) > 4) {
                return 0;
            }
        }
        
        //fill the newcoord without double point
        for (let k=0;k<(length-1);k=k+2) {
            self.newcoord.push(newcoord1[k]);
        }
        return 1;
    }

    area (coordinates){
        const self = this;
        var length = coordinates.length;

        if (length>2){
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
    
    initScene(){
        const self = this;
        
        this.reticle = this.initReticle();
        this.scene.add( this.reticle );

        const boxgeometry = new THREE.BoxGeometry (1,0.01,1);
        const color = new THREE.Color ("rgb(11, 9, 36) ");
		const material = new THREE.MeshStandardMaterial( { color: color});
        const boxmaterial = material.clone();
        boxmaterial.tranparent = true;
        boxmaterial.opacity = 0.1;

        this.floor = new THREE.Mesh (boxgeometry, boxmaterial);
        this.floor.visible = false;
        this.scene.add(this.floor);

      
        //ui is the main canvas that appears
        const config = {
            panelSize: { width: 0.5, height: 0.5 },
            body:{
                type:"text",
                textAlign: 'center',
                backgroundColor:'#ccc',
                fontColor:'#000',
                padding:50,
                fontSize:45,
            },
            //image: { type: "img", position: { left: 0, top: 0 }},
        }

        const content = {
            //image: "../../assets/theory12.png",
            body:""
        }

        const ui = new CanvasUI(content, config);
        this.ui = ui;
        this.ui.mesh.position.set(0,0,-0.6);
        self.ui.mesh.visible = false;


        //ui1 is the reset button
        function reset(){
            console.log('Button for reseting is pressed!');
            self.hitTestSourceRequested = false;
            self.hitTestSource = null;
            self.referenceSpace = null;
            self.floor.visible = false;
            self.lines.forEach (element => self.scene.remove(self.element));
            //DODATI DA SE OBRISU CM BROJEVI
        }

        const config1 = {
            panelSize: { width: 0.035, height: 0.035 },
            reset: { type: "button", position:{ top: 0, left: 0 }, padding:15, fontColor: "#fff", backgroundColor: '#021', fontSize:20, hover: "#4c5ba6", onSelect: reset },
            renderer: this.renderer
        }

        const content1 = {
            reset: "RESET!",
        }

        //ui2 is the button for calcuating the area!
        function calculate (){
            self.scene.add(self.ui.mesh);
            self.ui.mesh.visible = true;

            self.scene.add(self.ui3.mesh);
            self.ui3.mesh.visible = true;

            ;
            
            if (self.coordcheck(self.coordinates) == 0){
                self.ui.updateElement('body',"An error apeared with the polygon! Reset the app and try again!");
            }
            else  self.ui.updateElement('body', "AREA IS " + self.area(self.newcoord).toString()+", length ="+(self.newcoord.length).toString()+", first point is ("+ (Math.floor(self.newcoord[0].x)).toString()+","+(Math.floor(self.newcoord[0].y)).toString()+"); "+"second point is ("+(Math.floor(self.newcoord[1].x)).toString()+","+(Math.floor(self.newcoord[1].y)).toString()+");"+"third point is ("+(Math.floor(self.newcoord[2].x)).toString()+","+(Math.floor(self.newcoord[2].y)).toString()+");");

            console.log(self.coordinates);
            console.log (self.newcoord);
            console.log(self.area(self.newcoord));
        }
       
        const config2 = {
            panelSize: { width: 0.035, height: 0.035 },
            button: { type: "button", position:{ top: 0, left: 0 }, padding:15, fontColor: "#fff", backgroundColor: '#021', fontSize:20, hover: "#4c5ba6", onSelect: calculate },
            renderer: this.renderer
        }

        const content2 = {
            button: "CALC!",
        }

       
        const ui1 = new CanvasUI(content1, config1);
        this.ui1 = ui1;
        this.ui1.mesh.position.set(0,0.1,-0.7);
        this.ui1.mesh.scale.set(2,2,2);
        this.ui1.mesh.visible = false;

        const ui2 = new CanvasUI(content2, config2);
        this.ui2 = ui2;
        this.ui2.mesh.position.set(-0.15,0.1,-0.7);
        this.ui2.mesh.scale.set(2,2,2);
        this.ui2.mesh.visible = false;


        //ui3 is the canvas for going back 
        function back(){
            self.ui.mesh.visible = false;
            self.ui3.mesh.visible = false;

            self.scene.remove(self.ui.mesh);
            self.scene.remove(self.ui3.mesh);
            self.ui.updateElement('body', "AREA IS");

            self.hitTestSourceRequested = false;
            self.hitTestSource = null;
            self.referenceSpace = null;
            self.floor.visible = false;
            self.lines.forEach (element => self.scene.remove(self.element));
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
        
        const btn = new ARButton( this.renderer, { onSessionStart, sessionInit: { requiredFeatures: [ 'hit-test' ], optionalFeatures: [ 'dom-overlay' ], domOverlay: { root: document.body } } } );
        
       

        this.hitTestSourceRequested = false;
        this.hitTestSource = null;

        function onSessionStart(){
            console.log("on sessionstart happened");

            self.ui1.mesh.visible = true;
            self.ui2.mesh.visible = true;
            
            self.scene.add(self.ui1.mesh);
            self.scene.add(self.ui2.mesh);
           
        }
        
        function onSelect() {
            if (self.reticle.visible){
                if (self.floor.visible){
                    const pt = new THREE.Vector3();
                    pt.setFromMatrixPosition(self.reticle.matrix);
                    self.measurements.push(pt);
                    self.coordinates.push(pt);
                    if (self.measurements.length == 2) {
                        const distance = Math.floor(self.getDistance(self.measurements) * 100);

                        const text = document.createElement('div');
                        text.className = 'label';
                        text.style.color = 'rgb(255,255,255)';
                        text.textContent = distance + ' cm';
                        document.querySelector('#container').appendChild(text);

                        self.labels.push({div: text, point: self.getCenterPoint(self.measurements)});

                        self.measurements = [];
                        self.currentLine = null;
                    } else {
                        self.currentLine = self.initLine(self.measurements[0]);
                        self.lines.push(self.currentLine);
                        self.scene.add(self.currentLine);
                    }
                }
                else {
                    self.floor.visible = true;
                     //self.workingVec3.setFromMatrixPosition( self.reticle.matrix );
                    self.floor.position.setFromMatrixPosition( self.reticle.matrix );
                }
            }

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

            self.hitTestSourceRequested = false;
            self.hitTestSource = null;
            self.referenceSpace = null;
            self.floor.visible = false;
            
            self.ui3.mesh.visible = false;
            self.ui1.mesh.visible = false;
            self.ui2.mesh.visible = false;
            self.ui.mesh.visible = false;


            self.scene.remove(self.ui1.mesh);
            

            self.lines.forEach (element => self.scene.remove(self.element));

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
        }

        this.renderer.render( this.scene, this.camera );
    }
}

export { App };
