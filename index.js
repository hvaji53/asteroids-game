const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

context.fillStyle = 'black';
context.fillRect( 0, 0, canvas.width, canvas.height);

let lives = 3
let gameOver = false
let score = 0

class Player {
    constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity
        this.rotation = 0
        this.rotationSpeed = 0
        this.thrusting = false
        this.reversing = false
        this.radius = 20
        
    }
    draw() {
        context.save()

        context.translate(this.position.x, this.position.y)
        context.rotate(this.rotation)
        context.translate(-this.position.x, -this.position.y)



        // context.fillStyle = 'white'
        // context.fillRect (this.position.x, this.position.y, 50, 50)
        context.beginPath()
        context.moveTo(this.position.x + 30, this.position.y)
        context.lineTo(this.position.x - 10, this.position.y - 10)
        context.lineTo(this.position.x - 10, this.position.y + 10)
        context.closePath()

        context.strokeStyle = "white"
        context.stroke()

        context.restore()
    }
    update() {
        const thrust = 0.2

    if (this.thrusting) {
        this.velocity.x += Math.cos(this.rotation) * thrust
        this.velocity.y += Math.sin(this.rotation) * thrust
    }

    if (this.reversing) {
        this.velocity.x -= Math.cos(this.rotation) * thrust
        this.velocity.y -= Math.sin(this.rotation) * thrust
    }

    this.rotation += this.rotationSpeed
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    //friction
    this.velocity.x *= friction
    this.velocity.y *= friction
    
    wrap (this)
    this.draw()
    }


}

class Projectile {
    constructor ({position, velocity}) {
        this.position = position
        this.velocity = velocity
        this.radius = 5
    }
    draw(){
        context.beginPath()
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false)
        context.closePath()
        context.fillStyle = 'white'
        context.fill()
    }
    update() {
        
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        //wrap(this)
        this.draw()
    }
}

class Asteroid {
    constructor({ position, velocity, radius }) {
        this.position = position
        this.velocity = velocity
        this.radius = radius
        this.vertices = Math.floor(Math.random() * 6 + 7)
        this.offsets = []

        for (let i = 0; i < this.vertices; i++) {
            this.offsets.push(Math.random() * 0.6 + 0.7)
        }
    }

    draw() {
        context.save()
        context.translate(this.position.x, this.position.y)

        context.beginPath()
        for (let i = 0; i < this.vertices; i++) {
            const angle = (Math.PI * 2 / this.vertices) * i
            const r = this.radius * this.offsets[i]

            const x = Math.cos(angle) * r
            const y = Math.sin(angle) * r

            if (i === 0) context.moveTo(x, y)
            else context.lineTo(x, y)
        }
        context.closePath()

        context.strokeStyle = 'white'
        context.stroke()

        context.restore()
    }

    update() {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
       wrap(this)
        this.draw()
    }
}


const player = new Player( {
    position: { x: canvas.width / 2, y: canvas.height / 2 },
    velocity: { x: 0, y: 0 },
} )

const projectiles = []
const friction = .97
const projectile_speed = 5
const asteroids = []

setInterval(() => {
    const radius = Math.random() * 30 + 15
    const edge = Math.floor(Math.random() * 4)

    let position
    let angle

    switch (edge) {
        case 0: // left
            position = { 
                x: -radius, 
                y: Math.random() * canvas.height 
            }
            angle = Math.random() * Math.PI - Math.PI / 2
            break
        case 1: // right
            position = { 
                x: canvas.width + radius, 
                y: Math.random() * canvas.height 
            }
            angle = Math.random() * Math.PI + Math.PI / 2
            break
        case 2: // top
            position = { 
                x: Math.random() * canvas.width, 
                y: -radius }
            angle = Math.random() * Math.PI
            break
        case 3: // bottom
            position = { 
                x: Math.random() * canvas.width, 
                y: canvas.height + radius 
            }
            angle = Math.random() * Math.PI + Math.PI
            break
    }

    const speed = Math.random() * 1.5 + 0.5

    asteroids.push(
        new Asteroid({
            position,
            velocity: {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed,
            },
            radius,
        })
    )
}, 2000)

function distance(x1, y1, x2, y2) {
    const dx = x2 - x1
    const dy = y2 - y1
    return Math.sqrt(dx * dx + dy * dy)
}

function drawHUD(){
    context.fillStyle = 'white'
    context.font = '20px Arial'
    context.textAlign = 'left'
    context.fillText(`Score: ${score}`, 20, 30)
    context.fillText(`Lives: ${lives}`, 20, 60)

}


