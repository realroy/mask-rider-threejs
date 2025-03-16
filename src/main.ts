import './style.css'
import * as THREE from 'three'

// Create a scene
const scene = new THREE.Scene()

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, 5, 10)
camera.lookAt(0, 0, 0)

// Create a renderer
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0x87CEEB) // Sky blue color
renderer.shadowMap.enabled = true
document.getElementById('app')!.appendChild(renderer.domElement)

// Create lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(5, 10, 7.5)
directionalLight.castShadow = true
scene.add(directionalLight)

// Create ground
const groundGeometry = new THREE.PlaneGeometry(100, 100)
const groundMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x228B22,  // Forest green
  side: THREE.DoubleSide 
})
const ground = new THREE.Mesh(groundGeometry, groundMaterial)
ground.rotation.x = -Math.PI / 2 // Rotate to be horizontal
ground.position.y = -0.5
ground.receiveShadow = true
scene.add(ground)

// Create skybox
const skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000)
const skyboxMaterial = new THREE.MeshBasicMaterial({ 
  color: 0x87CEEB, 
  side: THREE.BackSide 
})
const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial)
scene.add(skybox)

// Create player
const playerGeometry = new THREE.BoxGeometry(1, 2, 1)
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 })
const player = new THREE.Mesh(playerGeometry, playerMaterial)
player.position.set(0, 0.5, 0) // Position slightly above ground
player.castShadow = true
scene.add(player)

// Player movement
const normalSpeed = 0.1
const sprintSpeed = 0.2
let playerSpeed = normalSpeed
const keysPressed: { [key: string]: boolean } = {}

// Physics variables
const gravity = 0.01
const jumpForce = 0.2
let playerVelocityY = 0
let isJumping = false
const groundLevel = 0.5 // Player's y position when on ground

// Keyboard controls
window.addEventListener('keydown', (event) => {
  keysPressed[event.key.toLowerCase()] = true
  
  // Jump with spacebar
  if (event.key === ' ' && !isJumping) {
    playerVelocityY = jumpForce
    isJumping = true
  }
  
  // Sprint with shift
  if (event.key === 'shift') {
    playerSpeed = sprintSpeed
  }
})

window.addEventListener('keyup', (event) => {
  keysPressed[event.key.toLowerCase()] = false
  
  // Return to normal speed when shift is released
  if (event.key === 'shift') {
    playerSpeed = normalSpeed
  }
})

// Handle player movement
function movePlayer() {
  // Forward/backward movement (Z axis)
  if (keysPressed['w']) {
    player.position.z -= playerSpeed
  }
  if (keysPressed['s']) {
    player.position.z += playerSpeed
  }
  
  // Left/right movement (X axis)
  if (keysPressed['a']) {
    player.position.x -= playerSpeed
  }
  if (keysPressed['d']) {
    player.position.x += playerSpeed
  }
  
  // Apply gravity and jumping
  playerVelocityY -= gravity
  player.position.y += playerVelocityY
  
  // Check if player is on ground
  if (player.position.y <= groundLevel) {
    player.position.y = groundLevel
    playerVelocityY = 0
    isJumping = false
  }
  
  // Update camera to follow player
  camera.position.x = player.position.x
  camera.position.z = player.position.z + 10
  camera.lookAt(player.position)
}

// Handle window resize
window.addEventListener('resize', () => {
  const width = window.innerWidth
  const height = window.innerHeight
  renderer.setSize(width, height)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
})

// Animation loop
function animate() {
  requestAnimationFrame(animate)
  movePlayer()
  renderer.render(scene, camera)
}

animate()
