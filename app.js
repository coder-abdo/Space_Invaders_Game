// initial Variables
let display, input, frames,spFrame,
    alSprite, taSprite, ciSprite,lvFrame,
    aliens, dir, tank, bullets, cities;
    // Intersection
function AABBIntersect(ax, ay, aw, ah, bx, by, bw, bh) {
    return (ax < bx + bw &&
            bx < ax + aw &&
            ay < by + bh &&
            by < ay + ah);
}
//constructors


// Screen
function Display(width, height) {
    this._canvas = document.createElement('canvas');
    this._canvas.width = this.width = width;
    this._canvas.height = this.height = height;
    this._ctx = this._canvas.getContext('2d');
    document.body.appendChild(this._canvas);
}
Display.prototype.drawSprite = function(sp, x, y){
    this._ctx.drawImage(sp.img, sp.x, sp.y, sp.w, sp.h,x, y, sp.w, sp.h);
}
Display.prototype.clear = function () {
    this._ctx.clearRect(0, 0, this.width, this.height);
}
Display.prototype.drawBullet = function(bullet) {
    this._ctx.fillStyle = bullet.color;
    this._ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);
}
// Sprite

function Sprite(img, x, y, w, h) {
    this.x = x;
    this.y = y;
    this.img = img;
    this.w = w;
    this.h = h;
}
// Bullet

function Bullet(x, y, vy, w, h, color) {
    this.x = x;
    this.y = y;
    this.vy = vy;
    this.w = w;
    this.h = h;
    this.color = color;
}
Bullet.prototype.update = function () {
    this.y += this.vy;
}
//  event handlers

function InputHandler(){
    this.down = {};
    this.pressed = {};
    var self = this;
    document.addEventListener('keydown', function(e){
        return self.down[e.keyCode] = true;
    });
    document.addEventListener('keyup', function(e) {
        delete self.down[e.keyCode];
        delete self.pressed[e.keyCode];
    });
}
InputHandler.prototype.isDown = function (code) { 
    return this.down[code];
 }
InputHandler.prototype.isPressed = function (code) {
    if(this.pressed[code]) {return false;}
    else if(this.down[code]) {return this.pressed[code] = true;}
    return false;
  }
