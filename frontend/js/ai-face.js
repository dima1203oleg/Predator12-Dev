/**
 * AI Face Component - 3D Інтерактивне Обличчя
 * Управляє анімаціями, емоціями та візуальними ефектами
 */

class AIFace {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.face = null;
        this.emotions = {
            neutral: { mouth: 0, eyes: 0, eyebrows: 0 },
            happy: { mouth: 0.8, eyes: 0.3, eyebrows: 0.2 },
            thinking: { mouth: -0.2, eyes: -0.1, eyebrows: -0.3 },
            speaking: { mouth: 0.5, eyes: 0.1, eyebrows: 0.1 },
            processing: { mouth: 0, eyes: -0.2, eyebrows: -0.4 }
        };
        this.currentEmotion = 'neutral';
        this.isAnimating = false;

        this.init();
    }

    async init() {
        try {
            // Ініціалізація Three.js
            this.setupThreeJS();
            this.createFace();
            this.setupLighting();
            this.startRenderLoop();

            console.log('AI Face initialized successfully');
        } catch (error) {
            console.error('Failed to initialize AI Face:', error);
            this.fallbackTo2D();
        }
    }

    setupThreeJS() {
        // Сцена
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);

        // Камера
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.z = 5;

        // Рендерер
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(
            this.container.clientWidth,
            this.container.clientHeight
        );
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.appendChild(this.renderer.domElement);

        // Адаптивність
        window.addEventListener('resize', () => this.onWindowResize());
    }

    createFace() {
        // Основа обличчя - сфера
        const faceGeometry = new THREE.SphereGeometry(1.5, 32, 32);
        const faceMaterial = new THREE.MeshPhongMaterial({
            color: 0x4a90e2,
            transparent: true,
            opacity: 0.8,
            shininess: 100
        });

        this.face = new THREE.Mesh(faceGeometry, faceMaterial);
        this.scene.add(this.face);

        // Очі
        this.createEyes();

        // Рот
        this.createMouth();

        // Брови
        this.createEyebrows();

        // Частинки навколо обличчя
        this.createParticles();
    }

    createEyes() {
        // Ліве око
        const leftEyeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const eyeMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            emissive: 0x004444
        });

        this.leftEye = new THREE.Mesh(leftEyeGeometry, eyeMaterial);
        this.leftEye.position.set(-0.4, 0.3, 1.2);
        this.face.add(this.leftEye);

        // Праве око
        this.rightEye = new THREE.Mesh(leftEyeGeometry, eyeMaterial);
        this.rightEye.position.set(0.4, 0.3, 1.2);
        this.face.add(this.rightEye);

        // Зіниці
        const pupilGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

        this.leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        this.leftPupil.position.set(-0.4, 0.3, 1.3);
        this.face.add(this.leftPupil);

        this.rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        this.rightPupil.position.set(0.4, 0.3, 1.3);
        this.face.add(this.rightPupil);
    }

    createMouth() {
        // Рот як тор
        const mouthGeometry = new THREE.TorusGeometry(0.3, 0.05, 8, 16);
        const mouthMaterial = new THREE.MeshPhongMaterial({
            color: 0xff4444,
            emissive: 0x220000
        });

        this.mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        this.mouth.position.set(0, -0.4, 1.2);
        this.mouth.rotation.x = Math.PI / 2;
        this.face.add(this.mouth);
    }

    createEyebrows() {
        const browGeometry = new THREE.BoxGeometry(0.4, 0.08, 0.1);
        const browMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            emissive: 0x002222
        });

        // Ліва брова
        this.leftEyebrow = new THREE.Mesh(browGeometry, browMaterial);
        this.leftEyebrow.position.set(-0.4, 0.6, 1.2);
        this.face.add(this.leftEyebrow);

        // Права брова
        this.rightEyebrow = new THREE.Mesh(browGeometry, browMaterial);
        this.rightEyebrow.position.set(0.4, 0.6, 1.2);
        this.face.add(this.rightEyebrow);
    }

    createParticles() {
        const particleCount = 50;
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 10;     // x
            positions[i + 1] = (Math.random() - 0.5) * 10; // y
            positions[i + 2] = (Math.random() - 0.5) * 10; // z
        }

        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particleMaterial = new THREE.PointsMaterial({
            color: 0x00ffff,
            size: 0.05,
            transparent: true,
            opacity: 0.6
        });

        this.particles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(this.particles);
    }

    setupLighting() {
        // Основне освітлення
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Направлене світло
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // Точкове світло для драматичності
        const pointLight = new THREE.PointLight(0x00ffff, 0.8, 10);
        pointLight.position.set(0, 0, 3);
        this.scene.add(pointLight);
    }

    startRenderLoop() {
        const animate = () => {
            requestAnimationFrame(animate);

            // Обертання обличчя
            if (this.face) {
                this.face.rotation.y += 0.005;
            }

            // Анімація частинок
            if (this.particles) {
                this.particles.rotation.y += 0.002;
                this.particles.rotation.x += 0.001;
            }

            // Моргання
            this.animateBlink();

            this.renderer.render(this.scene, this.camera);
        };

        animate();
    }

    animateBlink() {
        // Випадкове моргання кожні 2-5 секунд
        if (!this.blinkTimer) {
            this.blinkTimer = Date.now() + Math.random() * 3000 + 2000;
        }

        if (Date.now() > this.blinkTimer && !this.isBlinking) {
            this.blink();
            this.blinkTimer = null;
        }
    }

    blink() {
        this.isBlinking = true;

        // Анімація закриття очей
        const closeAnimation = new TWEEN.Tween(this.leftEye.scale)
            .to({ y: 0.1 }, 100)
            .onComplete(() => {
                // Анімація відкриття очей
                const openAnimation = new TWEEN.Tween(this.leftEye.scale)
                    .to({ y: 1 }, 100)
                    .onComplete(() => {
                        this.isBlinking = false;
                    });

                openAnimation.start();

                // Синхронізація з правим оком
                new TWEEN.Tween(this.rightEye.scale)
                    .to({ y: 1 }, 100)
                    .start();
            });

        closeAnimation.start();

        // Синхронізація з правим оком
        new TWEEN.Tween(this.rightEye.scale)
            .to({ y: 0.1 }, 100)
            .start();
    }

    setEmotion(emotion) {
        if (!this.emotions[emotion] || this.isAnimating) return;

        this.isAnimating = true;
        this.currentEmotion = emotion;

        const target = this.emotions[emotion];
        const duration = 500;

        // Анімація рота
        if (this.mouth) {
            new TWEEN.Tween(this.mouth.scale)
                .to({
                    x: 1 + target.mouth * 0.5,
                    y: 1 + target.mouth * 0.3
                }, duration)
                .start();
        }

        // Анімація очей
        if (this.leftEye && this.rightEye) {
            const eyeScale = 1 + target.eyes * 0.2;

            new TWEEN.Tween(this.leftEye.scale)
                .to({ x: eyeScale, z: eyeScale }, duration)
                .start();

            new TWEEN.Tween(this.rightEye.scale)
                .to({ x: eyeScale, z: eyeScale }, duration)
                .start();
        }

        // Анімація брів
        if (this.leftEyebrow && this.rightEyebrow) {
            const browY = 0.6 + target.eyebrows * 0.2;

            new TWEEN.Tween(this.leftEyebrow.position)
                .to({ y: browY }, duration)
                .start();

            new TWEEN.Tween(this.rightEyebrow.position)
                .to({ y: browY }, duration)
                .onComplete(() => {
                    this.isAnimating = false;
                })
                .start();
        }

        console.log(`AI Face emotion changed to: ${emotion}`);
    }

    speak(text) {
        this.setEmotion('speaking');

        // Симуляція руху губ під час говоріння
        const speakDuration = text.length * 50; // 50мс на символ

        setTimeout(() => {
            this.setEmotion(this.currentEmotion === 'speaking' ? 'neutral' : this.currentEmotion);
        }, speakDuration);
    }

    startThinking() {
        this.setEmotion('thinking');

        // Пульсація при мисленні
        this.thinkingAnimation = new TWEEN.Tween(this.face.material)
            .to({ opacity: 0.6 }, 1000)
            .yoyo(true)
            .repeat(Infinity)
            .start();
    }

    stopThinking() {
        if (this.thinkingAnimation) {
            this.thinkingAnimation.stop();
            this.face.material.opacity = 0.8;
        }
        this.setEmotion('neutral');
    }

    startProcessing() {
        this.setEmotion('processing');

        // Швидке обертання при обробці
        this.processingAnimation = new TWEEN.Tween(this.face.rotation)
            .to({ y: this.face.rotation.y + Math.PI * 2 }, 2000)
            .repeat(Infinity)
            .start();
    }

    stopProcessing() {
        if (this.processingAnimation) {
            this.processingAnimation.stop();
        }
        this.setEmotion('neutral');
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    fallbackTo2D() {
        // Fallback до 2D аватара якщо 3D не працює
        this.container.innerHTML = `
            <div class="ai-face-2d">
                <div class="face-circle">
                    <div class="eyes">
                        <div class="eye left"></div>
                        <div class="eye right"></div>
                    </div>
                    <div class="mouth"></div>
                </div>
                <div class="status-text">AI Assistant Ready</div>
            </div>
        `;

        console.log('Using 2D fallback for AI Face');
    }

    destroy() {
        if (this.renderer) {
            this.container.removeChild(this.renderer.domElement);
            this.renderer.dispose();
        }

        if (this.scene) {
            this.scene.clear();
        }

        console.log('AI Face destroyed');
    }
}

// Експорт для використання в інших модулях
window.AIFace = AIFace;