function animate() {
    if (gameOver) {
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = 'white';
    context.textAlign = 'center';

    context.font = '48px Arial';
    context.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);

    context.font = '24px Arial';
    context.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);

    context.font = '18px Arial';
    context.fillText('Refresh the page to play again', canvas.width / 2, canvas.height / 2 + 50);

    return;
}

    // context.fillStyle = 'white'
    // context.font = '20px sans-serif'
    // context.textAlign = 'left'
    // context.fillText(`Lives: ${lives}`, 20, 30)

    requestAnimationFrame(animate)

    context.fillStyle = 'black'
    context.fillRect(0, 0, canvas.width, canvas.height)

    drawHUD()

    player.update()
   
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i]
        projectile.update()

        //collect projectiles that go off screen
        if (projectile.position.x + projectile.radius < 0 || 
            projectile.position.x - projectile.radius > canvas.width ||
            projectile.position.y + projectile.radius < 0 ||
            projectile.position.y - projectile.radius > canvas.height
            
         ) {
            projectiles.splice(i, 1)
        }
    }

    //manage asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
    const asteroid = asteroids[i]
    asteroid.update()
    //ship collision
    const dist = distance(
        player.position.x,
        player.position.y,
        asteroid.position.x,
        asteroid.position.y
    )
    if (dist < asteroid.radius + player.radius) {
        asteroids.splice(i, 1)
        lives--
        if (lives<= 0) {
            gameOver = true
        } else {
            //respawn safely
            player.position.x = canvas.width / 2
            player.position.y = canvas.height / 2
            player.velocity.x = 0
            player.velocity.y = 0

        }
        break
    }

    // projectile collision
    for (let j = projectiles.length - 1; j >= 0; j--) {
        const projectile = projectiles[j]

        const dist = distance(
            projectile.position.x,
            projectile.position.y,
            asteroid.position.x,
            asteroid.position.y
        )

        if (dist < asteroid.radius + projectile.radius) {

            // split asteroid
            if (asteroid.radius > 25) {
                for (let k = 0; k < 2; k++) {
                    const angle = Math.random() * Math.PI * 2
                    const speed = Math.random() * 1.5 + 0.5

                    asteroids.push(
                        new Asteroid({
                            position: {
                                x: asteroid.position.x,
                                y: asteroid.position.y,
                            },
                            velocity: {
                                x: Math.cos(angle) * speed,
                                y: Math.sin(angle) * speed,
                            },
                            radius: asteroid.radius / 2,
                        })
                    )
                }
            }
            
            

            // remove asteroid & projectile
            asteroids.splice(i, 1)
            projectiles.splice(j, 1)
            score += 100;
        
            break
        }
    }

    // remove off-screen asteroid
    if (
        asteroid.position.x + asteroid.radius < 0 ||
        asteroid.position.x - asteroid.radius > canvas.width ||
        asteroid.position.y + asteroid.radius < 0 || 
        asteroid.position.y - asteroid.radius > canvas.height
        
    ) {
        asteroids.splice(i, 1)
    }
}
}


animate()

window.addEventListener('keydown', (event) => {
    if (
        event.code === 'ArrowUp' ||
        event.code === 'ArrowDown' ||
        event.code === 'ArrowLeft' ||
        event.code === 'ArrowRight' ||
        event.code === 'Space'
    ) {
        event.preventDefault();
    }

    switch (event.code) {
        case 'ArrowUp':
            player.thrusting = true
            break

        case 'ArrowDown':
            player.reversing = true
            break

        case 'ArrowLeft':
            player.rotationSpeed = -0.1
            break

        case 'ArrowRight':
            player.rotationSpeed = 0.1
            break

        case 'Space':
            projectiles.push(new Projectile({
                position: {
                    x: player.position.x + Math.cos(player.rotation) * 30,
                    y: player.position.y + Math.sin(player.rotation) * 30,
                },
                velocity: {
                    x: Math.cos(player.rotation) * projectile_speed,
                    y: Math.sin(player.rotation) * projectile_speed,
                },
            }))

            break
    }
})

window.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'ArrowUp':
            player.thrusting = false
            break

        case 'ArrowDown':
            player.reversing = false
            break

        case 'ArrowLeft':
        case 'ArrowRight':
            player.rotationSpeed = 0
            break
    }
})

function wrap(body) {
    const {position, radius} = body

    if (position.x < -radius) {
        position.x = canvas.width + radius
    } else if (position.x > canvas.width + radius) {
        position.x = -radius
    }

    if (position.y < -radius) {
        position.y = canvas.height + radius
    } else if(position.y > canvas.height + radius) {
        position.y = -radius
    }

}

console.log (score)