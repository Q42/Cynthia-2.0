var start_time;

var world, uniforms, material, mesh;

var mouseX = 0, mouseY = 0,
lat = 0, lon = 0, phy = 0, theta = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

init(cascade, 5, 1);

/** 
 * Insert classifier data into the shader program
 *
 * include "// INSERT_CLASSIFIERS" in the program 
 * to get it replaced by the data
 */
function insertClassifiers(shader, cascade, uniforms) {
	var push = Array.prototype.push.apply;
	
	var vars = [], main = [], stages = [];
	
	function u(k){ return uniforms[k].value; }
		
	for(var i = 1; i < 6; i++)
		vars.push("float haarFeature"+i+"(  ){ return 0.0; }");
		
	main.push(
		//"uniform sampler2D pyr[ "+( u('max_scale') + u('next') * 2 ) * 4 +" ];",
		//"uniform sampler2D ret[ "+( u('max_scale') + u('next') * 2 ) * 4 +" ];"
	);
	
	main.push("if(1.0 == 1.0){");
	for(var s = 1; s <= cascade.count; s++){
		var stage = cascade.stage_classifier[s-1];
		
		main.push("if (!stage"+s+"()){ \n\tdiscard; \n}");
		
		stages.push(
			"bool stage"+s+"(){",
			"	float r = 0.0;", // Placeholder for the sum of the features
			"	float t = "+stage.threshold+";" // Threshold
		);
		for(var f = 0; f < stage.count; f++){
			var feat = stage.feature[f];
			stages.push(
			//	"	r += haarFeature"+feat.size+"();"
			);
		}
		stages.push(
			"	return r>t;",
			"}"
		);
	}
	main.push("}");
	
	shader = shader.replace("// INSERT_CLASSIFIERS", vars.join("\n"));
	shader = shader.replace("// INSERT_STAGES", 	 stages.join("\n"));
	shader = shader.replace("// INSERT_STAGE_CALLS", main.join("\n"));
	console.log(shader);
	return shader;
}

/**
 * Initialize world
 */
function init(cascade, interval, min_neighbors) {
	var world = tQuery.createWorld().boilerplate().start();
	var w = 320, h = 240;
	
	world.camera().position.z = 1.7;

	start_time = Date.now();

	uniforms = {
		time: { type: "f", value: 1.0 },
		resolution: { type: "v2", value: new THREE.Vector2(w, h) },
		size: { type: "i", value: w*h },
		
		// Following ccv.js the following shared's:
		texture: { type: "t", value: 1, texture: tQuery.createWebcamTexture() },
		interval: { type: "i", value: interval },
		min_neighbors: { type: "i", value: min_neighbors },
		scale: { type: "i", value: 1 },
		next: { type: "i", value: 1 },
		max_scale: { type: "i", value: 1 }
	};
	
	uniforms.scale.value = Math.pow(2, 1 / (interval + 1));
	uniforms.next.value = interval + 1;
	uniforms.max_scale.value = Math.floor(Math.log(Math.min(w / cascade.width, h / cascade.height)) / Math.log(uniforms.scale.value));

//	uniforms.texture.texture.wrapS = uniforms.texture.texture.wrapT = THREE.Repeat;

	var shaders = [
		document.getElementById( 'vertexShader' ).textContent,
		document.getElementById( 'fragmtShader' ).textContent
	];
	shaders[1] = insertClassifiers(shaders[1], cascade, uniforms);

	// Shader material
	material = new THREE.ShaderMaterial( {
		uniforms: uniforms,
		vertexShader: shaders[0],
		fragmentShader: shaders[1]
	} );
	
	// Plane displaying material
	mesh = tQuery.createPlane( w/h, 1, 1, 1, material ).addTo(world);
	
	// Loop
	world.loop().hook(render);
}

function render() {

	uniforms.time.value = ( Date.now() - start_time ) / 1000;

}