function main() {
    display = new Display(504, 600);
    input = new InputHandler();
    var img = new Image();
    img.addEventListener('load', function () {
        alSprite = [
            [new Sprite(this, 0, 0, 22, 16), new Sprite(this, 0, 16, 22, 16)],
            [new Sprite(this, 22, 0, 16, 16), new Sprite(this, 22, 16, 16, 16)],
            [new Sprite(this, 38, 0, 24, 16), new Sprite(this, 38, 16, 24, 16)]
        ];
        taSprite = new Sprite(this, 62, 0, 22, 16);
        ciSprite = new Sprite(this, 84, 8, 36, 24);
        init();
        run();
    });
    img.src = 'invaders.png';
}
function init() {
    frames = 0;
    spFrame = 0;
    lvFrame = 60;
    dir = 1;
    bullets = [];
    aliens = [];
    
    tank = {
        sprite : taSprite,
        x      : (display.width - taSprite.w ) / 2,
        y      : display.height - (taSprite.h + 30)
    };
    cities = {
        canvas: null,
        ctx   : null,
        y     : tank.y - (30 + ciSprite.h),
        h     : ciSprite.h,
        init  : function (){
            this.canvas = document.createElement('canvas');
            this.canvas.width = display.width;
            this.canvas.height = this.h;
            this.ctx = this.canvas.getContext('2d');
            for(var i = 0; i < 4;i++){
                this.ctx.drawImage(
                    ciSprite.img, 
                    ciSprite.x,
                    ciSprite.y,
                    ciSprite.w,
                    ciSprite.h,
                    68+111*i,
                    0,
                    ciSprite.w,
                    ciSprite.h
                );
            }
        },
        generateDamage: function (x, y) {
            x = Math.floor(x / 2) * 2;
            y = Math.floor(y / 2) * 2;
            this.ctx.clearRect(x-2, y-2, 4, 4);
            this.ctx.clearRect(x+2, y-4, 2, 4);
            this.ctx.clearRect(x+4, y, 2, 2);
            this.ctx.clearRect(x+2, y+2, 2, 2);
            this.ctx.clearRect(x-4, y+2, 2, 2);
            this.ctx.clearRect(x-6, y, 2, 2);
            this.ctx.clearRect(x-4, y-4, 2, 2);
            this.ctx.clearRect(x-2, y-6, 2, 2);
        },
        hits: function (x, y) {
            y -= this.y;
            var data = this.ctx.getImageData(x, y, 1, 1);
            if(data.data[3] !== 0){
                this.generateDamage(x, y);
                return true;
            }
            return false;
        },
    };
    cities.init();
    var rows = [1, 0, 0, 2, 2];
    for (var i = 0, len = rows.length; i < len; i++) {
        for (var j = 0; j < 10; j++) {
            var a = rows[i];
            aliens.push(
                {
                    sparite: alSprite[a],
                    x: 30 + j * 30 + [0, 4, 0][a],
                    y: 30 + i * 30,
                    w: alSprite[a][0].w,
                    h: alSprite[a][0].h
                }
            );
        }
        
    }
}
function update() {
    if(input.isDown(37)){ // LEFT
        tank.x -= 4;
    }
    if(input.isDown(39)){ // LEFT
        tank.x += 4;
    }
    tank.x = Math.max(Math.min(tank.x, display.width - (taSprite.w + 30)), 30);
    if(input.isPressed(32)){
        bullets.push(new Bullet(tank.x + taSprite.w / 2, tank.y, -8, 2, 6, '#fff'));
    }
    for(var i = 0;i < bullets.length;i++){
        bullets[i].update();
    }
    for(var k = bullets.length - 1; k >= 0;k--){
        var b = bullets[k];
        if(b.y + b.h < 0 || b.y > display.height){
            bullets.splice(k, 1);
        }
        var center = b.h * .5;
        if(cities.y < b.y + center && b.y + center < cities.y + cities.h){
            if(cities.hits(b.x, b.y)){
                bullets.splice(k, 1);
            }
        }
        for(var l = aliens.length - 1;l >= 0;l--){
            var s = aliens[l];
            if(AABBIntersect(b.x, b.y, b.w, b.h, s.x, s.y, s.w, s.h)){
                aliens.splice(l, 1);
                bullets.splice(k, 1);
                switch (aliens.length) {
                    case 30:
                        lvFrame = 40;
                        break;
                    case 10:
                        lvFrame = 20;
                        break;
                    case 5:
                        lvFrame = 15;
                        break;
                    case 1:
                        lvFrame = 5;
                        break;
                
                    default:
                        break;
                }
            }
        }
    }
    if(Math.random() < .03 && aliens.length > 0) {
        var a = aliens[Math.round(Math.random() * (aliens.length -1))];
        for(var j = 0; j < aliens.length;j++){
            var n = aliens[j];
            if(AABBIntersect(a.x, a.y, a.w, 100, n.x, n.y, n.w, n.h)){
                a = n;
            }
        }
        bullets.push(new Bullet(a.x+a.w*.5, a.y+a.h, 4, 2, 4, '#fff'));
    }
    frames++;
    if(frames % lvFrame === 0){
        spFrame = (spFrame + 1) % 2;
        var _max = 0, _min = display.width;
        for (var i = 0; i < aliens.length; i++) {
            var a = aliens[i];
            a.x += 30 * dir;
            _max = Math.max(_max, a.x + a.w);
            _min = Math.min(_min, a.x);
        }
        if(_max > display.width - 30 || _min < 30){
            dir *= -1;
            for (var i = 0; i < aliens.length; i++){
                aliens[i].x += 30 * dir;
                aliens[i].y += 30;
            }
        }
    }
}
function run() {
    var loop = function(){
        update();
        render();
        window.requestAnimationFrame(loop, display._canvas);
    }
    window.requestAnimationFrame(loop, display._canvas);
}
function render() {
    display.clear();
    for (var i = 0; i < aliens.length; i++) {
        var a = aliens[i];
        display.drawSprite(a.sparite[spFrame], a.x, a.y);
    }
    display._ctx.save();
    for(var i = 0, len = bullets.length;i < len;i++){
        display.drawBullet(bullets[i]);
    }
    display._ctx.restore();
    display._ctx.drawImage(cities.canvas, 0, cities.y);
    display.drawSprite(tank.sprite, tank.x, tank.y);
}
main();