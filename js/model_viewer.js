(function() {
    const canvas = document.getElementById('threeCanvas');
    if (!canvas) return;

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding || 3001;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // ── Scene ──
    const scene = new THREE.Scene();

    // ── Camera ──
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 0.8, 7.2);
    camera.lookAt(0, 0, 0);

    // ── Lights ──
    const ambient = new THREE.HemisphereLight(0xdff4ff, 0x203a56, 1.15);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight.position.set(5, 10, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x74c7ff, 0.75);
    fillLight.position.set(-7, 4, -6);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x8ee8d0, 0.8);
    rimLight.position.set(3, 5, -8);
    scene.add(rimLight);

    // ── Load GLB ──
    const loader = new THREE.GLTFLoader();
    loader.crossOrigin = 'anonymous';

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    let model = null;

    // Interaction / animation targets
    let targetRotY = 0;
    let currentRotY = 0;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let targetScale = 1;
    let currentScale = 1;
    let baseScale = 1;
    let defaultCameraZ = camera.position.z;

    // Rotation toggle
    let rotationEnabled = true;

    // Continuous rotation parameters
    let baseRotY = 0;            // absolute rotation driven by time
    let pointerOffsetRotY = 0;   // pointer-based offset applied on top
    const rotationPeriod = 20.0; // seconds per full revolution
    const rotationSpeed = (Math.PI * 2) / rotationPeriod;

    // Create a small UI button to toggle auto-rotation
    (function createRotateToggle(){
        const frameEl = canvas.closest('.model-frame') || document.getElementById('modelFrame') || document.body;
        if (!frameEl) return;
        const btn = document.createElement('button');
        btn.className = 'model-rotate-toggle';
        btn.title = 'Toggle auto-rotate';
        btn.type = 'button';
        btn.innerHTML = '<i class="fa-solid fa-rotate-right"></i>';
        frameEl.appendChild(btn);

        btn.addEventListener('click', () => {
            rotationEnabled = !rotationEnabled;
            btn.classList.toggle('off', !rotationEnabled);
            btn.innerHTML = rotationEnabled ? '<i class="fa-solid fa-rotate-right"></i>' : '<i class="fa-solid fa-pause"></i>';
        });
    })();

    // Zoom controls
    let cameraZ = camera.position.z;
    let targetCameraZ = cameraZ;
    // Allow closer zoom by reducing minCameraZ
    const minCameraZ = 2.8;
    const maxCameraZ = 14;

    (function createZoomControls(){
        const frameEl = canvas.closest('.model-frame') || document.getElementById('modelFrame') || document.body;
        if (!frameEl) return;

        const wrap = document.createElement('div');
        wrap.className = 'model-zoom-controls';

        const btnZoomOut = document.createElement('button');
        btnZoomOut.className = 'zoom-btn zoom-out';
        btnZoomOut.title = 'Zoom out';
        btnZoomOut.innerHTML = '<i class="fa-solid fa-minus"></i>';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '100';
        slider.value = '50';
        slider.className = 'zoom-slider';

        const btnZoomIn = document.createElement('button');
        btnZoomIn.className = 'zoom-btn zoom-in';
        btnZoomIn.title = 'Zoom in';
        btnZoomIn.innerHTML = '<i class="fa-solid fa-plus"></i>';

        wrap.appendChild(btnZoomOut);
        wrap.appendChild(slider);
        wrap.appendChild(btnZoomIn);
        frameEl.appendChild(wrap);

        function setFromSlider() {
            const t = slider.value / 100;
            // inverse mapping: 0 => maxZ (far), 1 => minZ (close)
            targetCameraZ = maxCameraZ - t * (maxCameraZ - minCameraZ);
        }

        slider.addEventListener('input', setFromSlider);
        btnZoomIn.addEventListener('click', () => {
            targetCameraZ = Math.max(minCameraZ, targetCameraZ - 0.4);
            slider.value = String(((maxCameraZ - targetCameraZ) / (maxCameraZ - minCameraZ)) * 100);
        });
        btnZoomOut.addEventListener('click', () => {
            targetCameraZ = Math.min(maxCameraZ, targetCameraZ + 0.4);
            slider.value = String(((maxCameraZ - targetCameraZ) / (maxCameraZ - minCameraZ)) * 100);
        });

        const reset = document.createElement('button');
        reset.className = 'model-reset-btn';
        reset.title = 'Reset model view';
        reset.type = 'button';
        reset.innerHTML = '<i class="fa-solid fa-crosshairs"></i>';
        wrap.appendChild(reset);
        reset.addEventListener('click', () => {
            targetCameraZ = defaultCameraZ;
            slider.value = '50';
            targetRotY = 0;
            baseRotY = 0;
            pointerOffsetRotY = 0;
        });

        // wheel to zoom
        canvas.addEventListener('wheel', (ev) => {
            ev.preventDefault();
            const delta = Math.sign(ev.deltaY);
            targetCameraZ = Math.min(maxCameraZ, Math.max(minCameraZ, targetCameraZ + delta * 0.4));
            slider.value = String(((maxCameraZ - targetCameraZ) / (maxCameraZ - minCameraZ)) * 100);
        }, { passive: false });
    })();

    loader.load(
        'ACLC3.glb',
        function(gltf) {
            model = gltf.scene;

            // Center the model inside the group
            const box    = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size   = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale  = 8 / maxDim;

            model.position.sub(center);
            model.scale.setScalar(scale);

            modelGroup.add(model);
            modelGroup.position.set(0, 0, 0);

            const fitDistance = (maxDim * scale) / (2 * Math.tan((camera.fov * Math.PI) / 360));
            camera.position.z = Math.max(4.8, fitDistance * 0.92);
            camera.lookAt(0, 0, 0);
            cameraZ = camera.position.z;
            targetCameraZ = cameraZ;
            defaultCameraZ = cameraZ;

            model.traverse(node => {
                if (!node.isMesh) return;
                node.castShadow = true;
                node.receiveShadow = true;
            });

            // initialize rotations/scales
            currentRotY = model.rotation.y;
            targetRotY  = model.rotation.y;
            currentScale = model.scale.x || 1;
            baseScale    = currentScale;
            targetScale  = currentScale;

            // Hide label once loaded
            const label = document.querySelector('.model-label');
            if (label) label.textContent = 'ACLC Fatima Campus';
            const loading = document.getElementById('modelLoading');
            if (loading) loading.classList.add('is-hidden');
        },
        function(progress) {
            // Loading progress
        },
        function(error) {
            console.warn('GLB load error:', error);
            const label = document.querySelector('.model-label');
            if (label) label.textContent = '3D model ready';
            const loading = document.getElementById('modelLoading');
            if (loading) loading.textContent = 'Preview unavailable';
        }
    );

    // ── Resize handler ──
    function resize() {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        if (canvas.width !== w || canvas.height !== h) {
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
    }

    // ── Float animation (improved) ──
    const clock = new THREE.Clock();
    let floatTime = 0;

    // pointer interaction
    let isPointerOver = false;
    canvas.addEventListener('pointermove', (e) => {
        const r = canvas.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width) * 2 - 1; // -1..1
        const ny = ((e.clientY - r.top) / r.height) * 2 - 1; // -1..1
        // tilt targets (subtle)
        targetTiltY = nx * 0.18;
        targetTiltX = ny * 0.12;
        // pointer yaw offset (applied on top of base rotation)
        pointerOffsetRotY = nx * 0.25;
    });

    canvas.addEventListener('pointerenter', () => {
        isPointerOver = true;
        targetScale = baseScale * 1.035;
    });
    canvas.addEventListener('pointerleave', () => {
        isPointerOver = false;
        targetTiltX = targetTiltY = 0;
        targetRotY = 0;
        targetScale = baseScale;
    });

    // easing helper
    const lerp = (a, b, t) => a + (b - a) * t;

    // ── Animate ──
    function animate() {
        requestAnimationFrame(animate);
        resize();

        const dt = clock.getDelta();
        floatTime += dt * 0.9; // slower natural float

            if (model) {
                // base continuous rotation (360° over rotationPeriod) when enabled
                if (rotationEnabled) {
                    baseRotY += rotationSpeed * dt;
                }

                // target rotation is base rotation + pointer offset
                targetRotY = baseRotY + pointerOffsetRotY;

                // ease rotation
                currentRotY = lerp(currentRotY, targetRotY, 0.06);
                // apply to model for consistent tilt + rotation
                model.rotation.y = currentRotY;

            // tilt (x rotation) eased
            model.rotation.x = lerp(model.rotation.x || 0, targetTiltX, 0.08);
            model.rotation.z = lerp(model.rotation.z || 0, -targetTiltY * 0.08, 0.06);

            // float up/down with layered sine for organic motion
            const bob = Math.sin(floatTime * 1.0) * 0.08 + Math.sin(floatTime * 0.37) * 0.03;
            model.position.y = bob;

            // scale hover effect
            currentScale = lerp(currentScale, targetScale, 0.06);
            model.scale.setScalar(currentScale);
        }
        // smooth camera zoom
        cameraZ = lerp(cameraZ, targetCameraZ, 0.12);
        camera.position.z = cameraZ;

        renderer.render(scene, camera);
    }

    animate();
})();