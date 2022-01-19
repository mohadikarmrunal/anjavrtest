import * as THREE from '../../libs/three/three.module.js';
import { BufferGeometryUtils } from '../../libs/three/jsm/BufferGeometryUtils.js';
import { ARButton } from '../../libs/ARButton.js';
import { CanvasUI } from '../../libs/CanvasUI.js'


class App{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 20 );
		this.camera.position.set( 0, 1.6, 3 );
        
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
        
        this.initScene();
        this.setupXR();
        
        this.renderer.setAnimationLoop( this.render.bind(this) );
		
		window.addEventListener('resize', this.resize.bind(this));
        
	}

    setEnvironment(){
        const loader = new RGBELoader().setDataType( THREE.UnsignedByteType );
        const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
        pmremGenerator.compileEquirectangularShader();
        
        const self = this;
        
        loader.load( '../../assets/venice_sunset_1k.hdr', ( texture ) => {
          const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
          pmremGenerator.dispose();

          self.scene.environment = envMap;

        }, undefined, (err)=>{
            console.error( 'An error occurred setting the environment');
        } );
    }
	
    resize(){ 
        this.camera.aspect = window.innerWidth / window.innerHeight;
    	this.camera.updateProjectionMatrix();
    	this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }	
    
    getCenterPoint(points) {
        let line = new THREE.Line3(...points)
        return line.getCenter( new THREE.Vector3() );
    }

    initLine(point) {
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
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

    area (coordinates){
        const self = this;
        var length = coordinates.length;
        var a = coordinates[0].x*(coordinates[1].z-coordinates[length-1].z)+coordinates[length-1].x*(coordinates[0].z-coordinates[length-2].z);

        for (let i=1;i<l-1;i++){
            a = a + coordinates[i].x*(coordinates[i+1].z-coordinates[i-1].z);
        }
        if (a>=0) return a/2;
        else return -a/2;
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

        function back(){
            self.ui2.mesh.visible = false;
            self.ui1.mesh.visible = false;

            self.hitTestSourceRequested = false;
            self.hitTestSource = null;
            self.referenceSpace = null;
            self.floor.visible = false;

            self.lines.forEach (element => self.scene.remove(self.element));
        }

        const config2 = {
            panelSize: { width: 0.035, height: 0.035 },
            back1: { type: "button", position:{ top: 0, left: 0 }, padding:15, fontColor: "#fff", backgroundColor: '#021', fontSize:20, hover: "#4c5ba6", onSelect: back },
            renderer: this.renderer
        }

        const content2 = {
            back1: "<path>M 76.8 245.76 L 414.72 76.8 L 414.72 414.72 Z</path>",
        }

        const config1 = {
            panelSize: { width: 0.5, height: 0.5 },
            body:{
                textAlign: 'center',
                backgroundColor:'#ccc',
                fontColor:'#000',
                padding:50,
                fontSize:45,
            },
        }

        const content1 = {
            body: "",
        }

        const ui1 = new CanvasUI(content1, config1);
        this.ui1 = ui1;
        this.ui1.mesh.position.set(0,0,-0.6);
        this.ui1.mesh.visible = false;

        const ui2 = new CanvasUI(content2, config2);
        this.ui2 = ui2;
        this.ui2.mesh.position.set(-0.15,0.145,-0.5);
        this.ui2.mesh.visible = false;
        

        function calculate (){
            self.ui1.mesh.visible = true;
            self.ui2.mesh.visible = true;
            self.ui1.updateElement('body', "AREA IS" + self.area(self.coordinates).toString());
        }
        //goback button1
        const config = {
            panelSize: { width: 0.035, height: 0.035 },
            button: { type: "button", position:{ top: 0, left: 0 }, padding:15, fontColor: "#fff", backgroundColor: '#021', fontSize:20, hover: "#4c5ba6", onSelect: calculate },
            renderer: this.renderer
        }

        const content = {
            button: "CALCULATE!",
        }

        const ui = new CanvasUI(content, config);
        this.ui = ui;
        this.ui.mesh.position.set(-0.15,0.145,-0.5);
        this.ui.mesh.visible = false;
    }   

  

    
    setupXR(){
        this.renderer.xr.enabled = true;
        
        const btn = new ARButton( this.renderer, { sessionInit: { requiredFeatures: [ 'hit-test' ], optionalFeatures: [ 'dom-overlay' ], domOverlay: { root: document.body } } } );
        
        const self = this;

        this.hitTestSourceRequested = false;
        this.hitTestSource = null;
        
        function onSelect() {

            self.ui.mesh.visible = true;

            self.scene.add(self.ui1.mesh);
            self.camera.add(self.ui1.mesh);
            self.scene.add(self.ui2.mesh);
            self.camera.add(self.ui2.mesh);
            self.scene.add(self.ui.mesh);
            self.camera.add(self.ui.mesh);

            if (self.reticle.visible){
                if (self.floor.visible){
                    const pt = new THREE.Vector3();
                    pt.setFromMatrixPosition(self.reticle.matrix);
                    self.measurements.push(pt);
                    self.coordinates.push(pt);
                    if (self.measurements.length == 2) {
                        const distance = Math.round(self.getDistance(self.measurements) * 100);

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

            self.ui1.mesh.visible = false;
            self.scene.remove(self.ui1.mesh);
            self.camera.remove(self.ui1.mesh);

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
            this.ui1.update();
            this.ui2.update();
        }
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };
