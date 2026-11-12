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

    let defaultCameraZ = camera.position.z;

    // Zoom controls
    let cameraZ = camera.position.z;
    let targetCameraZ = cameraZ;
    let minCameraZ = 2.8;
    let maxCameraZ = 14;
    let zoomSlider = null;

    function clampCameraZ(distance) {
        return Math.min(maxCameraZ, Math.max(minCameraZ, distance));
    }

    function syncZoomSlider() {
        if (!zoomSlider) return;
        const ratio = Math.log(maxCameraZ / clampCameraZ(targetCameraZ)) / Math.log(maxCameraZ / minCameraZ);
        zoomSlider.value = String(Math.round(ratio * 100));
    }

    function setZoom(distance) {
        targetCameraZ = clampCameraZ(distance);
        syncZoomSlider();
        render();
    }

    (function createZoomControls(){
        const frameEl = canvas.closest('.model-frame') || document.getElementById('modelFrame') || document.body;
        if (!frameEl) return;

        const wrap = document.createElement('div');
        wrap.className = 'model-zoom-controls';

        const btnZoomOut = document.createElement('button');
        btnZoomOut.className = 'zoom-btn zoom-out';
        btnZoomOut.title = 'Zoom out';
        btnZoomOut.innerHTML = '<i class="fa-solid fa-minus"></i>';

        zoomSlider = document.createElement('input');
        zoomSlider.type = 'range';
        zoomSlider.min = '0';
        zoomSlider.max = '100';
        zoomSlider.value = '50';
        zoomSlider.className = 'zoom-slider';

        const btnZoomIn = document.createElement('button');
        btnZoomIn.className = 'zoom-btn zoom-in';
        btnZoomIn.title = 'Zoom in';
        btnZoomIn.innerHTML = '<i class="fa-solid fa-plus"></i>';

        wrap.appendChild(btnZoomOut);
        wrap.appendChild(zoomSlider);
        wrap.appendChild(btnZoomIn);
        frameEl.appendChild(wrap);

        function setFromSlider() {
            const t = zoomSlider.value / 100;
            // Logarithmic mapping keeps zoom responsive across differently sized models.
            setZoom(maxCameraZ * Math.pow(minCameraZ / maxCameraZ, t));
        }

        zoomSlider.addEventListener('input', setFromSlider);
        btnZoomIn.addEventListener('click', () => {
            setZoom(targetCameraZ * 0.85);
        });
        btnZoomOut.addEventListener('click', () => {
            setZoom(targetCameraZ / 0.85);
        });

        const reset = document.createElement('button');
        reset.className = 'model-reset-btn';
        reset.title = 'Reset model view';
        reset.type = 'button';
        reset.innerHTML = '<i class="fa-solid fa-crosshairs"></i>';
        wrap.appendChild(reset);
        reset.addEventListener('click', () => {
            setZoom(defaultCameraZ);
        });

        // wheel to zoom
        canvas.addEventListener('wheel', (ev) => {
            ev.preventDefault();
            setZoom(targetCameraZ * Math.exp(Math.sign(ev.deltaY) * 0.12));
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
            const scale  = 50 / maxDim;

            model.position.sub(center);
            model.scale.setScalar(scale);

            modelGroup.add(model);
            modelGroup.position.set(5, -5, 0);

            const fitDistance = (maxDim * scale) / (2 * Math.tan((camera.fov * Math.PI) / 360));
            minCameraZ = Math.max(0.5, fitDistance * 0.45);
            maxCameraZ = Math.max(minCameraZ * 2, fitDistance * 3.5);
            cameraZ = fitDistance * 1.1;
            targetCameraZ = cameraZ;
            defaultCameraZ = cameraZ;
            camera.position.set(modelGroup.position.x, modelGroup.position.y + 0.8, modelGroup.position.z + cameraZ);
            camera.lookAt(modelGroup.position);
            syncZoomSlider();

            model.traverse(node => {
                if (!node.isMesh) return;
                node.castShadow = true;
                node.receiveShadow = true;
            });

            // Hide label once loaded
            const label = document.querySelector('.model-label');
            if (label) label.textContent = 'ACLC Fatima Campus';
            const loading = document.getElementById('modelLoading');
            if (loading) loading.classList.add('is-hidden');
            render();
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
        if (!w || !h) return false;
        if (canvas.width !== w || canvas.height !== h) {
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
        return true;
    }

    const lerp = (a, b, t) => a + (b - a) * t;
    let renderFrame = null;

    function render() {
        if (renderFrame !== null) return;
        renderFrame = requestAnimationFrame(() => {
            renderFrame = null;
            if (!resize()) return;

            cameraZ = lerp(cameraZ, targetCameraZ, 0.12);
            if (Math.abs(targetCameraZ - cameraZ) < 0.01) cameraZ = targetCameraZ;
            camera.position.z = modelGroup.position.z + cameraZ;
            renderer.render(scene, camera);

            if (cameraZ !== targetCameraZ) render();
        });
    }

    if (window.ResizeObserver) {
        new ResizeObserver(render).observe(canvas);
    } else {
        window.addEventListener('resize', render);
    }
    render();
})();