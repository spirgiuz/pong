// RequestAnimFrame: a browser API for getting smooth animations
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       || 
		window.webkitRequestAnimationFrame || 
		window.mozRequestAnimationFrame    || 
		window.oRequestAnimationFrame      || 
		window.msRequestAnimationFrame     ||  
		function( callback ){
			return window.setTimeout(callback, 1000 / 60);
		};
})();

window.cancelRequestAnimFrame = ( function() {
	return window.cancelAnimationFrame          ||
		window.webkitCancelRequestAnimationFrame    ||
		window.mozCancelRequestAnimationFrame       ||
		window.oCancelRequestAnimationFrame     ||
		window.msCancelRequestAnimationFrame        ||
		clearTimeout
} )();


// Initialize canvas and required variables
var canvas = document.getElementById("canvas"),
		ctx = canvas.getContext("2d"), // Create canvas context
		W = window.innerWidth-100, // Window's width
		H = window.innerHeight-100, // Window's height
		particles = [], // Array containing particles
		ball = {}, // Ball object
		paddles = [2], // Array containing two paddles
		mouse = {}, // Mouse object to store it's current position
		points = 0, // Varialbe to store points
		fps = 60, // Max FPS (frames per second)
		particlesCount = 20, // Number of sparks when ball strikes the paddle
		flag = 0, // Flag variable which is changed on collision
		particlePos = {}, // Object to contain the position of collision 
		multipler = 1, // Varialbe to control the direction of sparks
		startBtn = {}, // Start button object
		restartBtn = {}, // Restart button object
		mapBtn={},
		speedBtn={},
		over = 0, // flag varialbe, cahnged when the game is over
		init, // variable to initialize animation
		inc=10, // increment of paddles
		key1up=false,
		key1down=false,
		key2up=false,
		key2down=false,
		p1pts=0,
		p2pts=0,
		paddleHit;


// Add mousemove and mousedown events to the canvas
canvas.addEventListener("mousemove", trackPosition, true);
canvas.addEventListener("mousedown", btnClick, true);

function handleDown(e) {
		switch(e.keyCode) {
		case 81:
			key2up=true;
		break;
		case 87:
			key2down=true;
		break;
		case 79:
			key1up=true;
		break;
		case 80:
			key1down=true;
		break;
		}
}
function handleUp(e) {
		switch(e.keyCode) {
		case 81:
			key2up=false;
		break;
		case 87:
			key2down=false;
		break;
		case 79:
			key1up=false;
		break;
		case 80:
			key1down=false;
		break;
		}
}

window.addEventListener('keydown', handleDown, true);
window.addEventListener('keyup', handleUp, true);
// Initialise the collision sound
collision = document.getElementById("collide");

// Set the canvas's height and width to full screen
canvas.width = W;
canvas.height = H;

// Function to paint canvas
function paintCanvas() {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, W, H);
}

// Function for creating paddles
function Paddle(pos) {
	// Height and width
	this.w = 5;
	this.h = 150;
	
	// Paddle's position
	this.y = H/2 - this.h/2;
	this.x = (pos == "top") ? 50 : W - this.w-50;
	this.pos=pos;
	
}

// Push two new paddles into the paddles[] array
paddles.push(new Paddle("bottom"));
paddles.push(new Paddle("top"));

// Ball object
ball = {
	x: W/2,
	y: H/2+50, 
	r: 5,
	c: "white",
	vx: 4,
	vy: 8,
	
	// Function for drawing ball on canvas
	draw: function() {
		ctx.beginPath();
		ctx.fillStyle = this.c;
		ctx.arc(this.x, this.y, this.r, 0, Math.PI*2, false);
		ctx.fill();
	}
};
mapBtn= {
	w: 100,
	h: 50,
	x: W/2 - 50,
	y: H/2 + 30,
	
		draw: function() {
		ctx.strokeStyle = "white";
		ctx.lineWidth = "2";
		ctx.strokeRect(this.x, this.y, this.w, this.h);
		//ctx.strokeRect(this.x-this.w-10, this.y, this.w, this.h);
		//ctx.strokeRect(this.x+this.w+10, this.y, this.w, this.h);
		
		ctx.font = "18px Arial, sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "white";
		ctx.fillText("Default", W/2, H/2+60 );
		ctx.fillText("Map 1", W/2-this.w-10, H/2+60 );
		ctx.fillText("Map 2", W/2+this.w+10, H/2+60 );
	}
};
speedBtn= {
	w: 100,
	h: 50,
	x: W/2 - 50,
	y: H/2 - 25,
	
		draw: function() {
		ctx.strokeStyle = "white";
		ctx.lineWidth = "2";
		ctx.strokeRect(this.x, this.y, this.w, this.h);
		//ctx.strokeRect(this.x-this.w-10, this.y, this.w, this.h);
		//ctx.strokeRect(this.x+this.w+10, this.y, this.w, this.h);
		
		ctx.font = "18px Arial, sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "white";
		ctx.fillText("0.5x", W/2-this.w-10, H/2 );
		ctx.fillText("1x Speed", W/2, H/2 );
		ctx.fillText("2x", W/2+this.w+10, H/2 );
	}
}

