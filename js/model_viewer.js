(function() {
    const canvas = document.getElementById('threeCanvas');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding || 3001;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
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

    const loader = new THREE.GLTFLoader();
    loader.crossOrigin = 'anonymous';

    const modelGroup = new THREE.Group();
    modelGroup.position.set(5, -5, 0);
    scene.add(modelGroup);

    const modelLoading = document.getElementById('modelLoading');
    const modelLabel = document.getElementById('modelLabel');
    const navigationStatus = document.getElementById('modelNavigationStatus');
    const models = {
        campus: { src: '3D/Aclc_Fatima_Campus.glb', label: 'ACLC Fatima Campus' },
        room101: { src: '3D/Floor 1/Audio Comission Room 101.glb', label: 'Room 101', aliases: ['Audio Commission Room', 'Audio Commission', 'Audio Comission Room'] },
        room102: { src: '3D/Floor 1/Collage Faculty Room 102.glb', label: 'Room 102', aliases: ['College Faculty Room', 'Collage Faculty Room', 'Faculty Room'] },
        room103: { src: '3D/Floor 1/SHS Faculity Room 103.glb', label: 'Room 103', aliases: ['SHS Faculty Room', 'SHS Faculity Room', 'Senior High School Faculty Room'] },
        room104: { src: '3D/Floor 1/Admission Office 104.glb', label: 'Room 104', aliases: ['Admission Office', 'Admissions Office'] },
        room105: { src: '3D/Floor 1/Conference Room 105.glb', label: 'Room 105', aliases: ['Conference Room'] },
        room106: { src: '3D/Floor 1/Finance Room 106.glb', label: 'Room 106', aliases: ['Finance Room', 'Finance Office'] },
        room107: { src: '3D/Floor 1/School Director Room 107.glb', label: 'Room 107', aliases: ['School Director Room', 'School Director', 'Director Office', 'Director Room'] },
        room108: { src: '3D/Floor 1/Managing Room 108.glb', label: 'Room 108', aliases: ['Managing Room', 'Management Room'] },
        room109: { src: '3D/Floor 1/Guidance Office Room 109.glb', label: 'Room 109', aliases: ['Guidance Office', 'Guidance Room'] },
        room110: { src: '3D/Floor 1/Classroom 110.glb', label: 'Room 110', aliases: ['Classroom 110'] }
    };

    let model = null;
    let activeModel = 'campus';
    let requestId = 0;
    let cameraDistance = 7.2;
    let targetCameraDistance = cameraDistance;
    let defaultCameraDistance = cameraDistance;
    let minCameraDistance = 2.8;
    let maxCameraDistance = 14;
    let cameraAzimuth = 0;
    let cameraElevation = 0.1;
    let defaultCameraElevation = cameraElevation;
    let zoomSlider = null;
    let renderFrame = null;
    let dragPointerId = null;
    let previousPointerX = 0;
    let previousPointerY = 0;

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function updateCamera() {
        const horizontalDistance = cameraDistance * Math.cos(cameraElevation);
        camera.position.set(
            modelGroup.position.x + horizontalDistance * Math.sin(cameraAzimuth),
            modelGroup.position.y + cameraDistance * Math.sin(cameraElevation),
            modelGroup.position.z + horizontalDistance * Math.cos(cameraAzimuth)
        );
        camera.lookAt(modelGroup.position);
    }

    function syncZoomSlider() {
        if (!zoomSlider) return;
        const ratio = Math.log(maxCameraDistance / clamp(targetCameraDistance, minCameraDistance, maxCameraDistance))
            / Math.log(maxCameraDistance / minCameraDistance);
        zoomSlider.value = String(Math.round(ratio * 100));
    }

    function setZoom(distance) {
        targetCameraDistance = clamp(distance, minCameraDistance, maxCameraDistance);
        syncZoomSlider();
        render();
    }

    function normalizeRoomName(value) {
        return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    }

    function findRoomModel(room) {
        const query = normalizeRoomName(room);
        const roomMatch = query.match(/\b(?:room|classroom)\s*#?\s*(\d{3})\b/)
            || query.match(/\b(\d{3})\b/);
        if (roomMatch) {
            const modelKey = `room${Number(roomMatch[1])}`;
            return models[modelKey] ? modelKey : null;
        }

        const modelKeys = Object.keys(models);
        const exactMatch = modelKeys.find(key => {
            const config = models[key];
            return config.aliases && config.aliases.some(alias => query === normalizeRoomName(alias));
        });
        if (exactMatch) return exactMatch;

        return modelKeys.find(key => {
            const config = models[key];
            return config.aliases && config.aliases.some(alias => query.includes(normalizeRoomName(alias)));
        }) || null;
    }

    function disposeModel(object) {
        object.traverse(node => {
            if (!node.isMesh) return;
            if (node.geometry) node.geometry.dispose();
            const materials = Array.isArray(node.material) ? node.material : [node.material];
            materials.forEach(material => {
                if (!material) return;
                Object.keys(material).forEach(key => {
                    const value = material[key];
                    if (value && value.isTexture) value.dispose();
                });
                material.dispose();
            });
        });
    }

    function loadModel(key) {
        const config = models[key];
        if (!config) return;

        const currentRequestId = ++requestId;
        if (navigationStatus) navigationStatus.textContent = `Loading ${config.label}…`;
        if (modelLoading) {
            modelLoading.innerHTML = '<span></span> Loading 3D view';
            modelLoading.classList.remove('is-hidden');
        }

        loader.load(config.src, gltf => {
            if (currentRequestId !== requestId) {
                disposeModel(gltf.scene);
                return;
            }

            const nextModel = gltf.scene;
            const box = new THREE.Box3().setFromObject(nextModel);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDimension = Math.max(size.x, size.y, size.z);
            if (!Number.isFinite(maxDimension) || maxDimension <= 0) {
                if (navigationStatus) navigationStatus.textContent = `Could not display ${config.label}.`;
                if (modelLoading) modelLoading.classList.add('is-hidden');
                return;
            }

            nextModel.position.sub(center);
            const scale = 50 / maxDimension;
            nextModel.scale.setScalar(scale);
            nextModel.traverse(node => {
                if (!node.isMesh) return;
                node.castShadow = true;
                node.receiveShadow = true;
            });

            if (model) {
                modelGroup.remove(model);
                disposeModel(model);
            }
            model = nextModel;
            modelGroup.add(model);
            activeModel = key;
            cameraAzimuth = 0;

            const fitDistance = (maxDimension * scale) / (2 * Math.tan((camera.fov * Math.PI) / 360));
            minCameraDistance = Math.max(0.5, fitDistance * 0.45);
            maxCameraDistance = Math.max(minCameraDistance * 2, fitDistance * 3.5);
            defaultCameraDistance = fitDistance * 1.1;
            defaultCameraElevation = Math.atan2(0.8, defaultCameraDistance);
            targetCameraDistance = defaultCameraDistance;
            cameraDistance = defaultCameraDistance;
            cameraElevation = defaultCameraElevation;
            syncZoomSlider();

            if (modelLabel) modelLabel.textContent = config.label;
            if (navigationStatus) navigationStatus.textContent = `${config.label} · drag to rotate 360°`;
            if (modelLoading) modelLoading.classList.add('is-hidden');
            render();
        }, undefined, error => {
            if (currentRequestId !== requestId) return;
            console.warn(`3D model load error (${config.src}):`, error);
            if (navigationStatus) navigationStatus.textContent = `Could not load ${config.label}. Please try again.`;
            if (modelLoading) modelLoading.classList.add('is-hidden');
        });
    }

    window.CampusModelViewer = {
        isRoomAvailable(room) {
            return findRoomModel(room) !== null;
        },
        showRoom(room) {
            const modelKey = findRoomModel(room);
            if (!modelKey) {
                if (navigationStatus) navigationStatus.textContent = `No 3D model is available for ${String(room || 'that room')} yet.`;
                return false;
            }

            loadModel(modelKey);
            return true;
        },
        showCampus() {
            loadModel('campus');
        }
    };

    const frame = canvas.closest('.model-frame') || document.getElementById('modelFrame');
    if (frame) {
        const controls = document.createElement('div');
        controls.className = 'model-zoom-controls';

        const zoomOut = document.createElement('button');
        zoomOut.className = 'zoom-btn zoom-out';
        zoomOut.type = 'button';
        zoomOut.title = 'Zoom out';
        zoomOut.setAttribute('aria-label', 'Zoom out');
        zoomOut.innerHTML = '<i class="fa-solid fa-minus"></i>';

        zoomSlider = document.createElement('input');
        zoomSlider.type = 'range';
        zoomSlider.min = '0';
        zoomSlider.max = '100';
        zoomSlider.value = '50';
        zoomSlider.className = 'zoom-slider';
        zoomSlider.setAttribute('aria-label', '3D view zoom');

        const zoomIn = document.createElement('button');
        zoomIn.className = 'zoom-btn zoom-in';
        zoomIn.type = 'button';
        zoomIn.title = 'Zoom in';
        zoomIn.setAttribute('aria-label', 'Zoom in');
        zoomIn.innerHTML = '<i class="fa-solid fa-plus"></i>';

        const reset = document.createElement('button');
        reset.className = 'model-reset-btn';
        reset.type = 'button';
        reset.title = 'Reset 3D view';
        reset.setAttribute('aria-label', 'Reset 3D view');
        reset.innerHTML = '<i class="fa-solid fa-crosshairs"></i>';

        controls.append(zoomOut, zoomSlider, zoomIn, reset);
        frame.appendChild(controls);

        zoomSlider.addEventListener('input', () => {
            const t = Number(zoomSlider.value) / 100;
            setZoom(maxCameraDistance * Math.pow(minCameraDistance / maxCameraDistance, t));
        });
        zoomIn.addEventListener('click', () => setZoom(targetCameraDistance * 0.85));
        zoomOut.addEventListener('click', () => setZoom(targetCameraDistance / 0.85));
        reset.addEventListener('click', () => {
            cameraAzimuth = 0;
            cameraElevation = defaultCameraElevation;
            setZoom(defaultCameraDistance);
        });
    }

    window.addEventListener('campus:model-open', () => {
        if (activeModel !== 'campus') {
            loadModel('campus');
            return;
        }
        cameraAzimuth = 0;
        cameraElevation = defaultCameraElevation;
        setZoom(defaultCameraDistance);
    });

    canvas.addEventListener('pointerdown', event => {
        if (event.button !== 0 || dragPointerId !== null) return;
        dragPointerId = event.pointerId;
        previousPointerX = event.clientX;
        previousPointerY = event.clientY;
        canvas.classList.add('is-dragging');
        canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener('pointermove', event => {
        if (event.pointerId !== dragPointerId) return;
        cameraAzimuth -= (event.clientX - previousPointerX) * 0.008;
        cameraElevation = clamp(cameraElevation + (event.clientY - previousPointerY) * 0.006, -0.5, 1.25);
        previousPointerX = event.clientX;
        previousPointerY = event.clientY;
        render();
    });
    function stopOrbit(event) {
        if (event.pointerId !== dragPointerId) return;
        dragPointerId = null;
        canvas.classList.remove('is-dragging');
        if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    }
    canvas.addEventListener('pointerup', stopOrbit);
    canvas.addEventListener('pointercancel', stopOrbit);
    canvas.addEventListener('wheel', event => {
        event.preventDefault();
        setZoom(targetCameraDistance * Math.exp(Math.sign(event.deltaY) * 0.12));
    }, { passive: false });

    function resize() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (!width || !height) return false;
        if (canvas.width !== width || canvas.height !== height) {
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
        return true;
    }

    function render() {
        if (renderFrame !== null) return;
        renderFrame = requestAnimationFrame(() => {
            renderFrame = null;
            if (!resize()) return;

            cameraDistance += (targetCameraDistance - cameraDistance) * 0.12;
            if (Math.abs(targetCameraDistance - cameraDistance) < 0.01) cameraDistance = targetCameraDistance;
            updateCamera();
            renderer.render(scene, camera);

            if (cameraDistance !== targetCameraDistance) render();
        });
    }

    if (window.ResizeObserver) {
        new ResizeObserver(render).observe(canvas);
    } else {
        window.addEventListener('resize', render);
    }
    loadModel('campus');
    render();
})();
