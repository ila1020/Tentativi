function preload() {
  data = loadTable("fiducia generale percentuale - Foglio1.csv", "csv", "header");
}

function setup(init=true) {
  W = windowWidth;
  H = windowHeight;
  S = min(W, H);

  if (init) {
    createCanvas(W, H);
    iOSiPadOS = (/^iP/.test(navigator.platform) || /^Mac/.test(navigator.platform) && navigator.maxTouchPoints > 4);
  } else resizeCanvas(W, H);

  bg_col = [255, 253, 245];
  background(bg_col);

  const margin = 0.1; // nuovo margine, il 10% della dimensione minima
  const midX = W / 2;
  const midY = H / 2;
  const romboSize = min(W, H) * (1 - 2 * margin) * 0.4; // calcolo dimensione del rombo, tenendo conto dei margini
  drawRhombo(midX, midY, romboSize); // Disegna il rombo


  // Il resto del codice rimane invariato
}

function drawRhombo(x, y, size) {
  let newSize = size; // Puoi mantenere la dimensione senza un fattore di scala, se non necessario

  push();
  noFill();
  stroke(0);
  strokeWeight(2);
  beginShape();
  vertex(x, y - newSize); // Punto in alto
  vertex(x + newSize, y); // Punto a destra
  vertex(x, y + newSize); // Punto in basso
  vertex(x - newSize, y); // Punto a sinistra
  endShape(CLOSE);
  pop();
}


function find_midpoint(line, randomization_amount=0){
  const [x1,y1,x2,y2] = line
  const f = 0.5 + randomization_amount * (1 - 2 * Math.random())
  return [lerp(x1, x2, f), lerp(y1, y2, f)]
}

function draw() {
  t++
  RA = 0.21 + 0.2 * cos(t/5e3 + phase) // part of step 2.

  // every so often, change the color from black to white 
  // so that it doesn't just completely fill in.
  if(t % change_interval == 0){ 
    if(t % (2 * change_interval) == 0) stroke(0, opacity)
    else stroke(255, opacity)
  }

  for(let i = 0; i < iterations; i++){ // make it run a lot faster

    let VH = true
    while(VH){
      const ln1_index = ~~random(lines.length) // step 1 selection
      const ln2_index = ~~random(lines.length)

      // part of step 2, but makes test for step 1 easier
      const pt1 = find_midpoint(lines[ln1_index], RA) 
      const pt2 = find_midpoint(lines[ln2_index], RA)

      // vertical or horizontal check (step 1 test)
      if(pt1[0] != pt2[0] && pt1[1] != pt2[1] && 
        !(pt1[0] == ms && pt2[0] == Wm) &&
        !(pt1[1] == ms && pt2[1] == Hm)){
        VH = false
        const new_line = [...pt1, ...pt2]
        line(...new_line) // step 2
        if(Math.random() < 0.01){ // step 3 test
          const line_length = dist(...new_line)
          if(line_length > min_length){
            lines.push(new_line)
            if(lines.length > line_limit) lines.shift() // remove first in array
          }
          else {
            lines.push(random(init_lines))
            lines.shift()
          }
        }
      } 
    }
  }
}


function keyPressed(){
  const key_L = key.toLowerCase()
	if(key_L === 'f'){
		if(fullscreen()) fullscreen(false)
		else go_fullscreen()
	}
  else if(key_L === 's') save_img()
  else if(key_L === 'r') setup(false)
  else if(key === ' ') pause_unpause()
}

function pause_unpause(){
  push()
  noFill()
  if(isLooping()){
    strokeWeight(ms)
    stroke(50)
    rect(0,0, W,H)
    pop()
    noLoop()
  } 
  else{
    strokeWeight(ms + 4)
    stroke(bg_col)
    rect(0,0, W,H)
    pop()
    saved = false
    loop()
  }
}

function touchStarted(){input_pressed()}
function touchEnded(){input_released()}
function mouseReleased(){input_released()}

var start_time, saved, primed
function input_pressed(){
  if(!isLooping()) start_time = ~~millis()
  else start_time = 1e10
	const touch_mode = touches.length
	if(touch_mode) primed = touch_mode
	else primed = 0
}

var clicked = false, clickTimeout = 300
function input_released(){
  if(!clicked){
    clicked = true
    setTimeout(function(){
      if(clicked){
        clicked = false
        if(!isLooping() && millis() - start_time > 750) save_img()
      }
    }, clickTimeout)
  }else{  // double-click
    pause_unpause()
    primed = 0
  }
	if(primed && !iOSiPadOS){
		primed = 0
		go_fullscreen()
	}
	return false
}

function go_fullscreen(){
	if(fullscreen()) return
	fullscreen(true)
}

function save_img(){
  let date_time = new Date().toLocaleDateString(undefined, {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false, minute:'2-digit'})
  let save_name = `Simplify - ${date_time} - ${W}x${H}-${t}-${round(RA,2)}`
  if(!isLooping() && saved) return // prevents saving duplicates
  saveCanvas(save_name, "png")
  if(!isLooping()){
    push()
    noFill()
    strokeWeight(ms + 2)
    stroke(100,0,0)
    rect(0,0, W,H)
    pop()
    saved = true
  }
}

function windowResized() {
  if(isLooping() && 
		// prevents phone autorotate from restarting it
    !((windowWidth === H && windowHeight === W) || 
      (windowWidth === W && windowHeight === H))){
    setup(false)
  }
}