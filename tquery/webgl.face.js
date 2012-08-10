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

	world.camera().position.z = 2;

	start_time = Date.now();

	uniforms = {
		time: { type: "f", value: 1.0 },
		resolution: { type: "v2", value: new THREE.Vector2() },
		texture: { type: "t", value: 1, texture: tQuery.createWebcamTexture() },
		
		face_width: { type: "i", value: 1 },
		face_height: { type: "i", value: 1 },
		
		face_num_stages: { type: "i", value: 0 },
		face_stage_thresholds: { type: "fv1", value: [] },
		face_stage_num_features: { type: "iv1", value: [] },
		face_stage_alphas: { type: "fv1", value: [] },
		
		face_stage_feature_sizes: { type: "iv1", value: [] },
		face_stage_feature_nx: { type: "iv1", value: [] },
		face_stage_feature_ny: { type: "iv1", value: [] },
		face_stage_feature_nz: { type: "iv1", value: [] },
		face_stage_feature_px: { type: "iv1", value: [] },
		face_stage_feature_py: { type: "iv1", value: [] },
		face_stage_feature_pz: { type: "iv1", value: [] },
	};
	
	uniforms.face_width.value = cascade.width;
	uniforms.face_height.value = cascade.height;
	uniforms.face_num_stages.value = cascade.count;
	for(var n = 0; n < cascade.count; n++)
	{
		// For each stage classifier
		var stage = cascade.stage_classifier[n];
		uniforms.face_stage_thresholds.value.push(stage.threshold);
		uniforms.face_stage_num_features.value.push(stage.count);
		for(var f = 0; f < stage.count; f++)
		{
			// For each feature
			var feature = stage.feature[f];
			uniforms.face_stage_feature_sizes.value.push(feature.size);
			Array.prototype.push.apply(uniforms.face_stage_feature_nx.value, feature.nx);
			Array.prototype.push.apply(uniforms.face_stage_feature_ny.value, feature.ny);
			Array.prototype.push.apply(uniforms.face_stage_feature_nz.value, feature.nz);
			Array.prototype.push.apply(uniforms.face_stage_feature_px.value, feature.px);
			Array.prototype.push.apply(uniforms.face_stage_feature_py.value, feature.py);
			Array.prototype.push.apply(uniforms.face_stage_feature_pz.value, feature.pz);
			
			// Add two alpha's
			uniforms.face_stage_alphas.value.push(stage.alpha[f*2], stage.alpha[f*2+1]);
		}
	}
	
	// N stage_classifiers
	// - N: threshold
	// - N: feature_count
	// - N: array met feature_size's
	// - N: feature data met nx, ny, ... => 6*feature_size*feature_count
	// - N: alphas size van feature_count * 2

	uniforms.texture.texture.wrapS = uniforms.texture.texture.wrapT = THREE.Repeat;

	// Shader material
	material = new THREE.ShaderMaterial( {
		uniforms: uniforms,
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragment_shader2' ).textContent
	} );
	
	// Plane displaying material
	mesh = tQuery.createPlane( 1, 1, 320, 240, material ).addTo(world);
	
	// Loop
	world.loop().hook(render);
}

function render() {

	uniforms.time.value = ( Date.now() - start_time ) / 1000;

}