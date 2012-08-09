var world = tQuery.createWorld().boilerplate().start();

//if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;

var start_time;

var camera, scene, renderer;

var uniforms1, uniforms2, material1, material2, mesh, meshes = [];

var mouseX = 0, mouseY = 0,
lat = 0, lon = 0, phy = 0, theta = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

init();

function init() {

	container = document.getElementById( 'container' );
	
	scene = world.scene();

	world.camera().position.z = 4;

	start_time = Date.now();

	uniforms2 = {
		time: { type: "f", value: 1.0 },
		resolution: { type: "v2", value: new THREE.Vector2() },
		texture: { type: "t", value: 0, texture: tQuery.createWebcamTexture() }
	};

	uniforms2.texture.texture.wrapS = uniforms2.texture.texture.wrapT = THREE.Repeat;

	var size = 0.75, mlib = [],
		params = [ [ 'fragment_shader2', uniforms2 ] ];

	for( var i = 0; i < params.length; i++ ) {

		material = new THREE.ShaderMaterial( {

			uniforms: params[ i ][ 1 ],
			vertexShader: document.getElementById( 'vertexShader' ).textContent,
			fragmentShader: document.getElementById( params[ i ][ 0 ] ).textContent

			} );

		mlib[ i ] = material;

		mesh = tQuery.createPlane( 1, 1, 300, 300, mlib[i] ).addTo(world);
		
		mesh.position.x = i - ( params.length - 1 ) / 2;
		mesh.position.y = i % 2 - 0.5;
		
		meshes[ i ] = mesh;

	}
	
	world.loop().hook(render);
}

function render() {

	uniforms2.time.value = ( Date.now() - start_time ) / 1000;

}