// Start Button object
startBtn = {
	w: 100,
	h: 50,
	x: W/2 - 50,
	y: H/2 - 80,
	
	draw: function() {
		ctx.strokeStyle = "white";
		ctx.lineWidth = "2";
		ctx.strokeRect(this.x, this.y, this.w, this.h);
		
		ctx.font = "18px Arial, sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "white";
		ctx.fillText("Start", W/2, H/2-60 );
	}
};

// Restart Button object
restartBtn = {
	w: 100,
	h: 50,
	x: W/2 - 50,
	y: H/2 - 50,
	
	draw: function() {
		ctx.strokeStyle = "white";
		ctx.lineWidth = "2";
		ctx.strokeRect(this.x, this.y, this.w, this.h);
		
		ctx.font = "18px Arial, sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStlye = "white";
		ctx.fillText("Restart", W/2, H/2 - 25 );
	}
};

// Function for creating particles object
function createParticles(x, y, m) {
	this.x = x || 0;
	this.y = y || 0;
	
	this.radius = 1.2;
	
	this.vx = -1.5 + Math.random()*3;
	this.vy = m * Math.random()*1.5;
}

// Draw everything on canvas
function draw() {
	paintCanvas();
	for(var i = 0; i < paddles.length; i++) {
		p = paddles[i];
		
		ctx.fillStyle = "white";
		ctx.fillRect(p.x, p.y, p.w, p.h);
	}
	
	ball.draw();
	update();
}

// Function to increase speed after every 5 points
function increaseSpd() {
	if(points % 4 == 0) {
		if(Math.abs(ball.vx) < 15) {
			ball.vx += (ball.vx < 0) ? -1 : 1;
			ball.vy += (ball.vy < 0) ? -2 : 2;
		}
	}
}

// Track the position of mouse cursor
function trackPosition(e) {
	mouse.x = e.pageX;
	mouse.y = e.pageY;
}

// Function to update positions, score and everything.
// Basically, the main game logic is defined here
function update() {
	// Update scores
	updateScore(); 
	
	// Move the paddles on mouse move
	/*if(mouse.x && mouse.y) {
		for(var i = 1; i < paddles.length; i++) {
			p = paddles[i];
			p.y = mouse.y - p.h/2;
		}		
	}*/
	p1 = paddles[1];
	p2 = paddles[2];
	
	if(key1up) p1.y+=inc;
	else if(key1down) p1.y-=inc;
	if(key2up) p2.y+=inc;
	else if(key2down) p2.y-=inc;
	
	// Move the ball
	ball.x += ball.vx;
	ball.y += ball.vy;
	
	// Collision with paddles
	
	
	// If the ball strikes with paddles,
	// invert the y-velocity vector of ball,
	// increment the points, play the collision sound,
	// save collision's position so that sparks can be
	// emitted from that position, set the flag variable,
	// and change the multiplier
	if(collides(ball, p1)) {
		collideAction(ball, p1);
	}
	
	
	else if(collides(ball, p2)) {
		collideAction(ball, p2);
	} 
	
	else {
		// If ball strikes the horizontal walls, invert the 
		// x-velocity vector of ball
		if(ball.y + ball.r > H) {
			ball.vy = -ball.vy;
			ball.y = H - ball.r;
			//gameOver();
		} 
		
		else if(ball.y < 0) {
			ball.vy = -ball.vy;
			ball.y = ball.r;
			//gameOver();
		}
		
		// Collide with walls, If the ball hits the vertical
		// walls, run gameOver() function
		if(ball.x + ball.r > W) {
			//ball.vx = -ball.vx;
			ball.x = W - ball.r;
			gameOver(1);
		}
		
		else if(ball.x -ball.r < 0) {
			//ball.vx = -ball.vx;
			ball.x = ball.r;
			gameOver(2);
		}
	}
	
	
	
	// If flag is set, push the particles
	if(flag == 1) { 
		for(var k = 0; k < particlesCount; k++) {
			particles.push(new createParticles(particlePos.x, particlePos.y, multiplier));
		}
	}	
	
	// Emit particles/sparks
	emitParticles();
	
	// reset flag
	flag = 0;
}

