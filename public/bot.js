var keyState = {
	space: 0,
	down: 0
}
const tRexYMax = 93;
const obstacleYMax = 105;
const obstacleXMax = 600;
window.onload = function(){
	document.addEventListener("keydown", startProgram);
	document.addEventListener("keydown",updateKeyState);
	document.addEventListener("keyup",updateKeyState);

	window.spaceButton = document.querySelector("div#statusSpace div.square-content");
	window.downButton = document.querySelector("div#statusDown div.square-content");
};

function startProgram(e) {

	if (e.keyCode == 82) {

		startRecording();
	} else if (e.keyCode == 84) {
		if (data.samples.length > 0) {
			let orderedData = data.samples.map((sample, index) => {
				return {
					input: sample,
					output: data.labels[index]
				}
			});
		
			window.net = new brain.NeuralNetwork({
				activation: "relu", // activation function
				hiddenLayers: [10,10],
				iterations: 1000,
				learningRate: 0.2 // global learning rate, useful when training using streams
			});
			console.log("Training..");
			net.train(orderedData, {
				log: true,
				iterations: 4000,
				errorThresh: 0.005
			});
			console.log("Done!");
			download("var jsonNet = " + JSON.stringify(net.toJSON()), 'net.js', 'text/plain');
		} else {
			console.log("Empty training data!");
		}
	} else if (e.keyCode == 80) {
		if (typeof jsonNet !== 'undefined') {
			window.net = new brain.NeuralNetwork({
				activation: "relu", // activation function
				hiddenLayers: [10,10],
				iterations: 1000,
				learningRate: 0.5 // global learning rate, useful when training using streams
			});
			net.fromJSON(jsonNet);
			startPlaying();
		} else if (net != undefined) {
			startPlaying();
		} else {
			console.log("No neural network found! Please train one!");
		}
	}
}
	
function startRecording() {
	jump();
	data = {
		samples: [],
		labels: []
	}
	setTimeout(function(){
		console.log("Recording..");
		window.intervalID = setInterval(Record, 1/30);
	}, 2000);
}

function startPlaying() {
	jump();
	setTimeout(function(){
		console.log("Playing..");
		window.intervalID = setInterval(Play, 1/30);
	}, 2000);
}

function Record() {
	if (R.tRex.status == "CRASHED") {
		//download("var data = " + JSON.stringify(data), 'data.js', 'text/plain');
		clearInterval(window.intervalID);
	}
	let sample = getSample();
	let labels = [
		window.keyState.space,
		window.keyState.down
	];
	if (!arraysEqual(sample, data.samples[Math.max(0,data.samples.length-1)])) {
		data.samples.push(sample);
		data.labels.push(labels);
	}
}

/*
setInterval(function() {

}, 1/10);*/

function Play() {
	/* Programmed bot
	let cactus = ctx.getImageData(140, 125, 1, 1).data;
	let MidBird = ctx.getImageData(90, 85, 1, 1).data;
	let HighBird = ctx.getImageData(90, 60, 1, 1).data;
	if (cactus[0] == 83) {
		jump();
	}
	if (MidBird[0] == 83) {
		duck(200);
	}
	if (HighBird[0] == 83) {
		duck(400);
	}
	*/

	// Neural network bot
	let output = window.net.run(getSample());
	let keys = {
		space: output[0],
		down: output[1]
	}

	if (window.keyState.space == 0 && keys.space > 0.5) {
		let e = new Event('keydown');
		e.which = e.keyCode = 32;
		document.dispatchEvent(e);
	} else if (window.keyState.space == 1 && keys.space < 0.5) {
		let e = new Event('keyup');
		e.which = e.keyCode = 32;
		document.dispatchEvent(e);
	}

	if (window.keyState.down == 0 && keys.down > 0.5) {
		let e = new Event('keydown');
		e.which = e.keyCode = 40;
		document.dispatchEvent(e);
	} else if (window.keyState.down == 1 && keys.down < 0.5) {
		let e = new Event('keyup');
		e.which = e.keyCode = 40;
		document.dispatchEvent(e);
	}
}

function getSample() {
	return [
		//1-R.tRex.yPos/tRexYMax,
		//+ (R.tRex.status == "JUMPING"),
		//+ (R.tRex.status == "DUCKING"),
		//+ (R.tRex.status == "RUNNING"),
		R.horizon.obstacles[0] === undefined ? 0 : Math.max(0,1-R.horizon.obstacles[0].xPos/obstacleXMax),
		R.horizon.obstacles[0] === undefined ? 0 : Math.max(0,1-R.horizon.obstacles[0].yPos/obstacleYMax),
		R.horizon.obstacles[1] === undefined ? 0 : Math.max(0,1-R.horizon.obstacles[1].xPos/obstacleXMax),
		R.horizon.obstacles[1] === undefined ? 0 : Math.max(0,1-R.horizon.obstacles[1].yPos/obstacleYMax),
		/*R.horizon.obstacles[2] === undefined ? 0 : Math.max(0,1-R.horizon.obstacles[2].xPos/obstacleXMax),
		R.horizon.obstacles[2] === undefined ? 0 : Math.max(0,1-R.horizon.obstacles[2].yPos/obstacleYMax),*/
	];
}

function jump() {
	let e = new Event('keydown');
	e.which = e.keyCode = 32;
	document.dispatchEvent(e);
	setTimeout(function() {
		let e = new Event('keyup');
		e.which = e.keyCode = 32;
		document.dispatchEvent(e);
	}, 100);
}

function duck(pause) {
	let e = new Event('keydown');
	e.which = e.keyCode = 40;
	document.dispatchEvent(e);
	setTimeout(function() {
		let e = new Event('keyup');
		e.which = e.keyCode = 40;
		document.dispatchEvent(e);
	}, pause);
}


function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

function updateKeyState(e) {
	if (e.keyCode == 32) {
		window.keyState.space = e.type == "keydown" ? 1 : 0;
		spaceButton.style.background = e.type == "keydown" ? "rgb(83, 83, 83)" : "none";
		spaceButton.style.color = e.type == "keydown" ? "white" : "rgb(83, 83, 83)";
	} else if (e.keyCode == 40) {
		window.keyState.down = e.type == "keydown" ? 1 : 0;
		downButton.style.background = e.type == "keydown" ? "rgb(83, 83, 83)" : "none";
		downButton.style.color = e.type == "keydown" ? "white" : "rgb(83, 83, 83)";
	}
}

function arraysEqual(arr1, arr2) {
	if (arr2 == undefined || arr1 == undefined){
		return false;
	}
    for(var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    }
    return true;
}