let data;

function preload() {
  data = loadTable("Fiducia negli altri - età dettaglio (IT1,83_63_DF_DCCV_AVQ_PERSONE_123,1.0).csv");
}

function setup(init=true) {
  W = windowWidth;
  H = windowHeight;
  S = min(W,H);
  if(init){
    createCanvas(W, H, WEBGL); // Attivare la modalità WEBGL
    iOSiPadOS = (/^iP/.test(navigator.platform) || /^Mac/.test(navigator.platform) && navigator.maxTouchPoints > 4);
  } 
  else resizeCanvas(W, H);
  bg_col = [255,253,245];
  background(bg_col);
  
  const margin = 0.03;
  ms = int(margin * S);
  Wm = W - ms;
  Hm = H - ms;

  init_lines = [
    [ms, ms, 0, Wm, ms, 0],
    [Wm, ms, 0, Wm, Hm, 0],
    [Wm, Hm, 0, ms, Hm, 0],
    [ms, Hm, 0, ms, ms, 0],
  ];
  lines = [...init_lines];

  noFill();
  opacity = 10;
  stroke(0, opacity);
  strokeCap(SQUARE);
  
  line_limit = ~~random(4,10);
  min_length = S * 0.05;
  t = 0;
  iterations = 20;
  change_interval = ~~random(6,12) * 60;
  phase = random(TAU);
  loop();
}

function find_midpoint(line, randomization_amount=0){
  const [x1, y1, z1, x2, y2, z2] = line;
  const f = 0.5 + randomization_amount * (1 - 2 * Math.random());
  return [lerp(x1, x2, f), lerp(y1, y2, f), lerp(z1, z2, f)];
}

function draw() {
  t++;
  RA = 0.21 + 0.2 * cos(t/5e3 + phase);
  
  if(t % change_interval == 0){ 
    if(t % (2 * change_interval) == 0) stroke(0, opacity);
    else stroke(255, opacity);
  }

  for(let i = 0; i < iterations; i++){
    let VH = true;
    while(VH){
      const ln1_index = ~~random(lines.length);
      const ln2_index = ~~random(lines.length);
      
      const pt1 = find_midpoint(lines[ln1_index], RA); 
      const pt2 = find_midpoint(lines[ln2_index], RA);
      
      // Randomizza la coordinata Z per creare un effetto 3D
      pt1[2] = random(-100, 100); 
      pt2[2] = random(-100, 100); 

      if(pt1[0] != pt2[0] && pt1[1] != pt2[1] &&
        !(pt1[0] == ms && pt2[0] == Wm) &&
        !(pt1[1] == ms && pt2[1] == Hm)){
        VH = false;
        const new_line = [...pt1, ...pt2];
        line(...new_line);
        if(Math.random() < 0.01){ 
          const line_length = dist(...new_line);
          if(line_length > min_length){
            lines.push(new_line);
            if(lines.length > line_limit) lines.shift();
          }
          else {
            lines.push(random(init_lines));
            lines.shift();
          }
        }
      }
    }
  }
}

// Restante parte del codice invariata


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