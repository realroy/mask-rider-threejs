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

// Camera control variables
let cameraRotationX = 0; // Vertical rotation (looking up/down)
let cameraRotationY = 0; // Horizontal rotation (looking left/right)
const cameraDistance = 5; // Distance from player
const cameraSensitivity = 0.002; // Mouse sensitivity
const cameraMinPolarAngle = 0.1; // Minimum angle (don't allow looking straight up)
const cameraMaxPolarAngle = Math.PI / 2; // Maximum angle (don't allow looking below horizon)
let isMouseDown = false;

// Mouse controls for camera
window.addEventListener('mousedown', (event) => {
  if (event.button === 0) { // Left mouse button
    isMouseDown = true;
    document.body.style.cursor = 'grabbing';
  }
});

window.addEventListener('mouseup', () => {
  isMouseDown = false;
  document.body.style.cursor = 'default';
});

window.addEventListener('mousemove', (event) => {
  if (isMouseDown) {
    // Rotate camera based on mouse movement
    cameraRotationY -= event.movementX * cameraSensitivity;
    cameraRotationX -= event.movementY * cameraSensitivity;
    
    // Clamp vertical rotation to prevent camera flipping
    cameraRotationX = Math.max(cameraMinPolarAngle, Math.min(cameraMaxPolarAngle, cameraRotationX));
  }
});

// Prevent context menu on right click
window.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});

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
  // Calculate movement direction relative to camera orientation
  const moveAngle = cameraRotationY;
  
  // Create direction vectors
  const forward = new THREE.Vector3(
    Math.sin(moveAngle), 
    0, 
    Math.cos(moveAngle)
  );
  
  const right = new THREE.Vector3(
    Math.sin(moveAngle + Math.PI/2), 
    0, 
    Math.cos(moveAngle + Math.PI/2)
  );
  
  // Apply movement based on keys pressed
  if (keysPressed['w']) {
    player.position.x -= forward.x * playerSpeed;
    player.position.z -= forward.z * playerSpeed;
  }
  if (keysPressed['s']) {
    player.position.x += forward.x * playerSpeed;
    player.position.z += forward.z * playerSpeed;
  }
  if (keysPressed['a']) {
    player.position.x -= right.x * playerSpeed;
    player.position.z -= right.z * playerSpeed;
  }
  if (keysPressed['d']) {
    player.position.x += right.x * playerSpeed;
    player.position.z += right.z * playerSpeed;
  }
  
  // Rotate player to face movement direction
  if (keysPressed['w'] || keysPressed['s'] || keysPressed['a'] || keysPressed['d']) {
    player.rotation.y = moveAngle;
  }
  
  // Apply gravity and jumping
  playerVelocityY -= gravity;
  player.position.y += playerVelocityY;
  
  // Check if player is on ground
  if (player.position.y <= groundLevel) {
    player.position.y = groundLevel;
    playerVelocityY = 0;
    isJumping = false;
  }
  
  // Update camera position based on player position and camera rotation
  updateCamera();
}

// Update camera position and orientation
function updateCamera() {
  // Calculate camera position based on player position and camera rotation
  const offsetX = cameraDistance * Math.sin(cameraRotationY) * Math.cos(cameraRotationX);
  const offsetY = cameraDistance * Math.sin(cameraRotationX);
  const offsetZ = cameraDistance * Math.cos(cameraRotationY) * Math.cos(cameraRotationX);
  
  // Position camera relative to player
  camera.position.x = player.position.x + offsetX;
  camera.position.y = player.position.y + offsetY + 1.5; // Add height offset to look slightly above player
  camera.position.z = player.position.z + offsetZ;
  
  // Look at player
  camera.lookAt(
    player.position.x,
    player.position.y + 1, // Look at player's head level
    player.position.z
  );
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