//Function to check collision between ball and one of
//the paddles
function collides(b, p) {
	if(b.x + ball.r >= p.x && b.x - ball.r <=p.x + p.w) {
		if(b.y >= (p.y - p.h) && p.y > 0){
			paddleHit = 1;
			return true;
		}
		
		else if(b.y <= p.h && p.y == 0) {
			paddleHit = 2;
			return true;
		}
		
		else return false;
	}
}

//Do this when collides == true
function collideAction(ball, p) {
	ball.vx = -ball.vx;
	console.log(p.pos);
	//if(paddleHit == 1) {
	if(p.pos=="bottom") {
		ball.x = p.x - p.w;
		particlePos.x = ball.x + ball.r;
		multiplier = -1;	
	}
	
	//else if(paddleHit == 2) {
	else if(p.pos=="top") {
		ball.x = p.w + ball.r+p.x;
		particlePos.x = ball.x + ball.r;
		multiplier = 1;	
	}
	
	points++;
	increaseSpd();

	
	particlePos.y = ball.y;
	flag = 1;
}

// Function for emitting particles
function emitParticles() { 
	for(var j = 0; j < particles.length; j++) {
		par = particles[j];
		
		ctx.beginPath(); 
		ctx.fillStyle = "white";
		if (par.radius > 0) {
			ctx.arc(par.x, par.y, par.radius, 0, Math.PI*2, false);
		}
		ctx.fill();	 
		
		par.x += par.vx; 
		par.y += par.vy; 
		
		// Reduce radius so that the particles die after a few seconds
		par.radius = Math.max(par.radius - 0.05, 0.0); 
		
	} 
}

// Function for updating score
function updateScore() {
	ctx.fillStlye = "white";
	ctx.font = "16px Arial, sans-serif";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText(p1pts+":"+p2pts, W/2, 20 );
}

// Function to run when the game overs
function gameOver(player) {
	if(player==1) p1pts++;
	else p2pts++;
	/*ctx.fillStlye = "white";
	ctx.font = "20px Arial, sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("Game Over - You scored "+points+" points!", W/2, H/2 + 25 );*/
	
	// Stop the Animation
		ball.x= W/2;
		ball.y=H/2+50;
		
		ball.vx=Math.floor(Math.random() * 11) + 3;
		ball.vy=8;
		if(player==2) { ball.vx*=-1; ball.vy*=-1 };
		
	
	// Set the over flag
	if(p1pts>=11 || p2pts>=11) {
		cancelRequestAnimFrame(init);
		over = 1;
		// Show the restart button
		restartBtn.draw();
	}
	
	
	
}

// Function for running the whole animation
function animloop() {
	init = requestAnimFrame(animloop);
	draw();
}

// Function to execute at startup
function startScreen() {
	//draw();
		if(collision) {
		//if(points > 0) 
		//	collision.pause();
		
		collision.currentTime = 0;
		collision.play();
	}
	paintCanvas();
	startBtn.draw();
	mapBtn.draw();
	speedBtn.draw();
	
}

// On button click (Restart and start)
function btnClick(e) {
	
	// Variables for storing mouse position on click
	var mx = e.pageX,
			my = e.pageY;
	
	// Click start button
	if(mx >= startBtn.x && mx <= startBtn.x + startBtn.w && my >= startBtn.y && my<=startBtn.x+startBtn.h) {
		animloop();

		// Delete the start button after clicking it
		startBtn = {};
	}
	
	// If the game is over, and the restart button is clicked
	if(over == 1) {
		if(mx >= restartBtn.x && mx <= restartBtn.x + restartBtn.w) {
			ball.x = W/2;
			ball.y = H/2+50;
			points = 0;
			p1pts=0;
			p2pts=0;
			ball.vx = 4;
			ball.vy = 8;
			if(d.getTime()%2==0) {
			ball.vx*=-1;
			ball.vy*=-1;
			}
			animloop();
			
			over = 0;
		}
	}	
}


// Show the start screen
startScreen();